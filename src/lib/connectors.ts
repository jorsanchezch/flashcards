import type { Flashcard } from '@/lib/parseFlashcard'

export type DataSource = 'sqlite' | 'json'

export type BibleStatus = {
  enabled: boolean
  source: DataSource
  verseCount: number
  versions: { id: string; label: string; gatewayParam: string }[]
}

export type BibleHit = {
  versionId: string
  bookId: string
  chapter: number
  verse: number
  text: string
}

export type CatalogConnector = {
  source: DataSource
  loadCards: () => Promise<Flashcard[]>
  loadGlossary: () => Promise<unknown>
  bibleStatus: () => Promise<BibleStatus>
  searchBible: (query: string, versionId?: string) => Promise<BibleHit[]>
}

function baseUrl() {
  return import.meta.env.BASE_URL
}

async function readJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  return res.json()
}

function parseCardList(payload: unknown): Flashcard[] {
  const list = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === 'object' &&
        Array.isArray((payload as { cards?: unknown }).cards)
      ? (payload as { cards: Flashcard[] }).cards
      : []
  return list.map((row) => ({
    ...row,
    originalNumber:
      typeof row.originalNumber === 'number' ? row.originalNumber : 0,
  }))
}

export const jsonConnector: CatalogConnector = {
  source: 'json',
  async loadCards() {
    return parseCardList(await readJson(`${baseUrl()}data/cards.json`))
  },
  async loadGlossary() {
    return readJson(`${baseUrl()}data/glossary.json`)
  },
  async bibleStatus() {
    return { enabled: false, source: 'json', verseCount: 0, versions: [] }
  },
  async searchBible() {
    return []
  },
}

export const sqliteConnector: CatalogConnector = {
  source: 'sqlite',
  async loadCards() {
    return parseCardList(await readJson(`${baseUrl()}api/local/cards`))
  },
  async loadGlossary() {
    return readJson(`${baseUrl()}api/local/glossary`)
  },
  async bibleStatus() {
    try {
      const raw = (await readJson(`${baseUrl()}api/local/bible-status`)) as BibleStatus
      return {
        enabled: Boolean(raw.verseCount),
        source: 'sqlite',
        verseCount: raw.verseCount ?? 0,
        versions: raw.versions ?? [],
      }
    } catch {
      return { enabled: false, source: 'sqlite', verseCount: 0, versions: [] }
    }
  },
  async searchBible(query: string, versionId = 'ntv') {
    const params = new URLSearchParams({ q: query, version: versionId })
    const raw = (await readJson(
      `${baseUrl()}api/local/bible-search?${params.toString()}`,
    )) as { hits?: BibleHit[] }
    return raw.hits ?? []
  },
}

export async function resolveCatalogConnector(): Promise<CatalogConnector> {
  if (!import.meta.env.DEV) return jsonConnector
  try {
    const status = await sqliteConnector.bibleStatus()
    const cards = await sqliteConnector.loadCards()
    if (cards.length) {
      return sqliteConnector
    }
    void status
  } catch {
    /* fall through */
  }
  try {
    const cards = await jsonConnector.loadCards()
    if (cards.length) return jsonConnector
  } catch {
    /* fall through */
  }
  return jsonConnector
}
