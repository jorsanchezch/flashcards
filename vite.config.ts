import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const repoName =
  process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'flashcards'
const defaultBase =
  process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? defaultBase,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    host: '::',
    port: 18765,
    strictPort: true,
  },
  preview: {
    host: '::',
    port: 18765,
    strictPort: true,
  },
})
