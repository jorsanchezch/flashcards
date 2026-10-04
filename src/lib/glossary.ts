import { NTV_CITATION_RE, bibleGatewayNtvKeywordUrl } from '@/lib/bibleGateway'
import type { Flashcard } from '@/lib/parseFlashcard'

export const GLOSSARY_KINDS = ['persona', 'lugar', 'concepto'] as const
export type GlossaryKind = (typeof GLOSSARY_KINDS)[number]

export type GlossaryRelated = {
  id: string
  rel: string
}

export type GlossaryEntry = {
  id: string
  term: string
  aliases: string[]
  kind: GlossaryKind
  note: string
  /** When true, matching is case-sensitive. Accents and hyphen variants are still ignored. */
  properName: boolean
  related: GlossaryRelated[]
}

export type GlossaryOverlay = {
  added: GlossaryEntry[]
  updates: Record<
    string,
    Partial<
      Pick<
        GlossaryEntry,
        'term' | 'aliases' | 'kind' | 'note' | 'properName' | 'related'
      >
    >
  >
  hiddenIds: string[]
}

export type GlossaryFile = {
  entries: GlossaryEntry[]
}

export type CompiledGlossaryForm = {
  entryId: string
  form: string
  folded: string
  properName: boolean
  isAlias: boolean
}

export type GlossaryMatch = {
  start: number
  end: number
  entryId: string
  isAlias: boolean
}

const HYPHEN_RE = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D-]/u

type FoldedText = {
  folded: string
  /** folded offset → original string index */
  origIndex: number[]
}

export function emptyGlossaryOverlay(): GlossaryOverlay {
  return { added: [], updates: {}, hiddenIds: [] }
}

export function isGlossaryKind(value: unknown): value is GlossaryKind {
  return (
    value === 'persona' || value === 'lugar' || value === 'concepto'
  )
}

export function glossaryKindLabel(kind: GlossaryKind): string {
  if (kind === 'persona') return 'Persona'
  if (kind === 'lugar') return 'Lugar'
  return 'Concepto'
}

export function newGlossaryEntryId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `local-${crypto.randomUUID()}`
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function isCustomGlossaryId(id: string): boolean {
  return id.startsWith('local-')
}

function cleanRelated(raw: unknown): GlossaryRelated[] {
  if (!Array.isArray(raw)) return []
  const out: GlossaryRelated[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Partial<GlossaryRelated>
    const id = typeof row.id === 'string' ? row.id.trim() : ''
    const rel = typeof row.rel === 'string' ? row.rel.trim() : ''
    if (!id || !rel || seen.has(id)) continue
    seen.add(id)
    out.push({ id, rel })
  }
  return out
}

function cleanAliases(term: string, aliases: unknown): string[] {
  if (!Array.isArray(aliases)) return []
  const seen = new Set<string>([term.trim().toLocaleLowerCase('es')])
  const out: string[] = []
  for (const raw of aliases) {
    if (typeof raw !== 'string') continue
    const alias = raw.trim()
    if (!alias) continue
    const key = alias.toLocaleLowerCase('es')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(alias)
  }
  return out
}

export function normalizeGlossaryEntry(
  raw: Partial<GlossaryEntry>,
  fallbackId?: string,
): GlossaryEntry | null {
  const term = typeof raw.term === 'string' ? raw.term.trim() : ''
  if (!term) return null
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : fallbackId?.trim() || ''
  if (!id) return null
  const kind = isGlossaryKind(raw.kind) ? raw.kind : 'concepto'
  const note = typeof raw.note === 'string' ? raw.note.trim() : ''
  const related = cleanRelated(
    (raw as Partial<GlossaryEntry> & { related?: unknown }).related,
  )
  return {
    id,
    term,
    aliases: cleanAliases(term, raw.aliases),
    kind,
    note,
    properName: raw.properName === true,
    related: related.filter((item) => item.id !== id),
  }
}

export function glossarySearchTerms(
  entry: Pick<GlossaryEntry, 'term' | 'aliases'>,
): string[] {
  return [entry.term, ...entry.aliases]
}

export function glossaryBibleSearchUrl(
  entry: Pick<GlossaryEntry, 'term' | 'aliases'>,
): string {
  return bibleGatewayNtvKeywordUrl(glossarySearchTerms(entry))
}

