import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { nowIso8601 } from './time.js'

/**
 * Opens (creating it if needed) the SQLite database, applies the schema and
 * seeds the demo content on a brand new file.
 *
 * `node:sqlite` ships with Electron's bundled Node, so the app has no native
 * module to rebuild for the Electron ABI — that is why this is not
 * better-sqlite3 or any other compiled driver.
 */
export function open(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      folder TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS document_tags (
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (document_id, tag_id)
    );
  `)

  seedDefaultData(db)
  return db
}

/**
 * Demo content shown on a fresh install (empty `documents` table) so a
 * first-time user sees folders/tags/documents grouped in the sidebar instead
 * of a blank app. Never runs again once any document exists.
 */
const DEFAULT_DOCUMENTS = [
  {
    name: 'Getting Started',
    folder: 'guides',
    tags: ['guide', 'tutorial'],
    content: `{
  "title": "Getting Started with AC JSON Storage",
  "steps": [
    "Create a document",
    "Organize it into a folder",
    "Add tags for quick filtering",
    "Save and reopen anytime"
  ]
}`,
  },
  {
    name: 'API Reference',
    folder: 'guides',
    tags: ['api', 'guide', 'reference'],
    content: `{
  "baseUrl": "/api/documents",
  "endpoints": [
    {
      "method": "GET",
      "path": "/",
      "description": "List documents"
    },
    {
      "method": "POST",
      "path": "/",
      "description": "Create a document"
    },
    {
      "method": "PUT",
      "path": "/:id",
      "description": "Update a document"
    },
    {
      "method": "DELETE",
      "path": "/:id",
      "description": "Delete a document"
    }
  ]
}`,
  },
  {
    name: 'FAQ',
    folder: 'guides',
    tags: ['faq', 'guide'],
    content: `{
  "questions": [
    {
      "q": "Is my data stored locally?",
      "a": "Yes, everything is stored in a local SQLite database."
    },
    {
      "q": "Where is the database kept?",
      "a": "In your user app-data directory. Set DB_PATH to put it somewhere else."
    }
  ]
}`,
  },
  {
    name: 'User Profile Example',
    folder: 'examples',
    tags: ['example', 'user', 'json'],
    content: `{
  "id": "usr_001",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "roles": [
    "admin",
    "editor"
  ],
  "active": true
}`,
  },
  {
    name: 'Product Catalog',
    folder: 'examples',
    tags: ['example', 'catalog', 'ecommerce'],
    content: `{
  "products": [
    {
      "sku": "SKU-100",
      "name": "Wireless Mouse",
      "price": 19.99
    },
    {
      "sku": "SKU-200",
      "name": "Mechanical Keyboard",
      "price": 59.99
    }
  ]
}`,
  },
  {
    name: 'Todo List',
    folder: 'examples',
    tags: ['example', 'todo', 'productivity'],
    content: `{
  "todos": [
    {
      "text": "Write documentation",
      "done": false
    },
    {
      "text": "Add default demo data",
      "done": true
    },
    {
      "text": "Ship v1",
      "done": false
    }
  ]
}`,
  },
  {
    name: 'Color Palette',
    folder: 'examples',
    tags: ['example', 'design', 'colors'],
    content: `{
  "palette": {
    "primary": "#0969da",
    "success": "#1a7f37",
    "danger": "#cf222e",
    "background": "#ffffff"
  }
}`,
  },
  {
    name: 'App Config',
    folder: 'config',
    tags: ['config', 'settings'],
    content: `{
  "appName": "AC JSON Storage",
  "port": 3000,
  "debug": false
}`,
  },
  {
    name: 'Feature Flags',
    folder: 'config',
    tags: ['config', 'flags', 'experiment'],
    content: `{
  "flags": {
    "darkMode": true,
    "advancedSearch": true,
    "betaEditor": false
  }
}`,
  },
  {
    name: 'Environment Variables',
    folder: 'config',
    tags: ['config', 'env', 'changelog'],
    content: `{
  "DB_PATH": "/data/db.sqlite",
  "PORT": "3000",
  "NODE_ENV": "production"
}`,
  },
]

/**
 * Bumped once the demo data has been dealt with, so seeding happens exactly
 * once in a database's lifetime. Keying off "is the table empty?" alone would
 * bring the demo documents back the next time the app starts after the user
 * deleted everything.
 */
const SEEDED_USER_VERSION = 1

function seedDefaultData(db) {
  const { user_version: userVersion } = db.prepare('PRAGMA user_version').get()
  if (userVersion >= SEEDED_USER_VERSION) return

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM documents').get()
  if (count > 0) {
    // A database from a build that predates the marker; it has real data
    // already, so just record that seeding is done.
    db.exec(`PRAGMA user_version = ${SEEDED_USER_VERSION}`)
    return
  }

  const insertDoc = db.prepare(
    'INSERT INTO documents (id, name, folder, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  )
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)')
  const findTag = db.prepare('SELECT id FROM tags WHERE name = ?')
  const linkTag = db.prepare(
    'INSERT OR IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)',
  )

  const now = nowIso8601()
  db.exec('BEGIN')
  try {
    for (const doc of DEFAULT_DOCUMENTS) {
      const id = randomUUID()
      insertDoc.run(id, doc.name, doc.folder, doc.content, now, now)
      for (const tagName of doc.tags) {
        insertTag.run(tagName)
        linkTag.run(id, findTag.get(tagName).id)
      }
    }
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }

  db.exec(`PRAGMA user_version = ${SEEDED_USER_VERSION}`)
}
