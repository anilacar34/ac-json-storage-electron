import { createJSONEditor } from '/vendor/vanilla-jsoneditor/standalone.js'
import { openCompare } from '/compare.js'

const translations = {
  tr: {
    'common.clear': 'Temizle',
    'common.save': 'Kaydet',
    'common.delete': 'Sil',
    'common.new': 'Yeni',
    'search.placeholder': 'Ara...',
    'search.advanced': 'Gelişmiş',
    'search.fieldName': 'İsim',
    'search.fieldFolder': 'Klasör',
    'search.fieldTag': 'Etiket',
    'sidebar.folders': 'Klasörler',
    'sidebar.tags': 'Etiketler',
    'sidebar.files': 'Dosyalar',
    'sidebar.details': 'Detaylar',
    'sidebar.selectMode': 'Seç',
    'selection.openNewGroup': 'Yeni grupta aç',
    'selection.cancel': 'Vazgeç',
    'selection.count': '{count} seçili',
    'tabs.group': 'Grup {n}',
    'tabs.close': 'Grubu kapat',
    'tabs.newTitle': 'Yeni grup aç',
    'toolbar.toggleSidebar': 'Kenar çubuğunu gizle/göster',
    'toolbar.addPane': '+ Editör Ekle',
    'toolbar.compare': 'Karşılaştır',
    'toolbar.removePane': '- Editör Kaldır',
    'toolbar.removePaneMenu': 'Kaldırılacak editörleri seç',
    'toolbar.themeToggle': 'Temayı değiştir',
    'toolbar.langToggle': 'Dili değiştir',
    'pane.title': 'Editör {n}',
    'pane.newTitle': 'Yeni (boş) belge',
    'doc.export': 'JSON dosyası olarak kaydet',
    'pane.exportTitle': 'Ekrandakini .json dosyasına kaydet',
    'status.exported': 'Dosyaya kaydedildi',
    'export.failed': 'Kaydedilemedi: {error}',
    'zoom.in': 'Yazı boyutunu büyült (Ctrl + tekerlek)',
    'zoom.out': 'Yazı boyutunu küçült (Ctrl + tekerlek)',
    'zoom.reset': 'Yazı boyutunu varsayılana döndür',
    'pane.closeTitle': 'Editörü kapat',
    'pane.openLeft': 'Soldakinde Aç',
    'pane.openRight': 'Sağdakinde Aç',
    'pane.openIn': "Editör {n}'de Aç",
    'field.name': 'İsim',
    'field.namePlaceholder': 'İsim',
    'field.folder': 'Klasör',
    'field.folderPlaceholder': 'Klasör (örn. work/api)',
    'field.tags': 'Etiket',
    'field.tagsPlaceholder': 'Etiketler (virgülle ayırın)',
    'field.edit': 'Düzenle',
    'status.unsaved': 'Kaydedilmemiş değişiklikler var',
    'status.nameRequired': 'İsim gerekli',
    'status.saveError': 'Kaydetme hatası',
    'status.saved': 'Kaydedildi',
    'status.deleted': 'Belge silindi',
    'doc.preview': 'Önizle / Düzenle',
    'doc.openRight': 'Sağda yeni editörde aç',
    'doc.closeOpen': 'Açık editörü kapat',
    'doc.delete': 'Sil',
    'doc.confirmDeleteGeneric': 'Bu belgeyi silmek istediğinize emin misiniz?',
    'doc.confirmDeleteNamed': '"{name}" belgesini silmek istediğinize emin misiniz?',
    'modal.title': 'Önizleme / Düzenle',
  },
  en: {
    'common.clear': 'Clear',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.new': 'New',
    'search.placeholder': 'Search...',
    'search.advanced': 'Advanced',
    'search.fieldName': 'Name',
    'search.fieldFolder': 'Folder',
    'search.fieldTag': 'Tag',
    'sidebar.folders': 'Folders',
    'sidebar.tags': 'Tags',
    'sidebar.files': 'Files',
    'sidebar.details': 'Details',
    'sidebar.selectMode': 'Select',
    'selection.openNewGroup': 'Open in new group',
    'selection.cancel': 'Cancel',
    'selection.count': '{count} selected',
    'tabs.group': 'Group {n}',
    'tabs.close': 'Close group',
    'tabs.newTitle': 'Open a new group',
    'toolbar.toggleSidebar': 'Show/hide sidebar',
    'toolbar.addPane': '+ Add Editor',
    'toolbar.compare': 'Compare',
    'toolbar.removePane': '- Remove Editor',
    'toolbar.removePaneMenu': 'Select editors to remove',
    'toolbar.themeToggle': 'Toggle theme',
    'toolbar.langToggle': 'Switch language',
    'pane.title': 'Editor {n}',
    'pane.newTitle': 'New (blank) document',
    'doc.export': 'Save as a .json file',
    'pane.exportTitle': 'Save what is on screen as a .json file',
    'status.exported': 'Saved to file',
    'export.failed': 'Could not save: {error}',
    'zoom.in': 'Larger editor font (Ctrl + wheel)',
    'zoom.out': 'Smaller editor font (Ctrl + wheel)',
    'zoom.reset': 'Reset editor font to the default',
    'pane.closeTitle': 'Close editor',
    'pane.openLeft': 'Open on left',
    'pane.openRight': 'Open on right',
    'pane.openIn': 'Open in Editor {n}',
    'field.name': 'Name',
    'field.namePlaceholder': 'Name',
    'field.folder': 'Folder',
    'field.folderPlaceholder': 'Folder (e.g. work/api)',
    'field.tags': 'Tag',
    'field.tagsPlaceholder': 'Tags (comma-separated)',
    'field.edit': 'Edit',
    'status.unsaved': 'You have unsaved changes',
    'status.nameRequired': 'Name is required',
    'status.saveError': 'Save error',
    'status.saved': 'Saved',
    'status.deleted': 'Document deleted',
    'doc.preview': 'Preview / Edit',
    'doc.openRight': 'Open in new editor on the right',
    'doc.closeOpen': 'Close open editor',
    'doc.delete': 'Delete',
    'doc.confirmDeleteGeneric': 'Are you sure you want to delete this document?',
    'doc.confirmDeleteNamed': 'Are you sure you want to delete "{name}"?',
    'modal.title': 'Preview / Edit',
  },
}

