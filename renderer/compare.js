// Side-by-side JSON comparison.
//
// vanilla-jsoneditor ships no diff of its own, so both the structural diff and
// the aligned two-column view are built here. app.js owns the panes and hands
// them over through `openCompare()`; nothing in this module reaches back into
// its internals.

const TEXT = {
  en: {
    title: 'Compare',
    onlyDiffs: 'Differences only',
    identical: 'The two sides are identical.',
    summary: '{total} differences: {added} added · {removed} removed · {changed} changed',
    empty: '{label} is empty.',
    invalid: '{label} does not contain valid JSON: {error}',
    needTwo: 'At least two editors are needed to compare.',
    close: 'Close',
  },
  tr: {
    title: 'Karşılaştırma',
    onlyDiffs: 'Sadece farklar',
    identical: 'İki taraf birebir aynı.',
    summary: '{total} fark: {added} eklendi · {removed} silindi · {changed} değişti',
    empty: '{label} boş.',
    invalid: '{label} geçerli JSON içermiyor: {error}',
    needTwo: 'Karşılaştırmak için en az iki editör gerekli.',
    close: 'Kapat',
  },
}

let lang = localStorage.getItem('lang') === 'tr' ? 'tr' : 'en'

function t(key, params) {
  let str = TEXT[lang][key] ?? key
  for (const [k, v] of Object.entries(params || {})) str = str.replaceAll(`{${k}}`, v)
  return str
}

// --- diff ---------------------------------------------------------------

const isContainer = (value) => value !== null && typeof value === 'object'

const MAX_VALUE_CHARS = 200

function label(value) {
  if (Array.isArray(value)) return `[ ${value.length} ]`
  if (isContainer(value)) return `{ ${Object.keys(value).length} }`
  const text = JSON.stringify(value)
  return text.length > MAX_VALUE_CHARS ? text.slice(0, MAX_VALUE_CHARS) + '…' : text
}

function has(container, key) {
  return Array.isArray(container) ? key < container.length : Object.hasOwn(container, key)
}

/// Objects are matched by key, arrays strictly by index — a positional diff is
/// predictable and never claims a move it cannot prove.
function childKeys(a, b) {
  if (Array.isArray(a)) {
    const length = Math.max(a.length, b.length)
    return Array.from({ length }, (_, i) => [i, `[${i}]`])
  }
  const keys = Object.keys(a)
  for (const key of Object.keys(b)) if (!Object.hasOwn(a, key)) keys.push(key)
  return keys.map((key) => [key, key])
}

/// Walks a value that exists on one side only, so an added or removed subtree
/// still shows what it actually held.
function expandOneSided(value, depth, side, status, rows) {
  const entries = Array.isArray(value)
    ? value.map((item, i) => [`[${i}]`, item])
    : Object.entries(value)
  for (const [key, child] of entries) {
    const row = { depth, key, left: null, right: null, status }
    row[side] = label(child)
    rows.push(row)
    if (isContainer(child)) expandOneSided(child, depth + 1, side, status, rows)
  }
}

function diffInto(key, depth, a, b, hasA, hasB, rows) {
  if (hasA && hasB) {
    const sameKind =
      isContainer(a) && isContainer(b) && Array.isArray(a) === Array.isArray(b)

    if (sameKind) {
      const row = { depth, key, left: label(a), right: label(b), status: 'same' }
      rows.push(row)
      const firstChild = rows.length
      for (const [childKey, childLabel] of childKeys(a, b)) {
        diffInto(childLabel, depth + 1, a[childKey], b[childKey], has(a, childKey), has(b, childKey), rows)
      }
      // A container is only interesting when something below it moved.
      if (rows.slice(firstChild).some((child) => child.status !== 'same')) row.status = 'nested'
      return
    }

    const equal = !isContainer(a) && !isContainer(b) && a === b
    rows.push({ depth, key, left: label(a), right: label(b), status: equal ? 'same' : 'changed' })
    if (!equal) {
      if (isContainer(a)) expandOneSided(a, depth + 1, 'left', 'changed', rows)
      if (isContainer(b)) expandOneSided(b, depth + 1, 'right', 'changed', rows)
    }
    return
  }

  const side = hasB ? 'right' : 'left'
  const status = hasB ? 'added' : 'removed'
  const value = hasB ? b : a
  const row = { depth, key, left: null, right: null, status }
  row[side] = label(value)
  rows.push(row)
  if (isContainer(value)) expandOneSided(value, depth + 1, side, status, rows)
}

export function diffJson(a, b) {
  const rows = []
  diffInto('', 0, a, b, true, true, rows)
  // The synthetic root row carries no key; its children are the real content.
  // It is only dropped when there are children to speak for it — comparing two
  // primitives, or two empty containers, leaves the root as the only row.
  const [root] = rows
  const body = rows.length > 1 ? rows.slice(1) : rows
  const counts = { added: 0, removed: 0, changed: 0 }
  for (const row of body) {
    if (row.status === 'added') counts.added += 1
    else if (row.status === 'removed') counts.removed += 1
    else if (row.status === 'changed') counts.changed += 1
  }
  return { rows: body, counts, rootStatus: root.status }
}