export function parseGlossaryFile(data: unknown): GlossaryEntry[] {
  if (!data || typeof data !== 'object') return []
  const list = (data as GlossaryFile).entries
  if (!Array.isArray(list)) return []
  const out: GlossaryEntry[] = []
  const seen = new Set<string>()
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const entry = normalizeGlossaryEntry(item as Partial<GlossaryEntry>)
    if (!entry || seen.has(entry.id)) continue
    seen.add(entry.id)
    out.push(entry)
  }
  return out
}

export function normalizeGlossaryOverlay(raw: unknown): GlossaryOverlay {
  const empty = emptyGlossaryOverlay()
  if (!raw || typeof raw !== 'object') return empty
  const source = raw as Partial<GlossaryOverlay>

  const added: GlossaryEntry[] = []
  if (Array.isArray(source.added)) {
    for (const item of source.added) {
      const entry = normalizeGlossaryEntry(item as Partial<GlossaryEntry>)
      if (entry) added.push(entry)
    }
  }

  const updates: GlossaryOverlay['updates'] = {}
  if (source.updates && typeof source.updates === 'object') {
    for (const [id, patch] of Object.entries(source.updates)) {
      if (!id || !patch || typeof patch !== 'object') continue
      const next: GlossaryOverlay['updates'][string] = {}
      if (typeof patch.term === 'string' && patch.term.trim()) {
        next.term = patch.term.trim()
      }
      if (Array.isArray(patch.aliases)) {
        next.aliases = cleanAliases(next.term ?? '', patch.aliases)
      }
      if (isGlossaryKind(patch.kind)) next.kind = patch.kind
      if (typeof patch.note === 'string') next.note = patch.note.trim()
      if (typeof patch.properName === 'boolean') next.properName = patch.properName
      if (Array.isArray(patch.related)) next.related = cleanRelated(patch.related)
      if (Object.keys(next).length) updates[id] = next
    }
  }

  const hiddenIds: string[] = []
  if (Array.isArray(source.hiddenIds)) {
    for (const id of source.hiddenIds) {
      if (typeof id === 'string' && id) hiddenIds.push(id)
    }
  }

  return { added, updates, hiddenIds }
}

export function mergeGlossary(
  published: GlossaryEntry[],
  overlay: GlossaryOverlay | undefined,
): GlossaryEntry[] {
  const hidden = new Set(overlay?.hiddenIds ?? [])
  const updates = overlay?.updates ?? {}
  const result: GlossaryEntry[] = []

  for (const entry of published) {
    if (hidden.has(entry.id)) continue
    const patch = updates[entry.id]
    if (!patch) {
      result.push(entry)
      continue
    }
    const term = patch.term?.trim() || entry.term
    result.push({
      id: entry.id,
      term,
      aliases:
        patch.aliases !== undefined
          ? cleanAliases(term, patch.aliases)
          : cleanAliases(term, entry.aliases),
      kind: patch.kind ?? entry.kind,
      note: patch.note !== undefined ? patch.note : entry.note,
      properName:
        patch.properName !== undefined ? patch.properName : entry.properName,
      related:
        patch.related !== undefined
          ? cleanRelated(patch.related)
          : entry.related,
    })
  }

  for (const extra of overlay?.added ?? []) {
    if (hidden.has(extra.id)) continue
    if (result.some((e) => e.id === extra.id)) continue
    result.push(extra)
  }

  result.sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }))
  return result
}

function codePointLen(text: string, index: number): number {
  const code = text.codePointAt(index)
  if (code == null) return 1
  return code > 0xffff ? 2 : 1
}

function foldChar(ch: string, caseSensitive: boolean): string {
  if (HYPHEN_RE.test(ch)) return '-'
  let piece = ch.normalize('NFD').replace(/\p{M}/gu, '')
  if (!piece) return ''
  if (HYPHEN_RE.test(piece)) piece = '-'
  if (!caseSensitive) piece = piece.toLocaleLowerCase('es')
  return piece
}

function foldText(text: string, caseSensitive: boolean): FoldedText {
  let folded = ''
  const origIndex: number[] = []
  for (let i = 0; i < text.length; ) {
    const len = codePointLen(text, i)
    const ch = text.slice(i, i + len)
    const piece = foldChar(ch, caseSensitive)
    for (let k = 0; k < piece.length; k++) {
      folded += piece[k]!
      origIndex.push(i)
    }
    i += len
  }
  return { folded, origIndex }
}