let lang = localStorage.getItem('lang') === 'tr' ? 'tr' : 'en'

function t(key, params) {
  let str = translations[lang][key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v)
    }
  }
  return str
}

function applyI18n(scope = document) {
  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n)
  })
  scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder)
  })
  scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle)
  })
}

const state = {
  search: '',
  folders: new Set(),
  tags: new Set(),
  searchFields: ['name', 'folder', 'tag'],
}

const searchInput = document.getElementById('search')
const advancedSearchBtn = document.getElementById('advanced-search-btn')
const advancedSearchEl = document.getElementById('advanced-search')
const searchFieldNameCheckbox = document.getElementById('search-field-name')
const searchFieldFolderCheckbox = document.getElementById('search-field-folder')
const searchFieldTagCheckbox = document.getElementById('search-field-tag')
const detailsToggleBtn = document.getElementById('details-toggle-btn')
const selectModeBtn = document.getElementById('select-mode-btn')
const docListEl = document.getElementById('doc-list')
const folderListEl = document.getElementById('folder-list')
const tagListEl = document.getElementById('tag-list')
const clearFoldersBtn = document.getElementById('clear-folders-btn')
const clearTagsBtn = document.getElementById('clear-tags-btn')
const panesContainer = document.getElementById('panes-container')
const groupTabsEl = document.getElementById('group-tabs')
const addPaneBtn = document.getElementById('add-pane-btn')
const compareBtn = document.getElementById('compare-btn')
const removePaneGroup = document.getElementById('remove-pane-group')
const removePaneBtn = document.getElementById('remove-pane-btn')
const removePaneMenuBtn = document.getElementById('remove-pane-menu-btn')
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn')
const themeToggleBtn = document.getElementById('theme-toggle-btn')
const langToggleBtn = document.getElementById('lang-toggle-btn')
const selectionBarEl = document.getElementById('selection-bar')
const selectionCountEl = document.getElementById('selection-count')
const openNewWindowBtn = document.getElementById('open-new-window-btn')
const clearSelectionBtn = document.getElementById('clear-selection-btn')
const selectionOpenListEl = document.getElementById('selection-open-list')

const previewModalEl = document.getElementById('preview-modal')
const previewNameInput = document.getElementById('preview-name')
const previewFolderInput = document.getElementById('preview-folder')
const previewTagsInput = document.getElementById('preview-tags')
const previewStatusEl = document.getElementById('preview-status')
const previewSaveBtn = document.getElementById('preview-save-btn')
const previewCloseBtn = document.getElementById('preview-close-btn')

// A group is one browser-style tab: its own set of panes in its own
// container. `panes` always aliases the active group's array, so every
// pane function below keeps working on the group the user is looking at.
// It is only ever mutated in place — never reassigned — or the alias breaks.
const groups = []
let activeGroupIndex = 0
let panes = []
let openMenuEl = null
let removePaneMenuEl = null
const selectedPanesForRemoval = new Set()
let previewEditor = null
let previewDocId = null
const selectedDocIds = new Set()
const selectedDocNames = new Map()
let knownFolders = []
let knownTags = []
let selectMode = false
let showDetails = false

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme)
  document.body.classList.toggle('jse-theme-dark', theme === 'dark')
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙'
}

let theme = localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
applyTheme()

themeToggleBtn.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme)
  applyTheme()
})

function setLang(newLang) {
  lang = newLang
  localStorage.setItem('lang', lang)
  document.documentElement.lang = lang
  langToggleBtn.textContent = lang === 'tr' ? 'EN' : 'TR'
  applyI18n(document)
  renumberPanes()
  renderGroupTabs()
  panes.forEach((pane) => pane.refreshFieldDisplays())
  refreshFilters()
  refreshList()
  updateSelectionBar()
}

langToggleBtn.addEventListener('click', () => {
  setLang(lang === 'tr' ? 'en' : 'tr')
})

function attachAutocomplete(input, getOptions, { multi = false, icon = '' } = {}) {
  let dropdown = null

  function closeDropdown() {
    if (dropdown) {
      dropdown.remove()
      dropdown = null
    }
  }

  function currentQuery() {
    if (!multi) return input.value
    const parts = input.value.split(',')
    return parts[parts.length - 1].trim()
  }

  function applySelection(value) {
    if (!multi) {
      input.value = value
    } else {
      const parts = input.value.split(',')
      parts[parts.length - 1] = ` ${value}`
      input.value = `${parts.join(',').trim()}, `
    }
    closeDropdown()
    input.focus()
  }

  function renderDropdown() {
    closeDropdown()
    const query = currentQuery().toLowerCase()
    if (!query) return
    const options = getOptions().filter((o) => o.toLowerCase().includes(query))
    if (options.length === 0) return

    dropdown = document.createElement('div')
    dropdown.className = 'autocomplete-dropdown'
    const rect = input.getBoundingClientRect()
    dropdown.style.left = `${rect.left}px`
    dropdown.style.top = `${rect.bottom}px`
    dropdown.style.width = `${rect.width}px`

    for (const option of options) {
      const item = document.createElement('div')
      item.className = 'autocomplete-item'
      item.textContent = icon ? `${icon} ${option}` : option
      item.addEventListener('mousedown', (e) => {
        e.preventDefault()
        applySelection(option)
      })
      dropdown.appendChild(item)
    }
    document.body.appendChild(dropdown)
  }

  input.addEventListener('input', renderDropdown)
  input.addEventListener('focus', renderDropdown)
  input.addEventListener('blur', () => setTimeout(closeDropdown, 150))
}

