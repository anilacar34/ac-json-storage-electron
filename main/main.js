import { app, BrowserWindow, dialog, Menu, shell } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'

import * as db from './db.js'
import { startServer } from './server.js'

/**
 * `DB_PATH` overrides the location; otherwise the database lives in Electron's
 * per-user app-data directory (`~/.config/ac-json-storage` on Linux,
 * `%APPDATA%\ac-json-storage` on Windows,
 * `~/Library/Application Support/ac-json-storage` on macOS).
 */
function resolveDbPath() {
  return process.env.DB_PATH || path.join(app.getPath('userData'), 'db.sqlite')
}

let mainWindow = null
let server = null
let database = null

/**
 * Raises the native save dialog and writes the export there. The renderer
 * cannot touch the filesystem, so `POST /api/documents/export` hands the bytes
 * over to this instead.
 *
 * @returns the chosen path, or `null` when the dialog was dismissed.
 */
async function saveFile(defaultName, bytes) {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (canceled || !filePath) return null

  await fs.writeFile(filePath, bytes)
  return filePath
}

function buildMenu() {
  // Kept minimal and hidden behind Alt (see `autoHideMenuBar`): the app has no
  // menu-driven features, but the roles keep the standard editing and window
  // accelerators registered.
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    center: true,
    title: 'AC JSON Storage',
    backgroundColor: '#ffffff',
    icon: path.join(import.meta.dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      // The window only ever loads the loopback server and talks to it over
      // `fetch`, so it needs no privileged APIs at all.
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Anything that is not our own loopback origin belongs in the user's browser.
  const isAppUrl = (target) => target.startsWith(url) || target === url.slice(0, -1)
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    if (!isAppUrl(target)) shell.openExternal(target)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, target) => {
    if (!isAppUrl(target)) {
      event.preventDefault()
      shell.openExternal(target)
    }
  })

  mainWindow.loadURL(url)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.whenReady().then(async () => {
    try {
      database = db.open(resolveDbPath())
      server = await startServer(database, { saveFile })
    } catch (err) {
      dialog.showErrorBox('AC JSON Storage', `Failed to start:\n\n${err.stack ?? err.message}`)
      app.exit(1)
      return
    }

    buildMenu()
    createWindow(server.url)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow(server.url)
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('will-quit', async () => {
    await server?.close()
    database?.close()
  })
}
