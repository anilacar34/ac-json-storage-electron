// Import/export UI.
//
// Kept out of app.js on purpose: the module injects its own markup, styles
// and translations, and picks up language changes by watching the `lang`
// attribute that app.js's setLang() writes onto <html>.

const TEXT = {
  en: {
    export: 'Export',
    import: 'Add files',
    importHelp: 'Add loose .json files as new documents',
    restore: 'Restore',
    restoreHelp: 'Restore documents from an AC JSON Storage backup file',
    exportTitle: 'Export documents',
    exportSearch: 'Search documents…',
    selectAll: 'Select all',
    noFolder: '(no folder)',
    selectedCount: '{selected} of {total} selected',
    hiddenSelected: '{count} of them are outside the search',
    exportConfirm: 'Export {count}',
    exportNoMatch: 'No documents match.',
    exportEmpty: 'There is nothing to export.',
    exporting: 'Exporting…',
    exported: '{count} documents saved to {path}',
    exportCancelled: 'Export cancelled.',
    importTitle: 'Import documents',
    filesTitle: 'Import JSON files',
    found: 'This file contains {count} documents.',
    modeMerge: 'Merge — keep what is stored now, skip documents that already exist',
    modeReplace: 'Replace — delete everything currently stored first',
    filesFound: '{count} files will be imported, one document each.',
    filesInvalid: '{count} of them are not valid JSON and will be skipped.',
    folderLabel: 'Folder',
    folderHint: 'Every imported file goes into this folder. No tags are added.',
    noValidFiles: 'None of the selected files contain valid JSON.',
    noticeNotBackup:
      'This file is not an AC JSON Storage backup, so there is nothing to restore from it. It can still be added as a single document.',
    noticeBackupPicked:
      'This is an AC JSON Storage backup. Added here it becomes one plain document — the documents inside it are not restored.',
    noticeBackupsInSet:
      '{count} of the selected files are AC JSON Storage backups. They become plain documents — the documents inside them are not restored.',
    actionRestore: 'Restore it instead',
    cancel: 'Cancel',
    confirm: 'Import',
    restoreConfirm: 'Restore',
    importing: 'Importing…',
    imported: '{imported} imported, {skipped} skipped',
    filesImported: '{imported} documents imported into "{folder}"',
    unreadable: 'Could not read this file: {error}',
    failed: 'Failed: {error}',
    deleteAll: 'Delete all',
    deleteAllTitle: 'Delete all documents',
    deleteAllWarning: '{count} documents will be permanently deleted. This cannot be undone.',
    deleteAllPrompt: 'Type {word} below to confirm.',
    deleteAllWord: 'YES',
    deleteAllConfirm: 'Delete',
    deleting: 'Deleting…',
    deleted: '{deleted} documents deleted',
    nothingToDelete: 'There is nothing to delete.',
  },
  tr: {
    export: 'Dışa aktar',
    import: 'Dosya ekle',
    importHelp: 'Tek tek .json dosyalarını yeni doküman olarak ekler',
    restore: 'Geri yükle',
    restoreHelp: 'AC JSON Storage yedek dosyasından dokümanları geri yükler',
    exportTitle: 'Dokümanları dışa aktar',
    exportSearch: 'Doküman ara…',
    selectAll: 'Tümünü seç',
    noFolder: '(klasörsüz)',
    selectedCount: '{total} dokümandan {selected} tanesi seçili',
    hiddenSelected: 'bunlardan {count} tanesi aramanın dışında',
    exportConfirm: '{count} dokümanı aktar',
    exportNoMatch: 'Eşleşen doküman yok.',
    exportEmpty: 'Aktarılacak doküman yok.',
    exporting: 'Aktarılıyor…',
    exported: '{count} doküman {path} konumuna kaydedildi',
    exportCancelled: 'Dışa aktarma iptal edildi.',
    importTitle: 'Doküman içe aktar',
    filesTitle: 'JSON dosyalarını içe aktar',
    found: 'Bu dosyada {count} doküman var.',
    modeMerge: 'Birleştir — mevcut dokümanlar kalsın, zaten var olanlar atlansın',
    modeReplace: 'Değiştir — kayıtlı tüm dokümanlar önce silinsin',
    filesFound: '{count} dosya, her biri ayrı doküman olarak aktarılacak.',
    filesInvalid: 'Bunlardan {count} tanesi geçerli JSON olmadığı için atlanacak.',
    folderLabel: 'Klasör',
    folderHint: 'Aktarılan her dosya bu klasöre girer. Etiket eklenmez.',
    noValidFiles: 'Seçilen dosyaların hiçbiri geçerli JSON içermiyor.',
    noticeNotBackup:
      'Bu dosya bir AC JSON Storage yedeği değil, geri yüklenecek bir şey yok. Yine de tek doküman olarak eklenebilir.',
    noticeBackupPicked:
      'Bu bir AC JSON Storage yedeği. Buradan eklenirse tek bir düz doküman olur — içindeki dokümanlar geri yüklenmez.',
    noticeBackupsInSet:
      'Seçilen dosyalardan {count} tanesi AC JSON Storage yedeği. Düz doküman olacaklar — içlerindeki dokümanlar geri yüklenmeyecek.',
    actionRestore: 'Bunun yerine geri yükle',
    cancel: 'Vazgeç',
    confirm: 'İçe aktar',
    restoreConfirm: 'Geri yükle',
    importing: 'Aktarılıyor…',
    imported: '{imported} eklendi, {skipped} atlandı',
    filesImported: '{imported} doküman "{folder}" klasörüne aktarıldı',
    unreadable: 'Dosya okunamadı: {error}',
    failed: 'Başarısız: {error}',
    deleteAll: 'Tümünü sil',
    deleteAllTitle: 'Tüm dokümanları sil',
    deleteAllWarning: '{count} doküman kalıcı olarak silinecek. Bu işlem geri alınamaz.',
    deleteAllPrompt: 'Onaylamak için aşağıya {word} yazın.',
    deleteAllWord: 'EVET',
    deleteAllConfirm: 'Sil',
    deleting: 'Siliniyor…',
    deleted: '{deleted} doküman silindi',
    nothingToDelete: 'Silinecek doküman yok.',
  },
}