function createEditableField(labelKey, placeholderKey, inputClass) {
  const wrapper = document.createElement('span')
  wrapper.className = `editable-field ${inputClass}-field`
  const labelEl = document.createElement('span')
  labelEl.className = 'field-label'
  labelEl.dataset.i18n = labelKey
  labelEl.textContent = t(labelKey)
  const text = document.createElement('span')
  text.className = 'field-text'
  const editBtn = document.createElement('button')
  editBtn.type = 'button'
  editBtn.className = 'field-edit-btn'
  editBtn.textContent = '✎'
  editBtn.dataset.i18nTitle = 'field.edit'
  editBtn.title = t('field.edit')
  const input = document.createElement('input')
  input.className = `${inputClass} field-input hidden`
  input.dataset.i18nPlaceholder = placeholderKey
  input.placeholder = t(placeholderKey)
  const valueRow = document.createElement('span')
  valueRow.className = 'field-value-row'
  valueRow.append(text, editBtn)
  wrapper.append(labelEl, valueRow, input)

  // The whole row is swapped for the input, not just its contents: a row left
  // in place with hidden children is still a flex item, and the `gap` above it
  // made the field 2px taller while editing.
  function showEdit() {
    valueRow.classList.add('hidden')
    input.classList.remove('hidden')
    input.focus()
    input.select()
  }
  function showDisplay() {
    input.classList.add('hidden')
    valueRow.classList.remove('hidden')
    const v = input.value.trim()
    text.textContent = v || t(placeholderKey)
    text.classList.toggle('placeholder', !v)
  }
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    showEdit()
  })
  text.addEventListener('click', (e) => {
    e.stopPropagation()
    showEdit()
  })
  input.addEventListener('blur', () => setTimeout(showDisplay, 100))
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur()
  })
  showDisplay()
  return { wrapper, input, refreshDisplay: showDisplay }
}

function closeOpenMenu() {
  if (openMenuEl) {
    openMenuEl.remove()
    openMenuEl = null
  }
}
document.addEventListener('click', closeOpenMenu)

// --- Groups (tab bar) ---

function createGroup() {
  const container = document.createElement('div')
  container.className = 'panes-container'
  panesContainer.appendChild(container)
  groups.push({ panes: [], container })
  setActiveGroup(groups.length - 1)
  return groups[groups.length - 1]
}

function setActiveGroup(index) {
  activeGroupIndex = index
  groups.forEach((group, i) => group.container.classList.toggle('hidden', i !== index))
  panes = groups[index].panes
  closeOpenMenu()
  closeRemovePaneMenu()
  selectedPanesForRemoval.clear()
  renumberPanes()
  updateCloseButtons()
  renderGroupTabs()
  refreshList()
}

async function closeGroup(index) {
  if (groups.length <= 1) return
  const group = groups[index]
  for (const pane of group.panes) {
    await pane.editor.destroy()
    pane.root.remove()
  }
  group.container.remove()
  groups.splice(index, 1)
  setActiveGroup(Math.min(index, groups.length - 1))
}

// Browser-tab behaviour: the tab is named after what is open in it, and
// falls back to its position while the group is still empty.
function groupLabel(group, index) {
  const names = group.panes.map((pane) => pane.nameInput.value.trim()).filter(Boolean)
  return names.length ? names.join(', ') : t('tabs.group', { n: index + 1 })
}

function renderGroupTabs() {
  groupTabsEl.innerHTML = ''
  groups.forEach((group, index) => {
    const tab = document.createElement('div')
    tab.className = index === activeGroupIndex ? 'group-tab active' : 'group-tab'

    const label = document.createElement('span')
    label.className = 'group-tab-label'
    label.textContent = groupLabel(group, index)
    tab.title = label.textContent
    tab.appendChild(label)

    if (groups.length > 1) {
      const closeBtn = document.createElement('button')
      closeBtn.type = 'button'
      closeBtn.className = 'group-tab-close'
      closeBtn.textContent = '×'
      closeBtn.title = t('tabs.close')
      closeBtn.addEventListener('click', (event) => {
        event.stopPropagation()
        closeGroup(index)
      })
      tab.appendChild(closeBtn)
    }

    tab.addEventListener('click', () => setActiveGroup(index))
    groupTabsEl.appendChild(tab)
  })

  const addBtn = document.createElement('button')
  addBtn.type = 'button'
  addBtn.className = 'group-tab-add'
  addBtn.textContent = '+'
  addBtn.title = t('tabs.newTitle')
  addBtn.addEventListener('click', () => openDocsInNewGroup([]))
  groupTabsEl.appendChild(addBtn)
}

/// Replaces what used to be `window.open('/?open=...')`: the documents land
/// in a fresh group in this window instead of a second browser window.
function openDocsInNewGroup(ids) {
  createGroup()
  const paneCount = Math.max(ids.length, 2)
  while (panes.length < paneCount) {
    createPane()
  }
  ids.forEach((id, index) => openDocInPane(panes[index], id))
}

// --- Panes ---

