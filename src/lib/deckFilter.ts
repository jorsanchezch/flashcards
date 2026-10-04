import { compareFlashcardsByCanon } from '@/lib/biblical'
import {
  cardReferencesTerm,
  type CompiledGlossaryForm,
} from '@/lib/glossary'
import type { Flashcard } from '@/lib/parseFlashcard'
import { shuffleIds } from '@/lib/shuffle'

export type BookRangeGrouping = {
  kind: 'book-range'
  bookId: string
  from: number | null
  to: number | null
}

export type GlossaryFilterSides = {
  question: boolean
  answer: boolean
}

export type GlossaryGrouping = {
  kind: 'glossary'
  termIds: string[]
  /** Where the term must appear. Default: both sides (OR). */
  sides?: GlossaryFilterSides
}

export type CardIdsGrouping = {
  kind: 'card-ids'
  ids: string[]
  label: string | null
}

/** Add new grouping kinds here; applyDeckGroupings handles each in turn (AND). */
export type DeckGrouping =
  | BookRangeGrouping
  | GlossaryGrouping
  | CardIdsGrouping

export function emptyGroupings(): DeckGrouping[] {
  return []
}

export function parseDeckGroupings(raw: unknown): DeckGrouping[] {
  if (!Array.isArray(raw)) return []
  const out: DeckGrouping[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const kind = (item as DeckGrouping).kind
    if (kind === 'book-range') {
      const bookId =
        typeof (item as BookRangeGrouping).bookId === 'string'
          ? (item as BookRangeGrouping).bookId.trim()
          : ''
      if (!bookId) continue
      const from = parsePositiveInt((item as BookRangeGrouping).from)
      const to = parsePositiveInt((item as BookRangeGrouping).to)
      out.push({ kind: 'book-range', bookId, from, to })
    } else if (kind === 'glossary') {
      const termIds = Array.isArray((item as GlossaryGrouping).termIds)
        ? (item as GlossaryGrouping).termIds.filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          )
        : []
      if (!termIds.length) continue
      out.push({
        kind: 'glossary',
        termIds: [...new Set(termIds)],
        sides: parseGlossarySides((item as GlossaryGrouping).sides),
      })
    } else if (kind === 'card-ids') {
      const ids = Array.isArray((item as CardIdsGrouping).ids)
        ? (item as CardIdsGrouping).ids.filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          )
        : []
      if (!ids.length) continue
      const labelRaw = (item as CardIdsGrouping).label
      out.push({
        kind: 'card-ids',
        ids: [...new Set(ids)],
        label: typeof labelRaw === 'string' && labelRaw.trim() ? labelRaw.trim() : null,
      })
    }
  }
  return out
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const n = Math.floor(value)
  return n > 0 ? n : null
}

export function defaultGlossarySides(): GlossaryFilterSides {
  return { question: true, answer: true }
}

export function parseGlossarySides(raw: unknown): GlossaryFilterSides {
  const fallback = defaultGlossarySides()
  if (!raw || typeof raw !== 'object') return fallback
  const question = (raw as GlossaryFilterSides).question
  const answer = (raw as GlossaryFilterSides).answer
  const q = question !== false
  const a = answer !== false
  if (!q && !a) return fallback
  return { question: q, answer: a }
}

export function getBookRange(
  groupings: DeckGrouping[],
): BookRangeGrouping | null {
  return groupings.find((g): g is BookRangeGrouping => g.kind === 'book-range') ?? null
}

export function getGlossaryTermIds(groupings: DeckGrouping[]): string[] {
  const g = groupings.find((x): x is GlossaryGrouping => x.kind === 'glossary')
  return g?.termIds ?? []
}

export function getGlossaryGrouping(
  groupings: DeckGrouping[],
): GlossaryGrouping | null {
  return groupings.find((x): x is GlossaryGrouping => x.kind === 'glossary') ?? null
}

export function getGlossarySides(groupings: DeckGrouping[]): GlossaryFilterSides {
  return parseGlossarySides(getGlossaryGrouping(groupings)?.sides)
}

export function getCardIdsGrouping(
  groupings: DeckGrouping[],
): CardIdsGrouping | null {
  return groupings.find((g): g is CardIdsGrouping => g.kind === 'card-ids') ?? null
}

export function replaceGrouping(
  groupings: DeckGrouping[],
  next: DeckGrouping | null,
  kind: DeckGrouping['kind'],
): DeckGrouping[] {
  const rest = groupings.filter((g) => g.kind !== kind)
  if (!next) return rest
  return [...rest, next]
}

