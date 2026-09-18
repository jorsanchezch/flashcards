/** Protestant canon, Spanish display labels (Génesis → Apocalipsis). */
export const BIBLE_BOOKS: { id: string; label: string; patterns: RegExp[] }[] = [
  { id: 'genesis', label: 'Génesis', patterns: [/g[eé]nesis/i] },
  { id: 'exodo', label: 'Éxodo', patterns: [/exodo|éxodo/i] },
  { id: 'levitico', label: 'Levítico', patterns: [/lev[ií]tico/i] },
  { id: 'numeros', label: 'Números', patterns: [/n[uú]meros/i] },
  { id: 'deuteronomio', label: 'Deuteronomio', patterns: [/deuteronomio/i] },
  { id: 'josue', label: 'Josué', patterns: [/josu[eé]/i] },
  { id: 'jueces', label: 'Jueces', patterns: [/jueces/i] },
  { id: 'rut', label: 'Rut', patterns: [/\brut\b/i] },
  {
    id: '1-samuel',
    label: '1 Samuel',
    patterns: [/1\s*samuel|1\s*sam\.?/i],
  },
  {
    id: '2-samuel',
    label: '2 Samuel',
    patterns: [/2\s*samuel|2\s*sam\.?/i],
  },
  { id: '1-reyes', label: '1 Reyes', patterns: [/1\s*reyes/i] },
  { id: '2-reyes', label: '2 Reyes', patterns: [/2\s*reyes/i] },
  { id: '1-cronicas', label: '1 Crónicas', patterns: [/1\s*cr[oó]nicas/i] },
  { id: '2-cronicas', label: '2 Crónicas', patterns: [/2\s*cr[oó]nicas/i] },
  { id: 'esdras', label: 'Esdras', patterns: [/esdras/i] },
  { id: 'nehemias', label: 'Nehemías', patterns: [/nehem[ií]as/i] },
  { id: 'ester', label: 'Ester', patterns: [/\bester\b/i] },
  { id: 'job', label: 'Job', patterns: [/\bjob\b/i] },
  { id: 'salmos', label: 'Salmos', patterns: [/salmos|salmo/i] },
  { id: 'proverbios', label: 'Proverbios', patterns: [/proverbios/i] },
  { id: 'eclesiastes', label: 'Eclesiastés', patterns: [/eclesiast[eé]s/i] },
  {
    id: 'cantar',
    label: 'Cantar de los Cantares',
    patterns: [/cantar\s+de\s+los\s+cantares|cantares/i],
  },
  { id: 'isaias', label: 'Isaías', patterns: [/isa[ií]as/i] },
  { id: 'jeremias', label: 'Jeremías', patterns: [/jerem[ií]as/i] },
  {
    id: 'lamentaciones',
    label: 'Lamentaciones',
    patterns: [/lamentaciones/i],
  },
  { id: 'ezequiel', label: 'Ezequiel', patterns: [/ezequiel/i] },
  { id: 'daniel', label: 'Daniel', patterns: [/daniel/i] },
  { id: 'oseas', label: 'Oseas', patterns: [/oseas/i] },
  { id: 'joel', label: 'Joel', patterns: [/\bjoel\b/i] },
  { id: 'amos', label: 'Amós', patterns: [/am[oó]s/i] },
  { id: 'abdias', label: 'Abdías', patterns: [/abd[ií]as/i] },
  { id: 'jonas', label: 'Jonás', patterns: [/jon[aá]s/i] },
  { id: 'miqueas', label: 'Miqueas', patterns: [/miqueas/i] },
  { id: 'nahum', label: 'Nahum', patterns: [/nahum/i] },
  { id: 'habacuc', label: 'Habacuc', patterns: [/habacuc/i] },
  { id: 'sofonias', label: 'Sofonías', patterns: [/sofon[ií]as/i] },
  { id: 'hageo', label: 'Hageo', patterns: [/hageo/i] },
  { id: 'zacarias', label: 'Zacarías', patterns: [/zacar[ií]as/i] },
  { id: 'malaquias', label: 'Malaquías', patterns: [/malaqu[ií]as/i] },
  { id: 'mateo', label: 'Mateo', patterns: [/mateo/i] },
  { id: 'marcos', label: 'Marcos', patterns: [/marcos/i] },
  { id: 'lucas', label: 'Lucas', patterns: [/lucas/i] },
  { id: 'juan', label: 'Juan', patterns: [/\bjuan\b/i] },
  { id: 'hechos', label: 'Hechos', patterns: [/hechos/i] },
  { id: 'romanos', label: 'Romanos', patterns: [/romanos/i] },
  { id: '1-corintios', label: '1 Corintios', patterns: [/1\s*corintios/i] },
  { id: '2-corintios', label: '2 Corintios', patterns: [/2\s*corintios/i] },
  { id: 'galatas', label: 'Gálatas', patterns: [/g[aá]latas/i] },
  { id: 'efesios', label: 'Efesios', patterns: [/efesios/i] },
  { id: 'filipenses', label: 'Filipenses', patterns: [/filipenses/i] },
  { id: 'colosenses', label: 'Colosenses', patterns: [/colosenses/i] },
  {
    id: '1-tesalonicenses',
    label: '1 Tesalonicenses',
    patterns: [/1\s*tesalonicenses/i],
  },
  {
    id: '2-tesalonicenses',
    label: '2 Tesalonicenses',
    patterns: [/2\s*tesalonicenses/i],
  },
  { id: '1-timoteo', label: '1 Timoteo', patterns: [/1\s*timoteo/i] },
  { id: '2-timoteo', label: '2 Timoteo', patterns: [/2\s*timoteo/i] },
  { id: 'tito', label: 'Tito', patterns: [/\btito\b/i] },
  { id: 'filemon', label: 'Filemón', patterns: [/filem[oó]n/i] },
  { id: 'hebreos', label: 'Hebreos', patterns: [/hebreos/i] },
  { id: 'santiago', label: 'Santiago', patterns: [/santiago/i] },
  { id: '1-pedro', label: '1 Pedro', patterns: [/1\s*pedro/i] },
  { id: '2-pedro', label: '2 Pedro', patterns: [/2\s*pedro/i] },
  { id: '1-juan', label: '1 Juan', patterns: [/1\s*juan/i] },
  { id: '2-juan', label: '2 Juan', patterns: [/2\s*juan/i] },
  { id: '3-juan', label: '3 Juan', patterns: [/3\s*juan/i] },
  { id: 'judas', label: 'Judas', patterns: [/\bjudas\b/i] },
  { id: 'apocalipsis', label: 'Apocalipsis', patterns: [/apocalipsis/i] },
]