// --- view ---------------------------------------------------------------

const styles = document.createElement('style')
styles.textContent = `
  :root {
    --cmp-added-bg: #e6ffec;
    --cmp-removed-bg: #ffebe9;
    --cmp-changed-bg: #fff8c5;
    --cmp-absent-bg: #f6f8fa;
  }
  :root[data-theme='dark'] {
    --cmp-added-bg: #12261e;
    --cmp-removed-bg: #2d1214;
    --cmp-changed-bg: #2b2413;
    --cmp-absent-bg: #131820;
  }
  #compare-modal .modal {
    width: min(1100px, 94vw);
    height: 85vh;
  }
  #compare-modal .modal-header {
    cursor: move;
    user-select: none;
  }
  #compare-modal .modal-header button {
    cursor: pointer;
  }
  .cmp-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 10px 14px;
    border-bottom: 1px solid var(--color-border);
  }
  .cmp-toolbar select {
    max-width: 240px;
  }
  .cmp-summary {
    margin-left: auto;
    font-size: 12px;
    color: var(--color-text-muted);
  }
  .cmp-only-diffs {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
  }
  .cmp-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .cmp-grid {
    display: grid;
    grid-template-columns: minmax(360px, 1fr) minmax(360px, 1fr);
    min-width: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    line-height: 1.7;
  }
  .cmp-head {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 4px 10px;
    font-weight: 600;
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }
  .cmp-cell {
    padding: 0 10px;
    white-space: pre;
  }
  .cmp-cell.cmp-side-right,
  .cmp-head.cmp-side-right {
    border-left: 1px solid var(--color-border);
  }
  .cmp-added { background: var(--cmp-added-bg); }
  .cmp-removed { background: var(--cmp-removed-bg); }
  .cmp-changed { background: var(--cmp-changed-bg); }
  .cmp-absent { background: var(--cmp-absent-bg); }
  .cmp-mark {
    display: inline-block;
    width: 1.2em;
    color: var(--color-text-muted);
  }
  .cmp-key { color: var(--color-text-secondary); }
  .cmp-val { color: var(--color-text); }
  .cmp-message {
    padding: 16px;
    line-height: 1.5;
  }
`
document.head.appendChild(styles)

const modal = document.createElement('div')
modal.className = 'modal-backdrop hidden'
modal.id = 'compare-modal'
modal.innerHTML = `
  <div class="modal">
    <div class="modal-header">
      <span class="cmp-title"></span>
      <button type="button" class="pane-close cmp-close">×</button>
    </div>
    <div class="cmp-toolbar">
      <select class="cmp-left-select"></select>
      <span>↔</span>
      <select class="cmp-right-select"></select>
      <label class="cmp-only-diffs">
        <input type="checkbox" class="cmp-only-diffs-input" />
        <span class="cmp-only-diffs-label"></span>
      </label>
      <span class="cmp-summary"></span>
    </div>
    <div class="cmp-scroll"><div class="cmp-grid"></div></div>
  </div>
`
document.body.appendChild(modal)

const dialogEl = modal.querySelector('.modal')
const headerEl = modal.querySelector('.modal-header')
const leftSelect = modal.querySelector('.cmp-left-select')
const rightSelect = modal.querySelector('.cmp-right-select')
const onlyDiffsInput = modal.querySelector('.cmp-only-diffs-input')
const summaryEl = modal.querySelector('.cmp-summary')
const scrollEl = modal.querySelector('.cmp-scroll')
const gridEl = modal.querySelector('.cmp-grid')

// Snapshot of the editors taken when the dialog opened; the backdrop blocks
// editing, so it cannot go stale while the dialog is up.
let sources = []

function renderLabels() {
  modal.querySelector('.cmp-title').textContent = t('title')
  modal.querySelector('.cmp-close').title = t('close')
  modal.querySelector('.cmp-only-diffs-label').textContent = t('onlyDiffs')
}

new MutationObserver(() => {
  const next = document.documentElement.lang === 'tr' ? 'tr' : 'en'
  if (next === lang) return
  lang = next
  renderLabels()
  if (!modal.classList.contains('hidden')) render()
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })

function sourceLabel(source) {
  return source.name ? `${source.label} — ${source.name}` : source.label
}

function parseSource(source) {
  const text = (source.text ?? '').trim()
  if (!text) return { error: t('empty', { label: sourceLabel(source) }) }
  try {
    return { value: JSON.parse(text) }
  } catch (err) {
    return { error: t('invalid', { label: sourceLabel(source), error: err.message }) }
  }
}

