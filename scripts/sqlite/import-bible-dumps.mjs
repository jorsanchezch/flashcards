#!/usr/bin/env node
/** Import scrollmapper-style `{PREFIX}_books` / `{PREFIX}_verses` dumps into bible_passages. */
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { applySchema, openFlashcardsDb } from './sync.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const dumpDir = path.join(root, 'data', 'bible-dumps')

const CANON_IDS = [
  'genesis', 'exodo', 'levitico', 'numeros', 'deuteronomio', 'josue', 'jueces', 'rut',
  '1-samuel', '2-samuel', '1-reyes', '2-reyes', '1-cronicas', '2-cronicas', 'esdras',
  'nehemias', 'ester', 'job', 'salmos', 'proverbios', 'eclesiastes', 'cantar', 'isaias',
  'jeremias', 'lamentaciones', 'ezequiel', 'daniel', 'oseas', 'joel', 'amos', 'abdias',
  'jonas', 'miqueas', 'nahum', 'habacuc', 'sofonias', 'hageo', 'zacarias', 'malaquias',
  'mateo', 'marcos', 'lucas', 'juan', 'hechos', 'romanos', '1-corintios', '2-corintios',
  'galatas', 'efesios', 'filipenses', 'colosenses', '1-tesalonicenses', '2-tesalonicenses',
  '1-timoteo', '2-timoteo', 'tito', 'filemon', 'hebreos', 'santiago', '1-pedro', '2-pedro',
  '1-juan', '2-juan', '3-juan', 'judas', 'apocalipsis',
]

const DUMPS = [
  {
    file: 'KJV.sql',
    prefix: 'KJV',
    versionId: 'kjv',
    label: 'King James Version',
    gateway: 'KJV',
    lang: 'en',
  },
  {
    file: 'ASV.sql',
    prefix: 'ASV',
    versionId: 'asv',
    label: 'American Standard Version',
    gateway: 'ASV',
    lang: 'en',
  },
  {
    file: 'SpaRV.sql',
    prefix: 'SpaRV',
    versionId: 'rvr',
    label: 'Reina Valera',
    gateway: 'RVR1960',
    lang: 'es',
  },
  {
    file: 'SpaPlatense.sql',
    prefix: 'SpaPlatense',
    versionId: 'platense',
    label: 'Biblia Platense',
    gateway: 'NVI',
    lang: 'es',
  },
]

function bookIdForCanon(n) {
  if (n >= 1 && n <= CANON_IDS.length) return CANON_IDS[n - 1]
  return `extra-${n}`
}

function parseSqlStringTail(rest) {
  let text = ''
  for (let i = 0; i < rest.length; i += 1) {
    const c = rest[i]
    if (c === '\\' && i + 1 < rest.length) {
      text += rest[i + 1]
      i += 1
      continue
    }
    if (c === "'") {
      if (rest[i + 1] === "'") {
        text += "'"
        i += 1
        continue
      }
      return text
    }
    text += c
  }
  return text
}

function parseVerseInsert(line) {
  const m = line.match(
    /^INSERT INTO `(\w+)_verses` \(`book_id`, `chapter`, `verse`, `text`\) VALUES \((\d+), (\d+), (\d+), '/,
  )
  if (!m) return null
  const text = parseSqlStringTail(line.slice(m[0].length))
  return {
    prefix: m[1],
    book: Number(m[2]),
    chapter: Number(m[3]),
    verse: Number(m[4]),
    text,
  }
}

function parseBookInsert(line) {
  const m = line.match(/^INSERT INTO `(\w+)_books` \(`name`\) VALUES \('(.*)'\);\s*$/)
  if (!m) return null
  return { prefix: m[1], name: m[2].replace(/''/g, "'") }
}

async function importDump(db, spec) {
  const file = path.join(dumpDir, spec.file)
  const insVer = db.prepare(
    `INSERT OR REPLACE INTO bible_versions (id, label, gateway_param, is_default)
     VALUES (?, ?, ?, 0)`,
  )
  insVer.run(spec.versionId, spec.label, spec.gateway)
  db.prepare(`DELETE FROM bible_passages WHERE version_id = ?`).run(spec.versionId)

  const insBook = db.prepare(
    `INSERT OR IGNORE INTO bible_books (canon, book_id, name_en, name_es) VALUES (?, ?, ?, ?)`,
  )
  const insPass = db.prepare(
    `INSERT OR REPLACE INTO bible_passages (version_id, book_id, chapter, verse, text)
     VALUES (?, ?, ?, ?, ?)`,
  )

  let bookCanon = 0
  let verses = 0
  db.exec('BEGIN')
  const rl = createInterface({ input: createReadStream(file, { encoding: 'utf8' }) })
  for await (const line of rl) {
    const book = parseBookInsert(line)
    if (book && book.prefix === spec.prefix) {
      bookCanon += 1
      const id = bookIdForCanon(bookCanon)
      if (spec.lang === 'es') insBook.run(bookCanon, id, null, book.name)
      else insBook.run(bookCanon, id, book.name, null)
      continue
    }
    const verse = parseVerseInsert(line)
    if (verse && verse.prefix === spec.prefix) {
      insPass.run(
        spec.versionId,
        bookIdForCanon(verse.book),
        verse.chapter,
        verse.verse,
        verse.text,
      )
      verses += 1
    }
  }
  db.exec('COMMIT')
  return { books: bookCanon, verses }
}

async function main() {
  const db = openFlashcardsDb()
  applySchema(db)
  db.prepare(
    `INSERT OR IGNORE INTO bible_versions (id, label, gateway_param, is_default)
     VALUES ('ntv', 'Nueva Traducción Viviente', 'NTV', 1)`,
  ).run()
  for (const spec of DUMPS) {
    const result = await importDump(db, spec)
    console.log(
      `${spec.file} → ${spec.versionId}: ${result.books} books, ${result.verses} verses`,
    )
  }
  const n = db.prepare('SELECT COUNT(*) AS n FROM bible_passages').get()
  console.log(`bible_passages total: ${n.n}`)
  db.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