const EXPORT_FORMAT = 'ac-json-storage-export'
const DEFAULT_IMPORT_FOLDER = 'uncategorized'

let lang = localStorage.getItem('lang') === 'tr' ? 'tr' : 'en'

function t(key, params) {
  let str = TEXT[lang][key] ?? key
  for (const [k, v] of Object.entries(params || {})) str = str.replace(`{${k}}`, v)
  return str
}

const styles = document.createElement('style')
styles.textContent = `
  .io-bar {
    border-top: 1px solid var(--color-border);
    padding: 8px 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .io-bar .io-status {
    flex-basis: 100%;
    white-space: normal;
    word-break: break-all;
    line-height: 1.4;
  }
  .io-modal-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .io-modal-body .io-file {
    font-weight: 600;
    word-break: break-all;
  }
  .io-modal-body label {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.4;
    cursor: pointer;
  }
  .io-folder-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .io-folder-row input {
    flex: 1;
  }
  .io-export-modal {
    width: min(560px, 92vw);
  }
  .io-export-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .io-modal-body .io-export-all {
    align-items: center;
    white-space: nowrap;
  }
  .io-export-toolbar .io-export-search {
    flex: 1;
    min-width: 0;
  }
  .io-export-list {
    max-height: 46vh;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }
  .io-export-group + .io-export-group {
    border-top: 1px solid var(--color-border-subtle);
  }
  /* Sticky so the category a row belongs to stays readable while its own
     five-row list is scrolled. */
  .io-modal-body .io-export-group-header {
    position: sticky;
    top: 0;
    z-index: 1;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    background: var(--color-bg-secondary);
    font-size: 12px;
    font-weight: 600;
  }
  .io-export-group-count {
    color: var(--color-text-faint);
    font-weight: 400;
  }
  /* Five rows tall, then it scrolls on its own: every category stays reachable
     without the outer list growing without bound. */
  .io-export-items {
    max-height: 130px;
    overflow-y: auto;
  }
  .io-modal-body .io-export-row {
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 8px 0 24px;
    font-size: 13px;
  }
  .io-modal-body .io-export-row:hover {
    background: var(--color-hover-bg);
  }
  .io-export-row span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .io-export-count {
    margin-right: auto;
  }
  .io-notice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    border-left: 3px solid var(--color-danger);
    background: var(--color-bg-secondary);
    padding: 8px 10px;
    line-height: 1.4;
  }
  .io-hint {
    color: var(--color-text-muted);
    font-size: 12px;
    line-height: 1.4;
  }
  .io-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
  }
  .io-bar .io-delete-all {
    margin-left: auto;
    border-color: var(--color-danger);
    color: var(--color-danger);
  }
  .io-bar .io-delete-all:hover {
    background: var(--color-danger);
    color: #fff;
  }
  .io-del-warning {
    line-height: 1.4;
  }
`
document.head.appendChild(styles)