const UNKNOWN_BOOK_ID = '__unknown__'
const UNKNOWN_BOOK_LABEL = 'Libro desconocido'

const bookById = new Map(BIBLE_BOOKS.map((b, index) => [b.id, { ...b, index }]))

export type BiblicalLocation = {
  bookId: string
  bookLabel: string
  chapter: number
  canonIndex: number
}

function matchBook(text: string): { id: string; label: string; index: number } | null {
  const normalized = text.trim()
  for (const book of BIBLE_BOOKS) {
    for (const pattern of book.patterns) {
      if (pattern.test(normalized)) {
        return { id: book.id, label: book.label, index: bookById.get(book.id)!.index }
      }
    }
  }
  return null
}

/** First chapter number in a citation segment like "1 Samuel 9:15-16". */
function chapterFromCitationSegment(segment: string): number | null {
  const m = segment.match(/(\d+)\s*:\s*\d+/)
  if (m) return Number.parseInt(m[1], 10)
  const m2 = segment.match(/\b(\d+)\b(?!.*\d+\s*:)/)
  return m2 ? Number.parseInt(m2[1], 10) : null
}

export function parseCitationFromText(text: string): { bookText: string; chapter: number } | null {
  const parenMatches = [...text.matchAll(/\(([^)]+)\)/g)]
  for (let i = parenMatches.length - 1; i >= 0; i--) {
    const inner = parenMatches[i][1].trim()
    const withVerse = inner.match(/^(.+?)\s+(\d+)\s*:\s*\d+/)
    if (withVerse) {
      return {
        bookText: withVerse[1].trim(),
        chapter: Number.parseInt(withVerse[2], 10),
      }
    }
    const chapterOnly = chapterFromCitationSegment(inner)
    if (chapterOnly != null) {
      const bookPart = inner.replace(/\b\d+\b.*$/, '').trim()
      if (bookPart) {
        return { bookText: bookPart, chapter: chapterOnly }
      }
    }
  }
  return null
}

function inferFromFolderSlug(slug: string): { bookText: string; chapter: number } | null {
  if (slug.startsWith('samuel-')) {
    const m = slug.match(/^samuel-(\d+)/)
    if (m) {
      return { bookText: '1 Samuel', chapter: Number.parseInt(m[1], 10) }
    }
  }
  return null
}

function inferFromFooterLabel(footerLabel: string): { bookText: string; chapter: number } | null {
  const head = footerLabel.split(/[—–-]/)[0]?.trim() ?? footerLabel
  const m = head.match(/^(.+?)\s+(\d+)/)
  if (m) {
    return {
      bookText: m[1].trim(),
      chapter: Number.parseInt(m[2], 10),
    }
  }
  const bookOnly = matchBook(head)
  if (bookOnly) {
    return { bookText: bookOnly.label, chapter: 1 }
  }
  return null
}

export function assignBiblicalLocation(
  answer: string,
  chapterSlug: string,
  footerLabel?: string,
): BiblicalLocation {
  const fromCitation = parseCitationFromText(answer)
  const fromFooter = footerLabel ? inferFromFooterLabel(footerLabel) : null
  const fromFolder = inferFromFolderSlug(chapterSlug)

  const picked = fromCitation ?? fromFooter ?? fromFolder
  if (picked) {
    const book = matchBook(picked.bookText)
    if (book) {
      return {
        bookId: book.id,
        bookLabel: book.label,
        chapter: picked.chapter,
        canonIndex: book.index,
      }
    }
  }

  return {
    bookId: UNKNOWN_BOOK_ID,
    bookLabel: UNKNOWN_BOOK_LABEL,
    chapter: picked?.chapter ?? 0,
    canonIndex: BIBLE_BOOKS.length,
  }
}

export function compareFlashcardsByCanon<
  T extends { bookId: string; canonIndex: number; chapter: number; question: string },
>(a: T, b: T): number {
  if (a.canonIndex !== b.canonIndex) return a.canonIndex - b.canonIndex
  if (a.chapter !== b.chapter) return a.chapter - b.chapter
  return a.question.localeCompare(b.question, 'es')
}

export function bookSortKey(bookId: string, canonIndex: number): number {
  return bookId === UNKNOWN_BOOK_ID ? Number.MAX_SAFE_INTEGER : canonIndex
}
