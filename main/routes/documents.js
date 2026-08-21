import express from 'express'
import { randomUUID } from 'node:crypto'

import { exportFileName, nowIso8601 } from '../time.js'

export const EXPORT_FORMAT = 'ac-json-storage-export'
export const EXPORT_VERSION = 1

/** Where loose JSON files land when the user has not said otherwise. */
export const DEFAULT_IMPORT_FOLDER = 'uncategorized'

/** 20 MB is plenty for a single document; imports get their own ceiling below. */
const jsonBody = express.json({ limit: '20mb' })
/** Importing a folder full of JSON files easily exceeds that. */
const bigJsonBody = express.json({ limit: '512mb' })
const bigTextBody = express.text({ type: () => true, limit: '512mb' })

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }

  static notFound() {
    return new ApiError(404, 'Document not found')
  }
}

function documentTags(db, documentId) {
  return db
    .prepare(
      `SELECT t.name FROM tags t
       JOIN document_tags dt ON dt.tag_id = t.id
       WHERE dt.document_id = ?
       ORDER BY t.name`,
    )
    .all(documentId)
    .map((row) => row.name)
}

function setDocumentTags(db, documentId, tags) {
  db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(documentId)

  const names = [...new Set((tags ?? []).map((t) => String(t).trim()).filter(Boolean))]
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)')
  const findTag = db.prepare('SELECT id FROM tags WHERE name = ?')
  const linkTag = db.prepare(
    'INSERT OR IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)',
  )
  for (const name of names) {
    insertTag.run(name)
    linkTag.run(documentId, findTag.get(name).id)
  }
}

function commaList(value) {
  return typeof value === 'string' ? value.split(',').filter(Boolean) : []
}

/** Runs `fn` inside a transaction, rolling back if it throws. */
function transaction(db, fn) {
  db.exec('BEGIN')
  try {
    const result = fn()
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

/** `ids` narrows the export to a selection; leaving it out exports everything. */
function collectDocuments(db, ids) {
  const where = ids ? ` WHERE id IN (${ids.map(() => '?').join(', ')})` : ''
  return db
    .prepare(
      `SELECT id, name, folder, content, created_at, updated_at
       FROM documents${where} ORDER BY created_at DESC`,
    )
    .all(...(ids ?? []))
    .map((doc) => ({ ...doc, tags: documentTags(db, doc.id) }))
}

function buildExport(db, ids) {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exported_at: nowIso8601(),
    documents: collectDocuments(db, ids),
  }
}

/**
 * `My Doc` -> `My Doc.json`, minus the characters no filesystem wants. The
 * document name is user input and goes straight into a save dialog, so it is
 * stripped of path separators rather than trusted.
 */
function jsonFileName(name) {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/^\.+/, '')
    .replace(/[. ]+$/, '')
    .trim()
  const base = cleaned || 'document'
  return base.toLowerCase().endsWith('.json') ? base : `${base}.json`
}

/**
 * @param db          open `node:sqlite` handle
 * @param saveFile    `(defaultName, bytes) => Promise<string|null>` — raises the
 *                    native save dialog and writes the file, answering the
 *                    chosen path or `null` when the user dismissed it. Lives in
 *                    the Electron main process because the renderer cannot
 *                    write to disk itself.
 */