function renumberPanes() {
  panes.forEach((pane, index) => {
    pane.number = index + 1
    const titleEl = pane.root.querySelector('.pane-title')
    titleEl.textContent = t('pane.title', { n: pane.number })
    // Four panes across leave the header no room for the label, which then
    // ellipsises away entirely; the tooltip is how it stays recoverable.
    titleEl.title = titleEl.textContent
  })
}

function attachResizeHandle(handle, pane, sign) {
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = pane.root.getBoundingClientRect().width
    document.body.classList.add('resizing')

    function onMove(ev) {
      const delta = (ev.clientX - startX) * sign
      const newWidth = Math.max(300, startWidth + delta)
      pane.root.style.flex = `0 0 ${newWidth}px`
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.classList.remove('resizing')
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
}

// Inline rather than a glyph: the arrows the fonts offer are hairline-thin
// next to the text buttons they sit between, and this one follows the button's
// own colour through `currentColor`.
const DOWNLOAD_ICON = `
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M8 1.75v8.5m0 0L4.75 7M8 10.25 11.25 7" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M2.75 11.25v1.5c0 .55.45 1 1 1h8.5c.55 0 1-.45 1-1v-1.5" fill="none"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>`

// Editor font size. This is the *content* size only — the editor's own toolbar
// and the app around it keep their size, the way an editor's font setting
// behaves rather than a browser zoom. (Window-wide zoom lives in the View menu.)
const FONT_SIZE_MIN = 10
const FONT_SIZE_MAX = 24
const FONT_SIZE_DEFAULT = 14

// The last size chosen anywhere becomes the starting size for panes opened
// afterwards, so the preference sticks without being a global setting.
let lastFontSize = clampFontSize(Number(localStorage.getItem('editorFontSize')) || FONT_SIZE_DEFAULT)

function clampFontSize(size) {
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(size)))
}

/**
 * vanilla-jsoneditor sizes its content from two CSS variables — `-mono` for
 * text mode and the code font, the other for tree mode — whose defaults are
 * 14px and 16px. Setting them on the pane's own container keeps the change
 * scoped to that editor; the ratio between them is preserved so tree mode
 * stays proportional to text mode.
 */
function applyEditorFontSize(el, size) {
  el.style.setProperty('--jse-font-size-mono', `${size}px`)
  el.style.setProperty('--jse-font-size', `${Math.round((size * 8) / 7)}px`)
}

function attachZoom(pane, root) {
  const editorEl = root.querySelector('.pane-editor')
  const outBtn = root.querySelector('.zoom-out')
  const inBtn = root.querySelector('.zoom-in')
  const valueBtn = root.querySelector('.zoom-value')

  pane.setFontSize = (size) => {
    pane.fontSize = clampFontSize(size)
    applyEditorFontSize(editorEl, pane.fontSize)
    valueBtn.textContent = pane.fontSize
    outBtn.disabled = pane.fontSize <= FONT_SIZE_MIN
    inBtn.disabled = pane.fontSize >= FONT_SIZE_MAX
    lastFontSize = pane.fontSize
    localStorage.setItem('editorFontSize', String(pane.fontSize))
  }

  outBtn.addEventListener('click', () => pane.setFontSize(pane.fontSize - 1))
  inBtn.addEventListener('click', () => pane.setFontSize(pane.fontSize + 1))
  valueBtn.addEventListener('click', () => pane.setFontSize(FONT_SIZE_DEFAULT))

  // Ctrl/Cmd + wheel over the editor, the gesture every editor has. Passive
  // has to be off or the scroll cannot be cancelled.
  editorEl.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      pane.setFontSize(pane.fontSize + (event.deltaY < 0 ? 1 : -1))
    },
    { passive: false },
  )

  pane.setFontSize(lastFontSize)
}