const bar = document.createElement('div')
bar.className = 'io-bar'
bar.innerHTML = `
  <button type="button" class="chip io-export"></button>
  <button type="button" class="chip io-import"></button>
  <button type="button" class="chip io-restore"></button>
  <button type="button" class="chip io-delete-all"></button>
  <input type="file" accept="application/json,.json" multiple class="hidden io-file-input" />
  <span class="status io-status"></span>
`
document.querySelector('.sidebar').appendChild(bar)

const modal = document.createElement('div')
modal.className = 'modal-backdrop hidden'
modal.innerHTML = `
  <div class="modal io-modal">
    <div class="modal-header">
      <span class="io-modal-title"></span>
      <button type="button" class="pane-close io-close">×</button>
    </div>
    <div class="io-modal-body">
      <div class="io-file"></div>
      <div class="io-notice hidden">
        <span class="io-notice-text"></span>
        <button type="button" class="io-notice-action hidden"></button>
      </div>
      <div class="io-found"></div>
      <div class="io-face-export">
        <label><input type="radio" name="io-mode" value="merge" checked /> <span class="io-mode-merge"></span></label>
        <label><input type="radio" name="io-mode" value="replace" /> <span class="io-mode-replace"></span></label>
      </div>
      <div class="io-face-files">
        <div class="io-invalid"></div>
        <div class="io-folder-row">
          <span class="io-folder-label"></span>
          <input type="text" class="io-folder-input" />
        </div>
        <div class="io-hint io-folder-hint"></div>
      </div>
      <div class="io-actions">
        <button type="button" class="io-cancel"></button>
        <button type="button" class="pane-save io-confirm"></button>
      </div>
    </div>
  </div>
`
document.body.appendChild(modal)

const exportModal = document.createElement('div')
exportModal.className = 'modal-backdrop hidden'
exportModal.innerHTML = `
  <div class="modal io-modal io-export-modal">
    <div class="modal-header">
      <span class="io-export-title"></span>
      <button type="button" class="pane-close io-export-close">×</button>
    </div>
    <div class="io-modal-body">
      <div class="io-export-toolbar">
        <label class="io-export-all">
          <input type="checkbox" class="io-export-all-input" />
          <span class="io-export-all-label"></span>
        </label>
        <input type="search" class="io-export-search" />
      </div>
      <div class="io-export-list"></div>
      <div class="io-hint io-export-empty hidden"></div>
      <div class="io-actions">
        <span class="io-hint io-export-count"></span>
        <span class="status io-export-status"></span>
        <button type="button" class="io-export-cancel"></button>
        <button type="button" class="pane-save io-export-confirm"></button>
      </div>
    </div>
  </div>
`
document.body.appendChild(exportModal)