export function setBookRangeGrouping(
  groupings: DeckGrouping[],
  bookId: string | null,
  from: number | null,
  to: number | null,
): DeckGrouping[] {
  if (!bookId) {
    return replaceGrouping(groupings, null, 'book-range')
  }
  return replaceGrouping(
    groupings,
    { kind: 'book-range', bookId, from, to },
    'book-range',
  )
}

export function setGlossaryTermIds(
  groupings: DeckGrouping[],
  termIds: string[],
  sides?: GlossaryFilterSides,
): DeckGrouping[] {
  const unique = [...new Set(termIds.filter(Boolean))]
  if (!unique.length) return replaceGrouping(groupings, null, 'glossary')
  return replaceGrouping(
    groupings,
    {
      kind: 'glossary',
      termIds: unique,
      sides: parseGlossarySides(sides ?? getGlossarySides(groupings)),
    },
    'glossary',
  )
}

export function setGlossarySides(
  groupings: DeckGrouping[],
  sides: GlossaryFilterSides,
): DeckGrouping[] {
  const termIds = getGlossaryTermIds(groupings)
  if (!termIds.length) return groupings
  return setGlossaryTermIds(groupings, termIds, parseGlossarySides(sides))
}

export function toggleGlossaryTerm(
  groupings: DeckGrouping[],
  termId: string,
): DeckGrouping[] {
  const current = getGlossaryTermIds(groupings)
  const next = current.includes(termId)
    ? current.filter((id) => id !== termId)
    : [...current, termId]
  return setGlossaryTermIds(groupings, next)
}

export function setCardIdsGrouping(
  groupings: DeckGrouping[],
  ids: string[],
  label: string | null,
): DeckGrouping[] {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return replaceGrouping(groupings, null, 'card-ids')
  return replaceGrouping(
    groupings,
    { kind: 'card-ids', ids: unique, label: label?.trim() || null },
    'card-ids',
  )
}

export function clearedFilterPatch(): {
  groupings: DeckGrouping[]
  shuffle: false
  studySessionOrder: null
  studySessionIndex: number
} {
  return {
    groupings: [],
    shuffle: false,
    studySessionOrder: null,
    studySessionIndex: 0,
  }
}

export function hasActiveFilters(groupings: DeckGrouping[]): boolean {
  return groupings.length > 0
}

export function applyDeckGroupings(
  cards: Flashcard[],
  groupings: DeckGrouping[],
  matchers: CompiledGlossaryForm[],
): Flashcard[] {
  let pool = cards
  for (const grouping of groupings) {
    pool = applyOneGrouping(pool, grouping, matchers)
  }
  return pool
}

function applyOneGrouping(
  cards: Flashcard[],
  grouping: DeckGrouping,
  matchers: CompiledGlossaryForm[],
): Flashcard[] {
  if (grouping.kind === 'book-range') {
    return cards.filter((card) => {
      if (card.bookId !== grouping.bookId) return false
      const lo =
        grouping.from != null && grouping.to != null
          ? Math.min(grouping.from, grouping.to)
          : grouping.from
      const hi =
        grouping.from != null && grouping.to != null
          ? Math.max(grouping.from, grouping.to)
          : grouping.to
      if (lo != null && card.chapter < lo) return false
      if (hi != null && card.chapter > hi) return false
      return true
    })
  }
  if (grouping.kind === 'glossary') {
    if (!grouping.termIds.length) return cards
    const sides = parseGlossarySides(grouping.sides)
    return cards.filter((card) =>
      grouping.termIds.some((termId) =>
        cardReferencesTerm(card, matchers, termId, sides),
      ),
    )
  }
  const allowed = new Set(grouping.ids)
  return cards.filter((card) => allowed.has(card.id))
}

export function canonicalIds(cards: Flashcard[]): string[] {
  return [...cards].sort(compareFlashcardsByCanon).map((c) => c.id)
}

export function orderForFilter(options: {
  pool: Flashcard[]
  shuffle: boolean
  savedOrder: string[] | null | undefined
}): string[] {
  const canonical = canonicalIds(options.pool)
  if (!options.shuffle) return canonical
  if (
    options.savedOrder &&
    options.savedOrder.length === canonical.length &&
    new Set(options.savedOrder).size === canonical.length &&
    options.savedOrder.every((id) => canonical.includes(id))
  ) {
    return [...options.savedOrder]
  }
  return shuffleIds(canonical)
}

export function groupingsSignature(groupings: DeckGrouping[]): string {
  return JSON.stringify(groupings)
}