function createPane() {
  const root = document.createElement('div')
  root.className = 'pane'
  root.innerHTML = `
    <div class="pane-resize-handle pane-resize-left"></div>
    <div class="pane-resize-handle pane-resize-right"></div>
    <div class="pane-header">
      <span class="pane-title"></span>
      <span class="pane-zoom">
        <button type="button" class="zoom-btn zoom-out" data-i18n-title="zoom.out" title="${t('zoom.out')}">−</button>
        <button type="button" class="zoom-value" data-i18n-title="zoom.reset" title="${t('zoom.reset')}"></button>
        <button type="button" class="zoom-btn zoom-in" data-i18n-title="zoom.in" title="${t('zoom.in')}">+</button>
      </span>
      <button type="button" class="pane-new" data-i18n="common.new" data-i18n-title="pane.newTitle" title="${t('pane.newTitle')}">${t('common.new')}</button>
      <button type="button" class="pane-save" data-i18n="common.save">${t('common.save')}</button>
      <button type="button" class="pane-export" data-i18n-title="pane.exportTitle" title="${t('pane.exportTitle')}">${DOWNLOAD_ICON}</button>
      <button type="button" class="pane-delete" data-i18n="common.delete">${t('common.delete')}</button>
      <button type="button" class="pane-close" data-i18n-title="pane.closeTitle" title="${t('pane.closeTitle')}">×</button>
    </div>
    <div class="pane-meta">
      <span class="pane-status status"></span>
    </div>
    <div class="pane-editor"></div>
  `
  groups[activeGroupIndex].container.appendChild(root)

  const metaEl = root.querySelector('.pane-meta')
  const statusEl = root.querySelector('.pane-status')
  const nameField = createEditableField('field.name', 'field.namePlaceholder', 'pane-name')
  const folderField = createEditableField('field.folder', 'field.folderPlaceholder', 'pane-folder')
  const tagsField = createEditableField('field.tags', 'field.tagsPlaceholder', 'pane-tags')
  metaEl.insertBefore(nameField.wrapper, statusEl)
  metaEl.insertBefore(folderField.wrapper, statusEl)
  metaEl.insertBefore(tagsField.wrapper, statusEl)

  const pane = {
    number: 0,
    docId: null,
    root,
    nameInput: nameField.input,
    folderInput: folderField.input,
    tagsInput: tagsField.input,
    statusEl,
    closeBtn: root.querySelector('.pane-close'),
    refreshFieldDisplays: () => {
      nameField.refreshDisplay()
      folderField.refreshDisplay()
      tagsField.refreshDisplay()
    },
  }

  let suppressDirty = true
  pane.editor = createJSONEditor({
    target: root.querySelector('.pane-editor'),
    props: {
      content: { text: '' },
      mode: 'text',
      onChange: () => {
        if (suppressDirty) return
        pane.statusEl.textContent = t('status.unsaved')
      },
    },
  })
  suppressDirty = false
  pane.setEditorText = (text) => {
    suppressDirty = true
    pane.editor.update({ text: text ?? '' })
    suppressDirty = false
  }

  attachAutocomplete(pane.folderInput, () => knownFolders, { icon: '📁' })
  attachAutocomplete(pane.tagsInput, () => knownTags, { multi: true, icon: '🏷' })

  pane.closeBtn.addEventListener('click', () => closePane(pane))
  root.querySelector('.pane-new').addEventListener('click', () => resetPane(pane))
  root.querySelector('.pane-save').addEventListener('click', () => savePane(pane))
  root.querySelector('.pane-delete').addEventListener('click', () => deletePane(pane))
  // Deliberately exports what is on screen rather than the stored copy — the
  // same choice the compare dialog makes. The sidebar's row icon is the one
  // that writes what is saved.
  root.querySelector('.pane-export').addEventListener('click', async () => {
    try {
      const result = await exportTextToFile(pane.nameInput.value.trim(), getPaneText(pane))
      if (!result.cancelled) pane.statusEl.textContent = t('status.exported')
    } catch (err) {
      pane.statusEl.textContent = t('export.failed', { error: err.message })
    }
  })
  attachZoom(pane, root)
  attachResizeHandle(root.querySelector('.pane-resize-left'), pane, -1)
  attachResizeHandle(root.querySelector('.pane-resize-right'), pane, 1)

  panes.push(pane)
  renumberPanes()
  updateCloseButtons()
  renderGroupTabs()
  return pane
}

function updateCloseButtons() {
  const disable = panes.length <= 1
  for (const pane of panes) {
    pane.closeBtn.disabled = disable
  }
  const disableRemove = panes.length <= 2
  removePaneBtn.disabled = disableRemove
  removePaneMenuBtn.disabled = disableRemove
  compareBtn.disabled = panes.length < 2
}

// The comparison dialog only ever sees a snapshot of what is on screen, so it
// diffs unsaved edits too — which is the point of comparing editors rather
// than stored documents.
compareBtn.addEventListener('click', () => {
  openCompare(
    panes.map((pane) => ({
      label: t('pane.title', { n: pane.number }),
      name: pane.nameInput.value.trim(),
      text: getPaneText(pane),
    }))
  )
})

async function closePane(pane) {
  if (panes.length <= 1) return
  await pane.editor.destroy()
  pane.root.remove()
  panes.splice(panes.indexOf(pane), 1)
  selectedPanesForRemoval.delete(pane)
  renumberPanes()
  updateCloseButtons()
  renderGroupTabs()
  refreshList()
}

function closeRemovePaneMenu() {
  if (removePaneMenuEl) {
    removePaneMenuEl.remove()
    removePaneMenuEl = null
  }
}

function showRemovePaneMenu() {
  closeRemovePaneMenu()
  closeOpenMenu()
  const menu = document.createElement('div')
  menu.className = 'remove-pane-menu'
  menu.addEventListener('click', (e) => e.stopPropagation())

  for (const pane of panes) {
    const label = document.createElement('label')
    label.className = 'remove-pane-item'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = selectedPanesForRemoval.has(pane)
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selectedPanesForRemoval.add(pane)
      else selectedPanesForRemoval.delete(pane)
    })
    const text = document.createElement('span')
    text.textContent = t('pane.title', { n: pane.number })
    label.append(checkbox, text)
    menu.appendChild(label)
  }

  const clearBtn = document.createElement('button')
  clearBtn.type = 'button'
  clearBtn.className = 'remove-pane-clear'
  clearBtn.textContent = t('common.clear')
  clearBtn.addEventListener('click', () => {
    selectedPanesForRemoval.clear()
    showRemovePaneMenu()
  })
  menu.appendChild(clearBtn)

  removePaneGroup.appendChild(menu)
  removePaneMenuEl = menu
}

async function removeSelectedOrTrailingPanes() {
  if (selectedPanesForRemoval.size > 0) {
    const toRemove = panes.filter((pane) => selectedPanesForRemoval.has(pane))
    for (const pane of toRemove) {
      await closePane(pane)
    }
  } else {
    while (panes.length > 2) {
      await closePane(panes[panes.length - 1])
    }
  }
  closeRemovePaneMenu()
}

removePaneMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  if (removePaneMenuEl) closeRemovePaneMenu()
  else showRemovePaneMenu()
})
document.addEventListener('click', closeRemovePaneMenu)

removePaneBtn.addEventListener('click', removeSelectedOrTrailingPanes)

/**
 * Hands one document's text to the main process, which raises the native save
 * dialog and writes it. The window cannot touch the filesystem itself.
 *
 * @returns `{path}`, or `{cancelled: true}` when the dialog was dismissed.
 */
