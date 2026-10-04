import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const port = Number(process.env.PREVIEW_PORT ?? 18490)
const host = process.env.PREVIEW_HOST ?? '0.0.0.0'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
}

async function send(res, file, status = 200) {
  const ext = path.extname(file)
  const body = await readFile(file)
  res.writeHead(status, { 'Content-Type': TYPES[ext] ?? 'application/octet-stream' })
  res.end(body)
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    let rel = decodeURIComponent(url.pathname)
    if (rel.endsWith('/')) rel += 'index.html'
    if (rel === '/') rel = '/index.html'
    const file = path.normalize(path.join(dist, rel.replace(/^\/+/, '')))
    if (!file.startsWith(dist)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }
    try {
      const st = await stat(file)
      if (st.isDirectory()) {
        await send(res, path.join(file, 'index.html'))
        return
      }
      await send(res, file)
    } catch {
      await send(res, path.join(dist, 'index.html'))
    }
  } catch (err) {
    res.writeHead(500)
    res.end(String(err))
  }
})

server.listen(port, host, () => {
  console.log(`Static preview http://127.0.0.1:${port}/  (bind ${host})`)
})