const deleteModal = document.createElement('div')
deleteModal.className = 'modal-backdrop hidden'
deleteModal.innerHTML = `
  <div class="modal io-modal">
    <div class="modal-header">
      <span class="io-del-title"></span>
      <button type="button" class="pane-close io-del-close">×</button>
    </div>
    <div class="io-modal-body">
      <div class="io-del-warning"></div>
      <div class="io-hint io-del-prompt"></div>
      <input type="text" class="io-del-input" autocomplete="off" spellcheck="false" />
      <div class="io-actions">
        <button type="button" class="io-del-cancel"></button>
        <button type="button" class="pane-delete io-del-confirm" disabled></button>
      </div>
    </div>
  </div>
`
document.body.appendChild(deleteModal)

const exportBtn = bar.querySelector('.io-export')
const importBtn = bar.querySelector('.io-import')
const restoreBtn = bar.querySelector('.io-restore')
const fileInput = bar.querySelector('.io-file-input')
const statusEl = bar.querySelector('.io-status')
const confirmBtn = modal.querySelector('.io-confirm')
const notice = modal.querySelector('.io-notice')
const noticeAction = modal.querySelector('.io-notice-action')
const faceExport = modal.querySelector('.io-face-export')
const faceFiles = modal.querySelector('.io-face-files')
const folderInput = modal.querySelector('.io-folder-input')
const deleteAllBtn = bar.querySelector('.io-delete-all')
const exportList = exportModal.querySelector('.io-export-list')
const exportSearch = exportModal.querySelector('.io-export-search')
const exportAllInput = exportModal.querySelector('.io-export-all-input')
const exportCountEl = exportModal.querySelector('.io-export-count')
const exportStatusEl = exportModal.querySelector('.io-export-status')
const exportConfirmBtn = exportModal.querySelector('.io-export-confirm')
const exportEmptyEl = exportModal.querySelector('.io-export-empty')
const deleteInput = deleteModal.querySelector('.io-del-input')
const deleteConfirmBtn = deleteModal.querySelector('.io-del-confirm')

// How many documents the open confirmation dialog is about to destroy.
let pendingDeleteCount = 0

// What the modal is currently asking about: an export file to restore, or a
// pile of loose JSON files to file away.
let pending = null

// Export dialog: every document (summaries only, no content), the ids ticked
// for export, and the checkbox nodes the last render produced.
let exportDocs = []
const exportSelected = new Set()
let exportRows = []
let exportGroups = []
// Held as a key, not rendered text, so it follows a language switch while the
// dialog is open — the same reason the import notices do.
let exportStatus = null

function renderLabels() {
  exportBtn.textContent = t('export')
  importBtn.textContent = t('import')
  importBtn.title = t('importHelp')
  restoreBtn.textContent = t('restore')
  restoreBtn.title = t('restoreHelp')
  noticeAction.textContent = t('actionRestore')
  modal.querySelector('.io-mode-merge').textContent = t('modeMerge')
  modal.querySelector('.io-mode-replace').textContent = t('modeReplace')
  modal.querySelector('.io-folder-label').textContent = t('folderLabel')
  modal.querySelector('.io-folder-hint').textContent = t('folderHint')
  modal.querySelector('.io-cancel').textContent = t('cancel')
  confirmBtn.textContent = t('confirm')
  deleteAllBtn.textContent = t('deleteAll')
  exportModal.querySelector('.io-export-title').textContent = t('exportTitle')
  exportModal.querySelector('.io-export-all-label').textContent = t('selectAll')
  exportModal.querySelector('.io-export-cancel').textContent = t('cancel')
  exportSearch.placeholder = t('exportSearch')
  exportEmptyEl.textContent = t('exportNoMatch')
  exportStatusEl.textContent = exportStatus ? t(exportStatus.key, exportStatus.params) : ''
  if (exportDocs.length) renderExportList()
  deleteModal.querySelector('.io-del-title').textContent = t('deleteAllTitle')
  deleteModal.querySelector('.io-del-warning').textContent = t('deleteAllWarning', { count: pendingDeleteCount })
  deleteModal.querySelector('.io-del-prompt').textContent = t('deleteAllPrompt', { word: t('deleteAllWord') })
  deleteModal.querySelector('.io-del-cancel').textContent = t('cancel')
  deleteConfirmBtn.textContent = t('deleteAllConfirm')
  // The confirmation word is language-dependent, so a switch mid-dialog has
  // to re-check what is already typed.
  syncDeleteConfirmState()
  if (pending) renderPending()
}