async function exportTextToFile(name, content) {
  const res = await fetch('/api/documents/export-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || res.status)
  return body
}

function getPaneText(pane) {
  const content = pane.editor.get()
  return content.json !== undefined ? JSON.stringify(content.json, null, 2) : content.text
}

async function openDocInPane(pane, id) {
  const res = await fetch(`/api/documents/${id}`)
  if (!res.ok) return
  const doc = await res.json()
  pane.docId = doc.id
  pane.nameInput.value = doc.name
  pane.folderInput.value = doc.folder
  pane.tagsInput.value = doc.tags.join(', ')
  pane.setEditorText(doc.content)
  pane.statusEl.textContent = ''
  pane.refreshFieldDisplays()
  renderGroupTabs()
  refreshList()
}

async function savePane(pane) {
  const name = pane.nameInput.value.trim()
  if (!name) {
    pane.statusEl.textContent = t('status.nameRequired')
    return
  }
  const folder = pane.folderInput.value.trim()
  const tags = pane.tagsInput.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const content = getPaneText(pane)

  const method = pane.docId ? 'PUT' : 'POST'
  const url = pane.docId ? `/api/documents/${pane.docId}` : '/api/documents'

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, folder, tags, content }),
  })

  if (!res.ok) {
    pane.statusEl.textContent = t('status.saveError')
    return
  }

  const saved = await res.json()
  pane.docId = saved.id
  pane.statusEl.textContent = t('status.saved')
  renderGroupTabs()
  await refreshFilters()
  await refreshList()
}

function clearPaneDoc(pane, statusMessage = '') {
  pane.docId = null
  pane.nameInput.value = ''
  pane.folderInput.value = ''
  pane.tagsInput.value = ''
  pane.setEditorText('')
  pane.statusEl.textContent = statusMessage
  pane.refreshFieldDisplays()
  renderGroupTabs()
}

function resetPane(pane) {
  clearPaneDoc(pane)
  refreshList()
}

async function deletePane(pane) {
  if (!pane.docId) return
  if (!confirm(t('doc.confirmDeleteGeneric'))) return
  await fetch(`/api/documents/${pane.docId}`, { method: 'DELETE' })
  clearPaneDoc(pane)
  await refreshFilters()
  await refreshList()
}

// --- Sidebar: filters + list + open-menu ---

function buildFolderTree(folders) {
  const root = { children: {} }
  for (const folder of folders) {
    const parts = folder.split('/').filter(Boolean)
    let node = root
    const pathAcc = []
    for (const part of parts) {
      pathAcc.push(part)
      node.children ??= {}
      node.children[part] ??= { path: pathAcc.join('/'), children: undefined }
      node = node.children[part]
    }
  }
  return root
}

function renderFolderNode(node, container) {
  if (!node.children) return
  const ul = document.createElement('ul')
  ul.className = 'folder-tree'
  for (const [name, child] of Object.entries(node.children)) {
    const li = document.createElement('li')
    const label = document.createElement('label')
    label.className = 'folder-row'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = state.folders.has(child.path)
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.folders.add(child.path)
      } else {
        state.folders.delete(child.path)
      }
      refreshFilters()
      refreshList()
    })
    const span = document.createElement('span')
    span.textContent = name
    label.append(checkbox, span)
    li.appendChild(label)
    renderFolderNode(child, li)
    ul.appendChild(li)
  }
  container.appendChild(ul)
}

async function refreshFilters() {
  const [folders, tags] = await Promise.all([
    fetch('/api/documents/folders').then((r) => r.json()),
    fetch('/api/documents/tags').then((r) => r.json()),
  ])

  knownFolders = folders
  knownTags = tags

  folderListEl.innerHTML = ''
  renderFolderNode(buildFolderTree(folders), folderListEl)

  tagListEl.innerHTML = ''
  for (const tag of tags) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'chip' + (state.tags.has(tag) ? ' active' : '')
    btn.textContent = tag
    btn.addEventListener('click', () => {
      if (state.tags.has(tag)) {
        state.tags.delete(tag)
      } else {
        state.tags.add(tag)
      }
      refreshFilters()
      refreshList()
    })
    tagListEl.appendChild(btn)
  }
}

function paneLabel(index) {
  if (panes.length === 2) return index === 0 ? t('pane.openLeft') : t('pane.openRight')
  return t('pane.openIn', { n: panes[index].number })
}

function showOpenMenu(anchorEl, docId) {
  closeOpenMenu()
  const menu = document.createElement('div')
  menu.className = 'open-menu'
  panes.forEach((pane, index) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = paneLabel(index)
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      openDocInPane(pane, docId)
      closeOpenMenu()
    })
    menu.appendChild(btn)
  })
  anchorEl.appendChild(menu)
  openMenuEl = menu
}

function updateSelectionBar() {
  const count = selectedDocIds.size
  selectionBarEl.classList.toggle('hidden', count === 0)
  selectionCountEl.textContent = count > 0 ? t('selection.count', { count }) : ''

  selectionOpenListEl.innerHTML = ''
  for (const id of selectedDocIds) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'selection-open-item'
    btn.textContent = `↗ ${selectedDocNames.get(id) || ''}`
    btn.addEventListener('click', () => {
      openDocsInNewGroup([id])
    })
    selectionOpenListEl.appendChild(btn)
  }
}

function toggleSelected(id, li, name) {
  if (selectedDocIds.has(id)) {
    selectedDocIds.delete(id)
    selectedDocNames.delete(id)
  } else {
    selectedDocIds.add(id)
    selectedDocNames.set(id, name)
  }
  const checkbox = li.querySelector('.doc-select-checkbox')
  if (checkbox) checkbox.checked = selectedDocIds.has(id)
  li.classList.toggle('selected', selectedDocIds.has(id))
  updateSelectionBar()
}

