import { readdir, readFile, writeFile, stat, mkdir, cp } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const vaultFlashcards = path.join(root, 'obsidian-vault', 'flashcards')
const publicFlashcards = path.join(root, 'public', 'flashcards')

async function syncFromVault() {
  try {
    await stat(vaultFlashcards)
  } catch {
    return
  }
  await mkdir(publicFlashcards, { recursive: true })
  await cp(vaultFlashcards, publicFlashcards, { recursive: true, force: true })
}

async function walkMd(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...(await walkMd(path.join(dir, entry.name), rel)))
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      files.push(rel.replace(/\\/g, '/'))
    }
  }
  return files
}

async function main() {
  await syncFromVault()
  const files = await walkMd(publicFlashcards)
  files.sort((a, b) => a.localeCompare(b, 'es'))
  const manifest = {
    generatedAt: new Date().toISOString(),
    count: files.length,
    files,
  }
  await writeFile(
    path.join(publicFlashcards, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )
  console.log(`Flashcard manifest: ${files.length} cards`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