function renderPending() {
  const isFiles = pending.kind === 'files'
  modal.querySelector('.io-modal-title').textContent = t(isFiles ? 'filesTitle' : 'importTitle')
  faceExport.classList.toggle('hidden', isFiles)
  faceFiles.classList.toggle('hidden', !isFiles)
  modal.querySelector('.io-found').textContent = isFiles
    ? t('filesFound', { count: pending.files.length })
    : t('found', { count: pending.count })
  modal.querySelector('.io-invalid').textContent =
    isFiles && pending.invalid ? t('filesInvalid', { count: pending.invalid }) : ''
  confirmBtn.textContent = t(isFiles ? 'confirm' : 'restoreConfirm')

  // Held as a key rather than a rendered string so it follows language changes
  // like every other label.
  notice.classList.toggle('hidden', !pending.notice)
  if (pending.notice) {
    modal.querySelector('.io-notice-text').textContent =
      t(pending.notice.key, pending.notice.params)
  }
  noticeAction.classList.toggle('hidden', !pending.restoreSource)
}

renderLabels()

new MutationObserver(() => {
  const next = document.documentElement.lang === 'tr' ? 'tr' : 'en'
  if (next === lang) return
  lang = next
  renderLabels()
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })

function setStatus(message) {
  statusEl.textContent = message
}

function closeModal() {
  modal.classList.add('hidden')
  pending = null
  fileInput.value = ''
}

function lowered(value) {
  return value.toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en')
}

/** The documents the search box currently leaves on screen. */
function visibleExportDocs() {
  const query = lowered(exportSearch.value.trim())
  if (!query) return exportDocs
  return exportDocs.filter(
    (doc) => lowered(doc.name).includes(query) || lowered(doc.folder).includes(query),
  )
}

/**
 * A category covers everything filed under it, so ticking `work` also ticks
 * `work/api` — but only over what the search has left visible, so a tick never
 * selects something the user cannot see.
 */
function inCategory(doc, folder) {
  if (folder === '') return doc.folder === ''
  return doc.folder === folder || doc.folder.startsWith(`${folder}/`)
}

function renderExportList() {
  const docs = visibleExportDocs()
  exportList.innerHTML = ''
  exportRows = []
  exportGroups = []

  const byFolder = new Map()
  for (const doc of docs) {
    const key = doc.folder || ''
    if (!byFolder.has(key)) byFolder.set(key, [])
    byFolder.get(key).push(doc)
  }

  for (const folder of [...byFolder.keys()].sort((a, b) => a.localeCompare(b))) {
    const groupDocs = byFolder.get(folder).sort((a, b) => a.name.localeCompare(b.name))
    const covered = docs.filter((doc) => inCategory(doc, folder))

    const group = document.createElement('div')
    group.className = 'io-export-group'

    const header = document.createElement('label')
    header.className = 'io-export-group-header'
    const groupInput = document.createElement('input')
    groupInput.type = 'checkbox'
    const groupName = document.createElement('span')
    groupName.textContent = folder || t('noFolder')
    const groupCount = document.createElement('span')
    groupCount.className = 'io-export-group-count'
    groupCount.textContent = `(${covered.length})`
    header.append(groupInput, groupName, groupCount)
    groupInput.addEventListener('change', () => {
      for (const doc of covered) {
        if (groupInput.checked) exportSelected.add(doc.id)
        else exportSelected.delete(doc.id)
      }
      syncExportState()
    })

    const items = document.createElement('div')
    items.className = 'io-export-items'
    for (const doc of groupDocs) {
      const row = document.createElement('label')
      row.className = 'io-export-row'
      const input = document.createElement('input')
      input.type = 'checkbox'
      const name = document.createElement('span')
      name.textContent = doc.name
      row.append(input, name)
      input.addEventListener('change', () => {
        if (input.checked) exportSelected.add(doc.id)
        else exportSelected.delete(doc.id)
        syncExportState()
      })
      items.appendChild(row)
      exportRows.push({ doc, input })
    }

    group.append(header, items)
    exportList.appendChild(group)
    exportGroups.push({ folder, covered, input: groupInput })
  }

  exportEmptyEl.classList.toggle('hidden', docs.length > 0)
  syncExportState()
}

