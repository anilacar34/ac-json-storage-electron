// Records the demo media in docs/: drives a throwaway copy of the app through
// a scripted tour and writes one PNG per frame. `make-clips.sh` turns those
// frames into the GIFs. Run it with the project's own Electron:
//
//   ./node_modules/.bin/electron tools/record-demo.mjs
//   ./tools/make-clips.sh
//
// Nothing here ships with the app, and it never touches your real database.
import { app, BrowserWindow } from 'electron'
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'
import { open } from '../main/db.js'
import { startServer } from '../main/server.js'

const FRAMES = process.env.FRAMES || path.join(os.tmpdir(), 'ac-json-storage-demo-frames')
const OVERLAY = fs.readFileSync(path.join(import.meta.dirname, 'demo-overlay.js'), 'utf8')
const WIDTH = 1180, HEIGHT = 760, SCALE_TO = 900
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acrec-'))
fs.rmSync(FRAMES, { recursive: true, force: true })
fs.mkdirSync(FRAMES, { recursive: true })
app.setPath('userData', path.join(dir, 'userData'))

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let frame = 0
let recording = false
const marks = []
let markStart = 0

app.whenReady().then(async () => {
  const db = open(path.join(dir, 'db.sqlite'))
  const srv = await startServer(db, {
    saveFile: async (name) => `/home/you/backups/${name}`,
  })
  const base = srv.url.slice(0, -1)
  const add = (name, folder, content) => fetch(base + '/api/documents', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, folder, tags: [], content }),
  })
  await add('Deploy Pipeline', 'work/ci', '{\n  "stages": ["build", "test", "deploy"],\n  "parallel": true\n}')
  await add('Staging Secrets', 'work/env', '{\n  "API_URL": "https://staging.example.com",\n  "DEBUG": true\n}')
  await add('Production Env', 'work/env', '{\n  "API_URL": "https://example.com",\n  "DEBUG": false\n}')

  const win = new BrowserWindow({ width: WIDTH, height: HEIGHT, show: true, webPreferences: { backgroundThrottling: false } })
  const page = (js) => win.webContents.executeJavaScript(js)
  const demo = (js) => page(`(async () => { ${js} })()`)

  async function mark(label) {
    console.log('  step:', label, 'frame', frame)
    if (marks.length) marks.at(-1).to = frame
    marks.push({ label, from: frame })
  }

  async function recordLoop() {
    while (recording) {
      const started = Date.now()
      try {
        const img = await win.webContents.capturePage()
        fs.writeFileSync(
          path.join(FRAMES, String(frame++).padStart(5, '0') + '.png'),
          img.resize({ width: SCALE_TO, quality: 'good' }).toPNG(),
        )
      } catch {}
      const left = 100 - (Date.now() - started)
      if (left > 0) await wait(left)
    }
  }

  let first = true
  win.webContents.on('did-finish-load', async () => {
   try {
    if (first) {
      first = false
      await wait(1200)
      // Deterministic look regardless of what any earlier run left behind.
      await page(`localStorage.setItem('theme','dark'); localStorage.setItem('lang','en'); localStorage.removeItem('editorFontSize')`)
      win.webContents.reload()
      return
    }
    await wait(2600)
    await page(OVERLAY + '\n;null')
    recording = true
    recordLoop()
    const started = Date.now()

    try {
      await mark('intro')
      await demo(`await __demo.caption('AC JSON Storage — a local store for JSON documents')`)
      await wait(1900)

      await mark('open')
      await demo(`
        await __demo.caption('Open documents side by side')
        const row = (name) => {
          const found = [...document.querySelectorAll('.doc-item')].find((r) => r.textContent.includes(name))
          if (!found) throw new Error('row not in the list: ' + name)
          return found
        }
        window.__row = row
        // Clicking the row offers the panes that are already open, which keeps
        // the demo to two editors instead of spawning one per document.
        await __demo.click(row('Deploy Pipeline').querySelector('.doc-main'))
        await new Promise((r) => setTimeout(r, 700))
        await __demo.click(document.querySelector('.open-menu button'))
        await new Promise((r) => setTimeout(r, 1100))
        await __demo.click(row('Production Env').querySelector('.doc-main'))
        await new Promise((r) => setTimeout(r, 700))
        await __demo.click(document.querySelectorAll('.open-menu button')[1])
      `)
      await wait(1500)

      await mark('select')
      await demo(`
        await __demo.caption('Select several documents and give them their own tab')
        await __demo.click('#select-mode-btn')
        await new Promise((r) => setTimeout(r, 600))
        await __demo.click(__row('Getting Started').querySelector('.doc-select-checkbox'))
        await __demo.click(__row('API Reference').querySelector('.doc-select-checkbox'))
        await new Promise((r) => setTimeout(r, 1000))
        await __demo.click('#open-new-window-btn')
        await new Promise((r) => setTimeout(r, 1400))
        // Leave select mode so the checkboxes stop crowding the list.
        await __demo.click('#select-mode-btn')
      `)
      await wait(1800)

      await mark('search')
      await demo(`
        await __demo.caption('Search, and filter by folder or tag')
        await __demo.type('#search', 'env')
        await new Promise((r) => setTimeout(r, 1100))
        await __demo.type('#search', '')
        await new Promise((r) => setTimeout(r, 500))
        await __demo.click([...document.querySelectorAll('#tag-list .chip')].find((c) => c.textContent === 'guide'))
        await new Promise((r) => setTimeout(r, 1100))
        await __demo.click('#clear-tags-btn')
      `)
      await wait(1200)

      await mark('zoom')
      await demo(`
        await __demo.caption('Each editor has its own font size')
        const zoom = document.querySelector('.pane-zoom')
        await __demo.click(zoom.querySelector('.zoom-in'))
        await __demo.click(zoom.querySelector('.zoom-in'), { move: false })
        await __demo.click(zoom.querySelector('.zoom-in'), { move: false })
        await new Promise((r) => setTimeout(r, 700))
        await __demo.click(zoom.querySelector('.zoom-value'))
      `)
      await wait(1300)

      await mark('compare')
      await demo(`
        await __demo.caption('Compare two editors — unsaved edits included')
        await __demo.click('#compare-btn')
      `)
      await wait(2600)
      await demo(`await __demo.click('.cmp-close')`)
      await wait(900)

      await mark('preview')
      await demo(`
        await __demo.caption('Preview and edit straight from the list')
        await __demo.click(__row('Staging Secrets').querySelector('.preview-btn'))
      `)
      await wait(2300)
      await demo(`await __demo.click('#preview-close-btn')`)
      await wait(900)

      await mark('export-one')
      await demo(`
        await __demo.caption('Save a single document as a plain .json file')
        await __demo.moveTo(__row('Deploy Pipeline').querySelector('.export-btn'))
        await __demo.click(document.querySelector('.pane-export'))
      `)
      await wait(1800)

      await mark('export-many')
      await demo(`
        await __demo.caption('Export a backup — pick it category by category')
        await __demo.click('.io-export')
      `)
      await wait(1600)
      await demo(`
        // Clear the lot, then pick the two categories back — the count in the
        // footer and on the button follows along.
        await __demo.click('.io-export-all-input')
        await new Promise((r) => setTimeout(r, 800))
        await __demo.type('.io-export-search', 'work')
        await new Promise((r) => setTimeout(r, 1000))
        const group = (name) => [...document.querySelectorAll('.io-export-group')].find((g) => g.textContent.includes(name))
        await __demo.click(group('work/ci').querySelector('input'))
        await new Promise((r) => setTimeout(r, 600))
        await __demo.click(group('work/env').querySelector('input'))
      `)
      await wait(1700)
      await demo(`await __demo.click('.io-export-confirm')`)
      await wait(2200)

      await mark('import')
      await demo(`
        await __demo.caption('Adding a backup as a file? It says so, and offers to restore instead')
        HTMLInputElement.prototype.click = function () {}
        await __demo.click('.io-import')
        const backup = JSON.stringify({ format: 'ac-json-storage-export', version: 1, documents: [
          { id: '1', name: 'a', folder: '', content: '{}', tags: [], created_at: 'x', updated_at: 'x' },
          { id: '2', name: 'b', folder: '', content: '{}', tags: [], created_at: 'x', updated_at: 'x' }] })
        const dt = new DataTransfer()
        dt.items.add(new File([backup], 'ac-json-storage-20260821.json', { type: 'application/json' }))
        const input = document.querySelector('.io-file-input')
        input.files = dt.files
        input.dispatchEvent(new Event('change'))
      `)
      await wait(2800)
      await demo(`await __demo.click('.io-cancel')`)
      await wait(900)

      await mark('delete')
      await demo(`
        await __demo.caption('Deleting everything asks you to type the word')
        await __demo.click('.io-delete-all')
        await new Promise((r) => setTimeout(r, 900))
        await __demo.type('.io-del-input', 'YES')
      `)
      await wait(1600)
      await demo(`await __demo.click('.io-del-cancel')`)
      await wait(800)

      await mark('lang')
      await demo(`
        await __demo.caption('English and Turkish, switched at runtime')
        await __demo.click('#lang-toggle-btn')
      `)
      await wait(2400)
      await demo(`
        await __demo.click('#lang-toggle-btn', { move: false })
        __demo.hideCursor()
        await __demo.caption('Everything lives in one local SQLite file')
      `)
      await wait(2200)
      await demo(`await __demo.caption('')`)
      await wait(600)
    } catch (err) {
      console.log('TOUR-ERROR:', err.message)
    }

    recording = false
    await wait(300)
    marks.at(-1).to = frame
    const seconds = (Date.now() - started) / 1000
    fs.writeFileSync(path.join(FRAMES, 'marks.json'), JSON.stringify({ frames: frame, seconds, fps: frame / seconds, marks }, null, 2))
    console.log(`frames=${frame} seconds=${seconds.toFixed(1)} fps=${(frame / seconds).toFixed(2)}`)
    console.log(marks.map((m) => `${m.label}: ${m.from}-${m.to}`).join('\n'))
    srv.close(); db.close(); fs.rmSync(dir, { recursive: true, force: true })
    app.exit(0)
   } catch (err) {
     console.log('SETUP-ERROR:', err.message)
     app.exit(3)
   }
  })
  win.loadURL(srv.url)
})
setTimeout(() => { console.log('TIMEOUT'); app.exit(2) }, 180000)
