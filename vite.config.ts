// @ts-nocheck
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import {
  applySchema,
  cardsFromDb,
  glossaryFromDb,
  openFlashcardsDb,
  seedDatabase,
} from './scripts/sqlite/sync.mjs'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const repoName =
  process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'flashcards'
const defaultBase =
  process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/'

function sqliteLocalApi(): Plugin {
  const handle = async (urlPath: string, res: import('node:http').ServerResponse) => {
    const db = openFlashcardsDb()
    applySchema(db)
    const row = db.prepare('SELECT COUNT(*) AS n FROM cards').get() as { n: number }
    if (!row?.n) await seedDatabase(db)
    const payload =
      urlPath.endsWith('/glossary')
        ? { entries: glossaryFromDb(db) }
        : { cards: cardsFromDb(db) }
    db.close()
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(payload))
  }

  return {
    name: 'sqlite-local-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        if (url !== '/api/local/cards' && url !== '/api/local/glossary' && url !== '/api/local/bible-search') {
          next()
          return
        }
        if (url === '/api/local/bible-search') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ hits: [], version: 'ntv' }))
          return
        }
        void handle(url, res).catch((err) => {
          res.statusCode = 500
          res.end(String(err))
        })
      })
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? defaultBase,
  plugins: [react(), tailwindcss(), sqliteLocalApi()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 18480,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 18480,
    strictPort: true,
  },
})