/** Pushes the selection into the checkboxes rather than re-rendering, so
 *  ticking a category does not throw away the scroll position. */
function syncExportState() {
  for (const { doc, input } of exportRows) {
    input.checked = exportSelected.has(doc.id)
  }
  for (const { covered, input } of exportGroups) {
    const picked = covered.filter((doc) => exportSelected.has(doc.id)).length
    input.checked = picked > 0 && picked === covered.length
    input.indeterminate = picked > 0 && picked < covered.length
  }

  const visible = visibleExportDocs()
  const visiblePicked = visible.filter((doc) => exportSelected.has(doc.id)).length
  exportAllInput.checked = visible.length > 0 && visiblePicked === visible.length
  exportAllInput.indeterminate = visiblePicked > 0 && visiblePicked < visible.length

  let countText = t('selectedCount', {
    selected: exportSelected.size,
    total: exportDocs.length,
  })
  // Selected documents the search is hiding still get exported, so say so
  // rather than letting the visible ticks stand for the whole selection.
  const hidden = exportSelected.size - visiblePicked
  if (hidden > 0 && visible.length !== exportDocs.length) {
    countText += ` — ${t('hiddenSelected', { count: hidden })}`
  }
  exportCountEl.textContent = countText
  exportConfirmBtn.textContent = t('exportConfirm', { count: exportSelected.size })
  exportConfirmBtn.disabled = exportSelected.size === 0
}

function setExportStatus(key, params) {
  exportStatus = key ? { key, params } : null
  exportStatusEl.textContent = key ? t(key, params) : ''
}

function closeExportModal() {
  exportModal.classList.add('hidden')
  setExportStatus(null)
}

exportBtn.addEventListener('click', async () => {
  setStatus('')
  try {
    const res = await fetch('/api/documents')
    const docs = await res.json()
    if (!res.ok) throw new Error(docs.error || res.status)
    if (!docs.length) {
      setStatus(t('exportEmpty'))
      return
    }
    exportDocs = docs
    // Everything is ticked to begin with, so the plain "back up the lot" case
    // stays one click. Narrowing it down is the deliberate act — and because a
    // search followed by "select all" then keeps whatever the search hid, the
    // footer says how many of the ticked documents are off screen.
    exportSelected.clear()
    for (const doc of docs) exportSelected.add(doc.id)
    exportSearch.value = ''
    setExportStatus(null)
    renderExportList()
    exportModal.classList.remove('hidden')
    exportSearch.focus()
  } catch (err) {
    setStatus(t('failed', { error: err.message }))
  }
})

exportSearch.addEventListener('input', renderExportList)

exportAllInput.addEventListener('change', () => {
  for (const doc of visibleExportDocs()) {
    if (exportAllInput.checked) exportSelected.add(doc.id)
    else exportSelected.delete(doc.id)
  }
  syncExportState()
})