function isLetterAt(text: string, index: number): boolean {
  if (index < 0 || index >= text.length) return false
  const ch = text.slice(index, index + codePointLen(text, index))
  return /\p{L}/u.test(ch)
}

function mapFoldedRange(
  text: string,
  folded: FoldedText,
  foldedStart: number,
  foldedEnd: number,
): { start: number; end: number } | null {
  if (foldedEnd <= foldedStart) return null
  const start = folded.origIndex[foldedStart]
  const lastOrig = folded.origIndex[foldedEnd - 1]
  if (start == null || lastOrig == null) return null
  return { start, end: lastOrig + codePointLen(text, lastOrig) }
}

function isWholeWord(text: string, start: number, end: number): boolean {
  if (start > 0 && isLetterAt(text, start - 1)) return false
  if (end < text.length && isLetterAt(text, end)) return false
  return true
}

export function compileGlossaryMatchers(
  entries: GlossaryEntry[],
): CompiledGlossaryForm[] {
  const matchers: CompiledGlossaryForm[] = []
  const seen = new Set<string>()
  for (const entry of entries) {
    const variants = [entry.term, ...entry.aliases]
    variants.forEach((form, index) => {
      const trimmed = form.trim()
      if (!trimmed) return
      const folded = foldText(trimmed, entry.properName).folded
      if (!folded) return
      const key = `${entry.id}\n${entry.properName ? 'cs' : 'ci'}\n${folded}`
      if (seen.has(key)) return
      seen.add(key)
      matchers.push({
        entryId: entry.id,
        form: trimmed,
        folded,
        properName: entry.properName,
        isAlias: index > 0,
      })
    })
  }
  matchers.sort(
    (a, b) =>
      b.folded.length - a.folded.length || a.form.localeCompare(b.form, 'es'),
  )
  return matchers
}

export function stripCitations(text: string): string {
  return text.replace(NTV_CITATION_RE, ' ')
}

export function findGlossaryMatches(
  text: string,
  matchers: CompiledGlossaryForm[],
  onlyEntryId?: string,
): GlossaryMatch[] {
  if (!text || !matchers.length) return []
  const insensitive = foldText(text, false)
  const sensitive = foldText(text, true)
  const taken = new Uint8Array(text.length)
  const matches: GlossaryMatch[] = []

  for (const matcher of matchers) {
    if (onlyEntryId && matcher.entryId !== onlyEntryId) continue
    const hay = matcher.properName ? sensitive : insensitive
    const needle = matcher.folded
    if (!needle || hay.folded.length < needle.length) continue
    let from = 0
    while (from <= hay.folded.length - needle.length) {
      const at = hay.folded.indexOf(needle, from)
      if (at < 0) break
      from = at + 1
      const range = mapFoldedRange(text, hay, at, at + needle.length)
      if (!range) continue
      if (!isWholeWord(text, range.start, range.end)) continue
      let blocked = false
      for (let i = range.start; i < range.end; i++) {
        if (taken[i]) {
          blocked = true
          break
        }
      }
      if (blocked) continue
      for (let i = range.start; i < range.end; i++) taken[i] = 1
      matches.push({
        start: range.start,
        end: range.end,
        entryId: matcher.entryId,
        isAlias: matcher.isAlias,
      })
    }
  }

  matches.sort((a, b) => a.start - b.start || b.end - a.end)
  return matches
}

export function cardReferencesTerm(
  card: Pick<Flashcard, 'question' | 'answer'>,
  matchers: CompiledGlossaryForm[],
  entryId: string,
  sides: { question?: boolean; answer?: boolean } = { question: true, answer: true },
): boolean {
  const wantQ = sides.question !== false
  const wantA = sides.answer !== false
  if (wantQ && findGlossaryMatches(stripCitations(card.question), matchers, entryId).length) {
    return true
  }
  if (wantA && findGlossaryMatches(stripCitations(card.answer), matchers, entryId).length) {
    return true
  }
  return false
}

export function cardsForGlossaryTerm(
  cards: Flashcard[],
  matchers: CompiledGlossaryForm[],
  entryId: string,
): Flashcard[] {
  return cards.filter((card) => cardReferencesTerm(card, matchers, entryId))
}
