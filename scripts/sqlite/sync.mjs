#!/usr/bin/env node
/**
 * Local SQLite seed + export to static JSON for GitHub Pages.
 * Usage: node scripts/sqlite/sync.mjs [seed|export|all]
 */
import { DatabaseSync } from 'node:sqlite'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const dbDir = path.join(root, 'data')
const dbPath = path.join(dbDir, 'flashcards.db')
const schemaPath = path.join(root, 'scripts', 'sqlite', 'schema.sql')
const publicFlashcards = path.join(root, 'public', 'flashcards')
const publicData = path.join(root, 'public', 'data')
const DEFAULT_VERSION = 'ntv'

const BOOK_PREFIXES = [
  { id: '1-samuel', label: '1 Samuel', prefix: '1-samuel', canon: 8 },
  { id: '2-samuel', label: '2 Samuel', prefix: '2-samuel', canon: 9 },
  { id: '1-reyes', label: '1 Reyes', prefix: '1-reyes', canon: 10 },
  { id: '2-reyes', label: '2 Reyes', prefix: '2-reyes', canon: 11 },
]

export function openFlashcardsDb(file = dbPath) {
  const db = new DatabaseSync(file)
  db.exec('PRAGMA foreign_keys = ON;')
  return db
}

export function applySchema(db) {
  db.exec(readFileSync(schemaPath, 'utf8'))
  db.prepare(
    `INSERT OR IGNORE INTO bible_versions (id, label, gateway_param, is_default)
     VALUES (?, ?, ?, 1)`,
  ).run(DEFAULT_VERSION, 'Nueva Traducción Viviente', 'NTV')
}

function parseMarkdownCard(raw, filePath) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  let question = ''
  let answer = ''
  let noteLink
  let footerLabel
  let phase = 'meta'
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '#flashcard') continue
    if (trimmed === '?') {
      phase = 'answer'
      continue
    }
    if (phase === 'meta') {
      if (trimmed.startsWith('#')) {
        question = trimmed.replace(/^#+\s*/, '').trim()
        phase = 'question'
      }
      continue
    }
    if (phase === 'question') {
      if (trimmed === '---') break
      if (trimmed.startsWith('[[')) {
        const m = trimmed.match(/\[\[([^|\]]+)\|([^\]]+)\]\]/)
        if (m) {
          noteLink = m[1]
          footerLabel = m[2]
        }
        break
      }
      if (trimmed && trimmed !== '?') {
        question = question ? `${question} ${trimmed}` : trimmed
      }
      continue
    }
    if (trimmed === '---') continue
    if (trimmed.startsWith('[[')) {
      const m = trimmed.match(/\[\[([^|\]]+)\|([^\]]+)\]\]/)
      if (m) {
        noteLink = m[1]
        footerLabel = m[2]
      }
      break
    }
    if (trimmed) answer = answer ? `${answer}\n${trimmed}` : trimmed
  }
  if (!question || !answer) return null
  const chapterSlug = filePath.includes('/') ? filePath.split('/')[0] : 'sin-capitulo'
  const loc = inferLocation(answer, chapterSlug, footerLabel)
  return {
    id: filePath.replace(/\.md$/, ''),
    path: filePath,
    chapterSlug,
    chapterTitle: footerLabel || chapterSlug.replace(/-/g, ' '),
    bookId: loc.bookId,
    bookLabel: loc.bookLabel,
    chapter: loc.chapter,
    canonIndex: loc.canonIndex,
    originalNumber: 0,
    question,
    answer,
    noteLink: noteLink ?? null,
    rawMarkdown: raw,
  }
}