function cell(row, side) {
  const value = row[side]
  const el = document.createElement('div')
  el.className = `cmp-cell cmp-side-${side}`

  if (value === null) {
    el.classList.add('cmp-absent')
    el.textContent = ''
    return el
  }
  if (row.status !== 'same' && row.status !== 'nested') {
    el.classList.add(`cmp-${row.status}`)
  }

  const mark = document.createElement('span')
  mark.className = 'cmp-mark'
  mark.textContent =
    row.status === 'added' ? '+' : row.status === 'removed' ? '−' : row.status === 'changed' ? '~' : ''
  el.appendChild(mark)

  const key = document.createElement('span')
  key.className = 'cmp-key'
  key.style.paddingLeft = `${(row.depth - 1) * 14}px`
  key.textContent = row.key ? `${row.key}: ` : ''
  el.appendChild(key)

  const val = document.createElement('span')
  val.className = 'cmp-val'
  val.textContent = value
  el.appendChild(val)
  return el
}

function showMessage(message) {
  gridEl.innerHTML = ''
  summaryEl.textContent = ''
  const el = document.createElement('div')
  el.className = 'cmp-message'
  el.textContent = message
  el.style.gridColumn = '1 / -1'
  gridEl.appendChild(el)
}

function render() {
  const left = sources[Number(leftSelect.value)]
  const right = sources[Number(rightSelect.value)]
  if (!left || !right) return

  const parsedLeft = parseSource(left)
  const parsedRight = parseSource(right)
  if (parsedLeft.error || parsedRight.error) {
    showMessage(parsedLeft.error || parsedRight.error)
    return
  }

  const { rows, counts } = diffJson(parsedLeft.value, parsedRight.value)
  const total = counts.added + counts.removed + counts.changed
  summaryEl.textContent = total === 0 ? t('identical') : t('summary', { total, ...counts })

  gridEl.innerHTML = ''
  for (const [side, source] of [['left', left], ['right', right]]) {
    const head = document.createElement('div')
    head.className = `cmp-head cmp-side-${side}`
    head.textContent = sourceLabel(source)
    gridEl.appendChild(head)
  }

  const visible = onlyDiffsInput.checked
    ? rows.filter((row) => row.status !== 'same')
    : rows

  if (!visible.length) {
    const el = document.createElement('div')
    el.className = 'cmp-message'
    el.textContent = t('identical')
    el.style.gridColumn = '1 / -1'
    gridEl.appendChild(el)
    return
  }

  const fragment = document.createDocumentFragment()
  for (const row of visible) {
    fragment.appendChild(cell(row, 'left'))
    fragment.appendChild(cell(row, 'right'))
  }
  gridEl.appendChild(fragment)
  scrollEl.scrollTop = 0
}

function fillSelect(select, selectedIndex) {
  select.innerHTML = ''
  sources.forEach((source, index) => {
    const option = document.createElement('option')
    option.value = String(index)
    option.textContent = sourceLabel(source)
    select.appendChild(option)
  })
  select.value = String(selectedIndex)
}

function close() {
  modal.classList.add('hidden')
}

leftSelect.addEventListener('change', render)
rightSelect.addEventListener('change', render)
onlyDiffsInput.addEventListener('change', render)
modal.querySelector('.cmp-close').addEventListener('click', close)

// Same guard the other dialogs use: a drag that ends on the backdrop is not a
// backdrop click.
let pressStartedOnBackdrop = false
modal.addEventListener('mousedown', (event) => {
  pressStartedOnBackdrop = event.target === modal
})
modal.addEventListener('click', (event) => {
  if (event.target === modal && pressStartedOnBackdrop) close()
})

let offsetX = 0
let offsetY = 0
let drag = null

headerEl.addEventListener('mousedown', (event) => {
  if (event.target.closest('button')) return
  event.preventDefault()
  const rect = dialogEl.getBoundingClientRect()
  drag = {
    grabX: event.clientX - offsetX,
    grabY: event.clientY - offsetY,
    left: rect.left - offsetX,
    top: rect.top - offsetY,
    width: rect.width,
  }
})

document.addEventListener('mousemove', (event) => {
  if (!drag) return
  const margin = 120
  offsetX = Math.min(
    Math.max(event.clientX - drag.grabX, margin - drag.left - drag.width),
    window.innerWidth - margin - drag.left
  )
  offsetY = Math.min(Math.max(event.clientY - drag.grabY, -drag.top), window.innerHeight - 40 - drag.top)
  dialogEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`
})

document.addEventListener('mouseup', () => {
  drag = null
})

renderLabels()

/// `panes` is `[{ label, name, text }]` in on-screen order.
export function openCompare(panes) {
  if (panes.length < 2) {
    sources = []
    showMessage(t('needTwo'))
  } else {
    sources = panes
    fillSelect(leftSelect, 0)
    fillSelect(rightSelect, 1)
    render()
  }
  offsetX = 0
  offsetY = 0
  dialogEl.style.transform = ''
  modal.classList.remove('hidden')
}