function clearSelection() {
  selectedDocIds.clear()
  selectedDocNames.clear()
  docListEl.querySelectorAll('.doc-item.selected').forEach((el) => el.classList.remove('selected'))
  docListEl.querySelectorAll('.doc-select-checkbox').forEach((el) => {
    el.checked = false
  })
  updateSelectionBar()
}

openNewWindowBtn.addEventListener('click', () => {
  openDocsInNewGroup([...selectedDocIds])
  clearSelection()
})

selectModeBtn.addEventListener('click', () => {
  selectMode = !selectMode
  selectModeBtn.classList.toggle('active', selectMode)
  if (!selectMode) {
    clearSelection()
  }
  refreshList()
})

detailsToggleBtn.addEventListener('click', () => {
  showDetails = !showDetails
  detailsToggleBtn.classList.toggle('active', showDetails)
  refreshList()
})

clearFoldersBtn.addEventListener('click', () => {
  state.folders.clear()
  refreshFilters()
  refreshList()
})

clearTagsBtn.addEventListener('click', () => {
  state.tags.clear()
  refreshFilters()
  refreshList()
})

clearSelectionBtn.addEventListener('click', () => clearSelection())

async function refreshList() {
  const params = new URLSearchParams()
  if (state.search) {
    params.set('search', state.search)
    params.set('fields', state.searchFields.join(','))
  }
  if (state.folders.size) params.set('folders', [...state.folders].join(','))
  if (state.tags.size) params.set('tags', [...state.tags].join(','))

  const docs = await fetch(`/api/documents?${params}`).then((r) => r.json())

  docListEl.innerHTML = ''
  for (const doc of docs) {
    const openPane = panes.find((p) => p.docId === doc.id)
    const isOpen = Boolean(openPane)
    const isSelected = selectedDocIds.has(doc.id)
    const li = document.createElement('li')
    li.className = 'doc-item' + (isOpen ? ' active' : '') + (isSelected ? ' selected' : '')
    li.innerHTML = `
      <input type="checkbox" class="doc-select-checkbox${selectMode ? '' : ' hidden'}" ${isSelected ? 'checked' : ''} />
      <div class="doc-main">
        <div class="doc-name">${escapeHtml(doc.name)}</div>
        <div class="doc-badges${showDetails ? '' : ' hidden'}">
          ${doc.folder ? `<span class="doc-folder-badge">📁 ${escapeHtml(doc.folder)}</span>` : ''}
          ${doc.tags.map((t) => `<span class="doc-tag-badge">🏷 ${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="doc-timestamps${showDetails ? '' : ' hidden'}">
          <span>📅 ${formatDate(doc.created_at)}</span>
          <span>✎ ${formatDate(doc.updated_at)}</span>
        </div>
      </div>
      <div class="doc-actions">
        <button type="button" class="icon-btn open-toggle-btn" title="${isOpen ? t('doc.closeOpen') : t('doc.openRight')}">${isOpen ? '✕' : '+'}</button>
        <button type="button" class="icon-btn preview-btn" title="${t('doc.preview')}">👁</button>
        <button type="button" class="icon-btn export-btn" title="${t('doc.export')}">${DOWNLOAD_ICON}</button>
        <button type="button" class="icon-btn delete-btn" title="${t('doc.delete')}">🗑</button>
      </div>
    `
    const checkbox = li.querySelector('.doc-select-checkbox')
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleSelected(doc.id, li, doc.name)
    })
    li.addEventListener('click', (e) => {
      e.stopPropagation()
      if (e.ctrlKey || e.metaKey || selectMode) {
        toggleSelected(doc.id, li, doc.name)
        return
      }
      if (selectedDocIds.size > 0) {
        clearSelection()
      }
      showOpenMenu(li, doc.id)
    })
    li.querySelector('.open-toggle-btn').addEventListener('click', async (e) => {
      e.stopPropagation()
      if (openPane) {
        await closePane(openPane)
      } else {
        const pane = createPane()
        await openDocInPane(pane, doc.id)
      }
    })
    li.querySelector('.preview-btn').addEventListener('click', (e) => {
      e.stopPropagation()
      openPreview(doc)
    })
    li.querySelector('.export-btn').addEventListener('click', async (e) => {
      e.stopPropagation()
      // The stored copy, not whatever an editor happens to be showing: the
      // list row is about the document as saved.
      try {
        const res = await fetch(`/api/documents/${doc.id}`)
        if (!res.ok) throw new Error(res.status)
        const full = await res.json()
        await exportTextToFile(full.name, full.content)
      } catch (err) {
        alert(t('export.failed', { error: err.message }))
      }
    })
    li.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation()
      deleteDocFromList(doc)
    })
    docListEl.appendChild(li)
  }
}

async function deleteDocFromList(doc) {
  if (!confirm(t('doc.confirmDeleteNamed', { name: doc.name }))) return
  await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
  for (const pane of panes) {
    if (pane.docId === doc.id) {
      clearPaneDoc(pane, t('status.deleted'))
    }
  }
  selectedDocIds.delete(doc.id)
  updateSelectionBar()
  await refreshFilters()
  await refreshList()
}

// --- Preview / edit modal ---

function ensurePreviewEditor() {
  if (!previewEditor) {
    previewEditor = createJSONEditor({
      target: document.getElementById('preview-editor'),
      props: { content: { text: '' }, mode: 'text' },
    })
  }
  // The dialog has no zoom control of its own, but reading a document there in
  // a different size than the panes use would be jarring.
  applyEditorFontSize(document.getElementById('preview-editor'), lastFontSize)
  return previewEditor
}

async function openPreview(doc) {
  const res = await fetch(`/api/documents/${doc.id}`)
  if (!res.ok) return
  const full = await res.json()

  previewDocId = full.id
  previewNameInput.value = full.name
  previewFolderInput.value = full.folder
  previewTagsInput.value = full.tags.join(', ')
  previewStatusEl.textContent = ''
  ensurePreviewEditor().update({ text: full.content })
  resetPreviewPosition()
  previewModalEl.classList.remove('hidden')
}

function closePreview() {
  previewModalEl.classList.add('hidden')
  previewDocId = null
}

async function savePreview() {
  if (!previewDocId) return
  const name = previewNameInput.value.trim()
  if (!name) {
    previewStatusEl.textContent = t('status.nameRequired')
    return
  }
  const folder = previewFolderInput.value.trim()
  const tags = previewTagsInput.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const content = previewEditor.get()
  const contentText = content.json !== undefined ? JSON.stringify(content.json, null, 2) : content.text

  const res = await fetch(`/api/documents/${previewDocId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, folder, tags, content: contentText }),
  })

  if (!res.ok) {
    previewStatusEl.textContent = t('status.saveError')
    return
  }

  previewStatusEl.textContent = t('status.saved')
  await refreshFilters()
  await refreshList()
}