function inferLocation(answer, chapterSlug, footerLabel) {
  const cite = answer.match(
    /\(\s*(1\s*Samuel|2\s*Samuel|1\s*Reyes|2\s*Reyes)[^\d]*(\d+)\s*:/i,
  )
  const text = cite?.[1] ?? footerLabel ?? chapterSlug
  const chapter = cite ? Number(cite[2]) : Number((chapterSlug.match(/(\d+)/g) || [])[1] ?? 0)
  const book =
    BOOK_PREFIXES.find((b) => new RegExp(b.label.replace(' ', '\\s*'), 'i').test(text)) ||
    BOOK_PREFIXES.find((b) => chapterSlug.startsWith(b.prefix) || chapterSlug.startsWith(b.prefix.replace('1-', 'samuel-'))) ||
    BOOK_PREFIXES.find((b) =>
      (b.id === '1-samuel' && /^samuel-/.test(chapterSlug) && !chapterSlug.startsWith('2-samuel')),
    )
  if (!book) {
    return { bookId: 'unknown', bookLabel: 'Sin libro', chapter: chapter || 0, canonIndex: 99 }
  }
  return {
    bookId: book.id,
    bookLabel: book.label,
    chapter: chapter || 0,
    canonIndex: book.canon,
  }
}

async function walkMd(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...(await walkMd(path.join(dir, entry.name), rel)))
    else if (entry.name.endsWith('.md') && entry.name !== 'index.md') files.push(rel.replace(/\\/g, '/'))
  }
  return files
}