export function documentsRouter(db, { saveFile }) {
  const router = express.Router()

  // GET /api/documents?search=&folders=&tags=&fields=name,folder,tag
  router.get('/', (req, res) => {
    const searchFields =
      typeof req.query.fields === 'string' ? req.query.fields.split(',') : ['name']
    const folderList = commaList(req.query.folders)
    const tagList = commaList(req.query.tags)
    const search = typeof req.query.search === 'string' ? req.query.search : ''

    let sql =
      'SELECT DISTINCT d.id, d.name, d.folder, d.created_at, d.updated_at FROM documents d'
    const conditions = []
    // Pushed in the same order the placeholders appear in the assembled SQL.
    const params = []

    if (tagList.length) {
      sql += ' JOIN document_tags dt ON dt.document_id = d.id JOIN tags t ON t.id = dt.tag_id'
      conditions.push(`t.name IN (${tagList.map(() => '?').join(', ')})`)
      params.push(...tagList)
    }

    if (search) {
      const like = `%${search}%`
      const searchConditions = []
      if (searchFields.includes('name')) {
        searchConditions.push('d.name LIKE ?')
        params.push(like)
      }
      if (searchFields.includes('folder')) {
        searchConditions.push('d.folder LIKE ?')
        params.push(like)
      }
      if (searchFields.includes('tag')) {
        // Separate aliases so this does not collide with the exact-match
        // tag-list JOIN above when both are active at once.
        searchConditions.push(
          `EXISTS (SELECT 1 FROM document_tags dt2 JOIN tags t2 ON t2.id = dt2.tag_id
                   WHERE dt2.document_id = d.id AND t2.name LIKE ?)`,
        )
        params.push(like)
      }
      if (searchConditions.length) {
        conditions.push(`(${searchConditions.join(' OR ')})`)
      }
    }

    if (folderList.length) {
      conditions.push(`d.folder IN (${folderList.map(() => '?').join(', ')})`)
      params.push(...folderList)
    }

    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
    sql += ' ORDER BY d.created_at DESC'

    const documents = db
      .prepare(sql)
      .all(...params)
      .map((doc) => ({ ...doc, tags: documentTags(db, doc.id) }))

    res.json(documents)
  })

  router.get('/folders', (_req, res) => {
    const folders = db
      .prepare("SELECT DISTINCT folder FROM documents WHERE folder != '' ORDER BY folder")
      .all()
      .map((row) => row.folder)
    res.json(folders)
  })

  router.get('/tags', (_req, res) => {
    const tags = db
      .prepare(
        `SELECT DISTINCT t.name FROM tags t
         JOIN document_tags dt ON dt.tag_id = t.id
         ORDER BY t.name`,
      )
      .all()
      .map((row) => row.name)
    res.json(tags)
  })

  // GET /api/documents/export — the whole store as one JSON payload, for `curl`
  // and for anything that would rather stream it than have a file written.
  router.get('/export', (_req, res) => {
    res.setHeader('Content-Disposition', `attachment; filename="${exportFileName()}"`)
    res.json(buildExport(db))
  })

  // POST /api/documents/export — asks the user where to put the file through a
  // native save dialog, then writes it there. Answers `{cancelled: true}` if the
  // dialog was dismissed, which is a normal outcome rather than an error.
  //
  // An optional `{ids: [...]}` body narrows it to a selection; with no body it
  // writes the whole store, which is what `curl` and the GET route do.
  router.post('/export', jsonBody, async (req, res, next) => {
    try {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids : null
      if (ids && ids.length === 0) {
        throw new ApiError(400, 'ids must not be empty')
      }
      const payload = buildExport(db, ids)
      const body = Buffer.from(`${JSON.stringify(payload, null, 2)}\n`)
      const path = await saveFile(exportFileName(), body)
      if (!path) {
        res.json({ cancelled: true })
        return
      }
      res.json({ path, count: payload.documents.length })
    } catch (err) {
      next(err)
    }
  })

  // POST /api/documents/export-file — writes a single document out as a plain
  // `.json` file the user picks. It takes the text rather than an id, so the
  // same endpoint serves the sidebar (the stored copy) and an editor pane
  // (what is on screen, unsaved edits included).
  router.post('/export-file', jsonBody, async (req, res, next) => {
    try {
      const content = req.body?.content ?? ''
      const path = await saveFile(jsonFileName(req.body?.name ?? ''), Buffer.from(content))
      if (!path) {
        res.json({ cancelled: true })
        return
      }
      res.json({ path })
    } catch (err) {
      next(err)
    }
  })

  // POST /api/documents/import?mode=merge|replace
  router.post('/import', bigTextBody, (req, res) => {
    const mode = req.query.mode ?? 'merge'
    if (mode !== 'merge' && mode !== 'replace') {
      throw new ApiError(400, "mode must be 'merge' or 'replace'")
    }

    let file
    try {
      file = JSON.parse(req.body)
    } catch (err) {
      throw new ApiError(400, `Invalid JSON: ${err.message}`)
    }
    if (file?.format !== EXPORT_FORMAT) {
      throw new ApiError(400, 'Not an AC JSON Storage export file')
    }
    if (file.version > EXPORT_VERSION) {
      throw new ApiError(400, 'This export was written by a newer version of the app')
    }

    const result = transaction(db, () => {
      if (mode === 'replace') {
        // `document_tags` rows go with them via ON DELETE CASCADE.
        db.prepare('DELETE FROM documents').run()
      }

      const exists = db.prepare('SELECT 1 FROM documents WHERE id = ?')
      const insert = db.prepare(
        'INSERT INTO documents (id, name, folder, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )

      let imported = 0
      let skipped = 0
      for (const doc of file.documents ?? []) {
        if (mode === 'merge' && exists.get(doc.id)) {
          skipped += 1
          continue
        }
        try {
          insert.run(doc.id, doc.name, doc.folder, doc.content, doc.created_at, doc.updated_at)
        } catch (err) {
          // A collision here means the file itself lists the same id twice —
          // bad input, not a server fault. The transaction unwinds the rest.
          if (String(err.message).includes('UNIQUE constraint')) {
            throw new ApiError(400, 'Export file contains duplicate document ids')
          }
          throw err
        }
        setDocumentTags(db, doc.id, doc.tags)
        imported += 1
      }
      return { imported, skipped, mode }
    })

    res.json(result)
  })

  // POST /api/documents/import-files — takes loose `.json` files picked off
  // disk. They carry no ids, timestamps or tags, so each one becomes a brand new
  // document filed under a single folder.
  router.post('/import-files', bigJsonBody, (req, res) => {
    const folder = (req.body?.folder ?? '').trim() || DEFAULT_IMPORT_FOLDER

    const result = transaction(db, () => {
      const insert = db.prepare(
        'INSERT INTO documents (id, name, folder, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      let imported = 0
      let skipped = 0
      for (const file of req.body?.files ?? []) {
        const name = (file.name ?? '').trim()
        if (!name) {
          skipped += 1
          continue
        }
        const now = nowIso8601()
        insert.run(randomUUID(), name, folder, file.content ?? '', now, now)
        imported += 1
      }
      return { imported, skipped, folder }
    })

    res.json(result)
  })

  router.get('/:id', (req, res) => {
    const document = db
      .prepare(
        'SELECT id, name, folder, content, created_at, updated_at FROM documents WHERE id = ?',
      )
      .get(req.params.id)
    if (!document) throw ApiError.notFound()
    res.json({ ...document, tags: documentTags(db, document.id) })
  })

  router.post('/', jsonBody, (req, res) => {
    const name = (req.body?.name ?? '').trim()
    if (!name) throw new ApiError(400, 'name is required')
    const folder = (req.body?.folder ?? '').trim()
    const content = req.body?.content ?? ''
    const tags = req.body?.tags ?? []

    const id = randomUUID()
    const now = nowIso8601()

    transaction(db, () => {
      db.prepare(
        'INSERT INTO documents (id, name, folder, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(id, name, folder, content, now, now)
      setDocumentTags(db, id, tags)
    })

    res.status(201).json({ id, name, folder, content, created_at: now, updated_at: now, tags })
  })

  // The response deliberately omits `created_at`: an update never changes it,
  // so the caller already has whatever it was.
  router.put('/:id', jsonBody, (req, res) => {
    const id = req.params.id
    if (!db.prepare('SELECT 1 FROM documents WHERE id = ?').get(id)) throw ApiError.notFound()

    const name = (req.body?.name ?? '').trim()
    if (!name) throw new ApiError(400, 'name is required')
    const folder = (req.body?.folder ?? '').trim()
    const content = req.body?.content ?? ''
    const tags = req.body?.tags ?? []
    const now = nowIso8601()

    transaction(db, () => {
      db.prepare(
        'UPDATE documents SET name = ?, folder = ?, content = ?, updated_at = ? WHERE id = ?',
      ).run(name, folder, content, now, id)
      setDocumentTags(db, id, tags)
    })

    res.json({ id, name, folder, content, tags, updated_at: now })
  })

  // DELETE /api/documents — wipes the store. `document_tags` rows follow via
  // ON DELETE CASCADE; the `tags` table keeps its rows, which stay invisible
  // because every tag listing joins through `document_tags`.
  router.delete('/', (_req, res) => {
    const { changes } = db.prepare('DELETE FROM documents').run()
    res.json({ deleted: Number(changes) })
  })

  router.delete('/:id', (req, res) => {
    const { changes } = db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id)
    if (Number(changes) === 0) throw ApiError.notFound()
    res.status(204).end()
  })

  return router
}

export { ApiError }
