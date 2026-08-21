import express from 'express'
import path from 'node:path'

import { ApiError, documentsRouter } from './routes/documents.js'

const RENDERER_DIR = path.join(import.meta.dirname, '..', 'renderer')

/**
 * Serves the API and the frontend on a loopback port picked by the OS. The
 * window then loads that URL, so the frontend is ordinary same-origin web
 * code — no CORS, no injected base URL, no `file://` restrictions.
 *
 * @returns {Promise<{url: string, close: () => Promise<void>}>}
 */
export function startServer(db, { saveFile }) {
  const app = express()

  app.use('/api/documents', documentsRouter(db, { saveFile }))
  app.use(express.static(RENDERER_DIR))

  app.use((_req, res) => {
    res.status(404).type('text/plain').send('Not Found')
  })

  // eslint-disable-next-line no-unused-vars -- Express needs the 4-arg shape.
  app.use((err, _req, res, _next) => {
    const status = err instanceof ApiError ? err.status : 500
    if (status === 500) console.error(err)
    res.status(status).json({ error: err.message })
  })

  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({
        url: `http://127.0.0.1:${port}/`,
        close: () => new Promise((done) => server.close(done)),
      })
    })
    server.on('error', reject)
  })
}