export async function seedDatabase(db) {
  applySchema(db)
  const files = (await walkMd(publicFlashcards)).sort((a, b) => a.localeCompare(b, 'es'))
  const insertCard = db.prepare(
    `INSERT OR REPLACE INTO cards (
      id, path, chapter_slug, chapter_title, book_id, book_label, chapter,
      canon_index, original_number, question, answer, note_link, raw_markdown
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  db.exec('BEGIN')
  db.exec('DELETE FROM cards')
  let n = 0
  for (const file of files) {
    const raw = await readFile(path.join(publicFlashcards, file), 'utf8')
    const card = parseMarkdownCard(raw, file)
    if (!card) continue
    n += 1
    card.originalNumber = n
    insertCard.run(
      card.id,
      card.path,
      card.chapterSlug,
      card.chapterTitle,
      card.bookId,
      card.bookLabel,
      card.chapter,
      card.canonIndex,
      card.originalNumber,
      card.question,
      card.answer,
      card.noteLink,
      card.rawMarkdown,
    )
  }
  db.exec('COMMIT')

  const glossaryRaw = JSON.parse(
    await readFile(path.join(publicData, 'glossary.json'), 'utf8'),
  )
  const entries = Array.isArray(glossaryRaw.entries) ? glossaryRaw.entries : []
  const insEntry = db.prepare(
    `INSERT OR REPLACE INTO glossary_entries (id, kind, proper_name) VALUES (?, ?, ?)`,
  )
  const insVer = db.prepare(
    `INSERT OR REPLACE INTO glossary_entry_versions (entry_id, version_id, term, note)
     VALUES (?, ?, ?, ?)`,
  )
  const insAlias = db.prepare(
    `INSERT OR REPLACE INTO glossary_aliases (entry_id, version_id, alias) VALUES (?, ?, ?)`,
  )
  const insRel = db.prepare(
    `INSERT OR REPLACE INTO glossary_related (entry_id, related_id, rel) VALUES (?, ?, ?)`,
  )
  const known = new Set(
    entries.filter((e) => e?.id && e.term).map((e) => e.id),
  )
  db.exec('PRAGMA foreign_keys = OFF')
  db.exec('BEGIN')
  db.exec('DELETE FROM glossary_aliases')
  db.exec('DELETE FROM glossary_related')
  db.exec('DELETE FROM glossary_entry_versions')
  db.exec('DELETE FROM glossary_entries')
  for (const entry of entries) {
    if (!entry?.id || !entry.term) continue
    insEntry.run(entry.id, entry.kind || 'concepto', entry.properName ? 1 : 0)
    insVer.run(entry.id, DEFAULT_VERSION, entry.term, entry.note || '')
    for (const alias of entry.aliases || []) {
      if (typeof alias === 'string' && alias.trim()) {
        insAlias.run(entry.id, DEFAULT_VERSION, alias.trim())
      }
    }
  }
  for (const entry of entries) {
    if (!entry?.id || !known.has(entry.id)) continue
    for (const rel of entry.related || []) {
      if (rel?.id && rel.rel && known.has(rel.id)) insRel.run(entry.id, rel.id, rel.rel)
    }
  }
  db.exec('COMMIT')
  db.exec('PRAGMA foreign_keys = ON')
  return { cards: n, glossary: entries.length }
}

export function cardsFromDb(db) {
  const rows = db.prepare(
    `SELECT id, path, chapter_slug as chapterSlug, chapter_title as chapterTitle,
            book_id as bookId, book_label as bookLabel, chapter, canon_index as canonIndex,
            original_number as originalNumber, question, answer, note_link as noteLink
     FROM cards ORDER BY original_number, id`,
  ).all()
  return rows.map((row) => ({
    ...row,
    noteLink: row.noteLink || undefined,
  }))
}

export function glossaryFromDb(db, versionId = DEFAULT_VERSION) {
  const entries = db
    .prepare(
      `SELECT e.id, e.kind, e.proper_name as properName, v.term, v.note
       FROM glossary_entries e
       JOIN glossary_entry_versions v
         ON v.entry_id = e.id AND v.version_id = ?`,
    )
    .all(versionId)
  const aliases = db
    .prepare(
      `SELECT entry_id as id, alias FROM glossary_aliases WHERE version_id = ?`,
    )
    .all(versionId)
  const related = db
    .prepare(`SELECT entry_id as id, related_id as relatedId, rel FROM glossary_related`)
    .all()
  const aliasMap = new Map()
  for (const row of aliases) {
    if (!aliasMap.has(row.id)) aliasMap.set(row.id, [])
    aliasMap.get(row.id).push(row.alias)
  }
  const relMap = new Map()
  for (const row of related) {
    if (!relMap.has(row.id)) relMap.set(row.id, [])
    relMap.get(row.id).push({ id: row.relatedId, rel: row.rel })
  }
  return entries.map((e) => ({
    id: e.id,
    term: e.term,
    aliases: aliasMap.get(e.id) ?? [],
    kind: e.kind,
    note: e.note || '',
    properName: Boolean(e.properName),
    related: relMap.get(e.id) ?? [],
  }))
}

export async function exportStatic(db) {
  await mkdir(publicData, { recursive: true })
  const cards = cardsFromDb(db)
  await writeFile(
    path.join(publicData, 'cards.json'),
    `${JSON.stringify({ cards }, null, 2)}\n`,
  )
  const entries = glossaryFromDb(db)
  await writeFile(
    path.join(publicData, 'glossary.json'),
    `${JSON.stringify({ entries }, null, 2)}\n`,
  )
  const versions = db.prepare(`SELECT id, label, gateway_param as gatewayParam, is_default as isDefault FROM bible_versions`).all()
  await writeFile(
    path.join(publicData, 'bible-versions.json'),
    `${JSON.stringify({ versions, selected: DEFAULT_VERSION }, null, 2)}\n`,
  )
  return { cards: cards.length, glossary: entries.length }
}

export function bibleStatusFromDb(db) {
  const row = db.prepare('SELECT COUNT(*) AS n FROM bible_passages').get()
  const versions = db
    .prepare(
      `SELECT id, label, gateway_param AS gatewayParam FROM bible_versions ORDER BY id`,
    )
    .all()
  return {
    enabled: Boolean(row?.n),
    source: 'sqlite',
    verseCount: row?.n ?? 0,
    versions,
  }
}

export function searchBibleFromDb(db, query, versionId = 'kjv') {
  const q = String(query ?? '').trim()
  if (q.length < 2) return []
  return db
    .prepare(
      `SELECT version_id AS versionId, book_id AS bookId, chapter, verse, text
       FROM bible_passages
       WHERE version_id = ? AND text LIKE ? ESCAPE '\\'
       LIMIT 40`,
    )
    .all(versionId, `%${q.replace(/[%_]/g, '\\$&')}%`)
}

async function main() {
  const mode = process.argv[2] ?? 'all'
  await mkdir(dbDir, { recursive: true })
  const db = openFlashcardsDb()
  applySchema(db)
  if (mode === 'seed' || mode === 'all') {
    const seeded = await seedDatabase(db)
    console.log(`SQLite seed: ${seeded.cards} cards, ${seeded.glossary} glossary terms`)
  }
  if (mode === 'export' || mode === 'all') {
    const out = await exportStatic(db)
    console.log(`Exported JSON: ${out.cards} cards, ${out.glossary} glossary terms`)
  }
  db.close()
}

function isMain() {
  const self = fileURLToPath(import.meta.url)
  const invoked = process.argv[1] && path.resolve(process.argv[1])
  return invoked === self
}

if (isMain()) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