attachAutocomplete(previewFolderInput, () => knownFolders, { icon: '📁' })
attachAutocomplete(previewTagsInput, () => knownTags, { multi: true, icon: '🏷' })

previewSaveBtn.addEventListener('click', savePreview)
previewCloseBtn.addEventListener('click', closePreview)
// --- Dragging the preview dialog by its header ---

const previewDialogEl = previewModalEl.querySelector('.modal')
const previewHeaderEl = previewModalEl.querySelector('.modal-header')
let previewOffsetX = 0
let previewOffsetY = 0
let previewDrag = null

function resetPreviewPosition() {
  previewOffsetX = 0
  previewOffsetY = 0
  previewDialogEl.style.transform = ''
}

// Translating keeps the dialog's flex centring intact, so reopening it after
// a drag lands back in the middle with a single style reset.
previewHeaderEl.addEventListener('mousedown', (e) => {
  if (e.target.closest('button')) return
  e.preventDefault()
  const rect = previewDialogEl.getBoundingClientRect()
  previewDrag = {
    grabX: e.clientX - previewOffsetX,
    grabY: e.clientY - previewOffsetY,
    left: rect.left - previewOffsetX,
    top: rect.top - previewOffsetY,
    width: rect.width,
  }
})

document.addEventListener('mousemove', (e) => {
  if (!previewDrag) return
  const { grabX, grabY, left, top, width } = previewDrag
  // Keep a strip of the dialog on screen so it can always be grabbed again.
  const margin = 120
  const x = Math.min(
    Math.max(e.clientX - grabX, margin - left - width),
    window.innerWidth - margin - left
  )
  const y = Math.min(Math.max(e.clientY - grabY, -top), window.innerHeight - 40 - top)
  previewOffsetX = x
  previewOffsetY = y
  previewDialogEl.style.transform = `translate(${x}px, ${y}px)`
})

document.addEventListener('mouseup', () => {
  previewDrag = null
})

// Only a click that both started and ended on the backdrop closes the
// preview. Without the mousedown check, dragging to select text inside the
// editor and releasing outside the dialog counts as a backdrop click — which
// is easy to do by accident once a document is long enough to scroll.
let previewPressStartedOnBackdrop = false
previewModalEl.addEventListener('mousedown', (e) => {
  previewPressStartedOnBackdrop = e.target === previewModalEl
})
previewModalEl.addEventListener('click', (e) => {
  if (e.target === previewModalEl && previewPressStartedOnBackdrop) closePreview()
})

addPaneBtn.addEventListener('click', () => createPane())

toggleSidebarBtn.addEventListener('click', () => {
  document.querySelector('.app').classList.toggle('sidebar-collapsed')
})

advancedSearchBtn.addEventListener('click', () => {
  advancedSearchEl.classList.toggle('hidden')
})

function updateSearchFields() {
  state.searchFields = [
    searchFieldNameCheckbox.checked && 'name',
    searchFieldFolderCheckbox.checked && 'folder',
    searchFieldTagCheckbox.checked && 'tag',
  ].filter(Boolean)
  localStorage.setItem('searchFields', JSON.stringify(state.searchFields))
  refreshList()
}
searchFieldNameCheckbox.addEventListener('change', updateSearchFields)
searchFieldFolderCheckbox.addEventListener('change', updateSearchFields)
searchFieldTagCheckbox.addEventListener('change', updateSearchFields)

const savedSearchFields = JSON.parse(localStorage.getItem('searchFields') || 'null')
if (savedSearchFields) {
  state.searchFields = savedSearchFields
  searchFieldNameCheckbox.checked = savedSearchFields.includes('name')
  searchFieldFolderCheckbox.checked = savedSearchFields.includes('folder')
  searchFieldTagCheckbox.checked = savedSearchFields.includes('tag')
}

let searchTimeout
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    state.search = searchInput.value.trim()
    refreshList()
  }, 250)
})

document.documentElement.lang = lang
langToggleBtn.textContent = lang === 'tr' ? 'EN' : 'TR'
applyI18n(document)

createGroup()
createPane()
createPane()
refreshFilters()
refreshList()

const openIds = new URLSearchParams(location.search).getAll('open')
if (openIds.length) {
  while (panes.length < openIds.length) {
    createPane()
  }
  openIds.forEach((id, index) => {
    openDocInPane(panes[index], id)
  })
}
