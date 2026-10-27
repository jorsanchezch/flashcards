/** Catalog of Bible versions the app can open (Gateway) or search (local SQLite). */

export type BibleLanguage = 'es' | 'en'

export type BibleVersionMeta = {
  id: string
  label: string
  gatewayParam: string
  language: BibleLanguage
}

/** Always available for BibleGateway links — no dump required. */
export const BIBLE_VERSIONS: BibleVersionMeta[] = [
  {
    id: 'ntv',
    label: 'Nueva Traducción Viviente',
    gatewayParam: 'NTV',
    language: 'es',
  },
  {
    id: 'kjv',
    label: 'King James Version',
    gatewayParam: 'KJV',
    language: 'en',
  },
  {
    id: 'asv',
    label: 'American Standard Version',
    gatewayParam: 'ASV',
    language: 'en',
  },
]

export const DEFAULT_BIBLE_VERSION_ID = 'ntv'

const byId = new Map(BIBLE_VERSIONS.map((v) => [v.id, v]))

export function bibleVersionMeta(id: string | null | undefined): BibleVersionMeta {
  if (id && byId.has(id)) return byId.get(id)!
  return byId.get(DEFAULT_BIBLE_VERSION_ID)!
}

export function languageForVersionId(id: string): BibleLanguage {
  return bibleVersionMeta(id).language
}

/** Enrich API/DB rows with language when the column is missing. */
export function withBibleLanguage<T extends { id: string; label: string; gatewayParam: string }>(
  row: T,
): T & { language: BibleLanguage } {
  const known = byId.get(row.id)
  return {
    ...row,
    language: known?.language ?? (row.id === 'ntv' || row.id.startsWith('rvr') ? 'es' : 'en'),
  }
}