exportModal.querySelector('.io-export-close').addEventListener('click', closeExportModal)
exportModal.querySelector('.io-export-cancel').addEventListener('click', closeExportModal)

exportConfirmBtn.addEventListener('click', async () => {
  const ids = [...exportSelected]
  if (!ids.length) return
  exportConfirmBtn.disabled = true
  setExportStatus('exporting')
  try {
    const res = await fetch('/api/documents/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || res.status)
    if (body.cancelled) {
      // Dismissing the save dialog is not a decision to abandon the selection.
      setExportStatus('exportCancelled')
      return
    }
    closeExportModal()
    setStatus(t('exported', body))
  } catch (err) {
    setExportStatus('failed', { error: err.message })
  } finally {
    exportConfirmBtn.disabled = exportSelected.size === 0
  }
})

// Which button opened the file picker. The two entry points mean the app never
// has to guess whether a pile of files is a backup to restore or documents to
// file away — the user already said which one they meant.
let requestedMode = 'files'

importBtn.addEventListener('click', () => {
  requestedMode = 'files'
  fileInput.multiple = true
  fileInput.click()
})

restoreBtn.addEventListener('click', () => {
  requestedMode = 'restore'
  fileInput.multiple = false
  fileInput.click()
})

function readJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

function isBackup(parsed) {
  return parsed.ok && parsed.value?.format === EXPORT_FORMAT && Array.isArray(parsed.value.documents)
}

function openRestore(name, text, count) {
  pending = { kind: 'export', text, count }
  modal.querySelector('.io-file').textContent = name
  modal.querySelector('input[value="merge"]').checked = true
  renderPending()
  modal.classList.remove('hidden')
}

/**
 * @param warning       `{key, params}` shown above the summary, or null.
 * @param restoreSource `{name, text, count}` when the selection is a single
 *                      backup file, which turns the warning into an offer to
 *                      restore it instead.
 */
function openFiles(files, texts, parsed, warning, restoreSource) {
  const valid = []
  let invalid = 0
  files.forEach((file, index) => {
    if (!parsed[index].ok) {
      invalid += 1
      return
    }
    valid.push({ name: file.name.replace(/\.json$/i, ''), content: texts[index] })
  })

  if (!valid.length) {
    setStatus(t('noValidFiles'))
    fileInput.value = ''
    return
  }

  pending = { kind: 'files', files: valid, invalid, notice: warning, restoreSource }
  modal.querySelector('.io-file').textContent = files.length === 1 ? files[0].name : ''
  folderInput.value = DEFAULT_IMPORT_FOLDER
  renderPending()
  modal.classList.remove('hidden')
}

fileInput.addEventListener('change', async () => {
  const files = [...fileInput.files]
  if (!files.length) return
  setStatus('')

  const texts = await Promise.all(files.map((file) => file.text()))
  const parsed = texts.map(readJson)

  if (requestedMode === 'restore') {
    if (!parsed[0].ok) {
      setStatus(t('unreadable', { error: parsed[0].error }))
      fileInput.value = ''
      return
    }
    if (isBackup(parsed[0])) {
      openRestore(files[0].name, texts[0], parsed[0].value.documents.length)
      return
    }
    // Nothing to restore from this file. Rather than failing outright, offer
    // the one thing that *can* be done with it — but say so first.
    openFiles(files, texts, parsed, { key: 'noticeNotBackup' })
    return
  }

  // Adding files is where a backup used to disappear silently: it parses as
  // JSON, so the whole thing was stored as the content of a single document
  // while the user thought they had restored it.
  const backups = parsed.filter(isBackup).length
  if (backups === 0) {
    openFiles(files, texts, parsed, null)
  } else if (files.length === 1) {
    openFiles(files, texts, parsed, { key: 'noticeBackupPicked' }, {
      name: files[0].name,
      text: texts[0],
      count: parsed[0].value.documents.length,
    })
  } else {
    openFiles(files, texts, parsed, { key: 'noticeBackupsInSet', params: { count: backups } })
  }
})

noticeAction.addEventListener('click', () => {
  const source = pending?.restoreSource
  if (!source) return
  openRestore(source.name, source.text, source.count)
})

modal.querySelector('.io-close').addEventListener('click', closeModal)
modal.querySelector('.io-cancel').addEventListener('click', closeModal)

// Only a click that both started and ended on the backdrop dismisses a
// dialog. Without the mousedown check, dragging to select text inside it and
// releasing outside counts as a backdrop click and closes it.
function closeOnBackdropClick(backdrop, close) {
  let pressStartedOnBackdrop = false
  backdrop.addEventListener('mousedown', (event) => {
    pressStartedOnBackdrop = event.target === backdrop
  })
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop && pressStartedOnBackdrop) close()
  })
}
closeOnBackdropClick(modal, closeModal)
closeOnBackdropClick(deleteModal, closeDeleteModal)
closeOnBackdropClick(exportModal, closeExportModal)

function closeDeleteModal() {
  deleteModal.classList.add('hidden')
  deleteInput.value = ''
  syncDeleteConfirmState()
}

function syncDeleteConfirmState() {
  const typed = deleteInput.value.trim().toLocaleUpperCase(lang === 'tr' ? 'tr' : 'en')
  deleteConfirmBtn.disabled = typed !== t('deleteAllWord')
}

deleteInput.addEventListener('input', syncDeleteConfirmState)
deleteModal.querySelector('.io-del-close').addEventListener('click', closeDeleteModal)
deleteModal.querySelector('.io-del-cancel').addEventListener('click', closeDeleteModal)

deleteAllBtn.addEventListener('click', async () => {
  setStatus('')
  try {
    const res = await fetch('/api/documents')
    const documents = await res.json()
    if (!documents.length) {
      setStatus(t('nothingToDelete'))
      return
    }
    pendingDeleteCount = documents.length
    deleteModal.querySelector('.io-del-warning').textContent =
      t('deleteAllWarning', { count: pendingDeleteCount })
    deleteInput.value = ''
    syncDeleteConfirmState()
    deleteModal.classList.remove('hidden')
    deleteInput.focus()
  } catch (err) {
    setStatus(t('failed', { error: err.message }))
  }
})

deleteConfirmBtn.addEventListener('click', async () => {
  deleteConfirmBtn.disabled = true
  setStatus(t('deleting'))
  try {
    const res = await fetch('/api/documents', { method: 'DELETE' })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || res.status)
    closeDeleteModal()
    sessionStorage.setItem('io-result', t('deleted', body))
    location.reload()
  } catch (err) {
    setStatus(t('failed', { error: err.message }))
    syncDeleteConfirmState()
  }
})

confirmBtn.addEventListener('click', async () => {
  if (!pending) return
  confirmBtn.disabled = true
  setStatus(t('importing'))

  try {
    let res
    let message
    if (pending.kind === 'files') {
      const folder = folderInput.value.trim() || DEFAULT_IMPORT_FOLDER
      res = await fetch('/api/documents/import-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, files: pending.files }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || res.status)
      message = t('filesImported', body)
    } else {
      const mode = modal.querySelector('input[name="io-mode"]:checked').value
      res = await fetch(`/api/documents/import?mode=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: pending.text,
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || res.status)
      message = t('imported', body)
    }

    closeModal()
    // The sidebar, the folder tree and the tag list all derive from the
    // document list; reloading is the cheapest way to rebuild every one of
    // them without reaching into app.js's module scope.
    sessionStorage.setItem('io-result', message)
    location.reload()
  } catch (err) {
    setStatus(t('failed', { error: err.message }))
  } finally {
    confirmBtn.disabled = false
  }
})

const lastResult = sessionStorage.getItem('io-result')
if (lastResult) {
  sessionStorage.removeItem('io-result')
  setStatus(lastResult)
}
