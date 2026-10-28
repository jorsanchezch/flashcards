import { bibleGatewayNtvUrl } from '@/lib/bibleGateway'
import {
  KINGDOMS,
  KINGS,
  TIMELINE_END_BC,
  TIMELINE_START_BC,
  type KingRecord,
  type KingdomId,
  type LordStand,
} from '@/lib/kingsTimelineData'

export {
  KINGDOMS,
  KINGS,
  TIMELINE_END_BC,
  TIMELINE_START_BC,
  type KingAges,
  type KingRecord,
  type KingdomId,
  type LordStand,
} from '@/lib/kingsTimelineData'

export type LordStandMeta = {
  label: string
  shortLabel: string
  /** Shape that carries the verdict without relying on color. */
  glyph: string
  /** Badge variant from `ui/badge`. */
  badge: 'righteous' | 'evil' | 'mixed' | 'foreign'
  /** CSS color from the theme tokens. */
  color: string
}

const LORD_STAND_META: Record<LordStand, LordStandMeta> = {
  righteous: {
    label: 'Recto ante el Señor',
    shortLabel: 'Recto',
    glyph: '✓',
    badge: 'righteous',
    color: 'var(--stand-righteous)',
  },
  evil: {
    label: 'Malo ante el Señor',
    shortLabel: 'Malo',
    glyph: '✕',
    badge: 'evil',
    color: 'var(--stand-evil)',
  },
  mixed: {
    label: 'Recto y malo (según el relato)',
    shortLabel: 'Mixto',
    glyph: '½',
    badge: 'mixed',
    color: 'var(--stand-mixed)',
  },
  not_applicable: {
    label: 'Sin fórmula de evaluación',
    shortLabel: 'Extranjero',
    glyph: '–',
    badge: 'foreign',
    color: 'var(--stand-foreign)',
  },
}

export const LORD_STANDS: LordStand[] = ['righteous', 'evil', 'mixed', 'not_applicable']

export function lordStandMeta(stand?: LordStand): LordStandMeta | null {
  if (!stand) return null
  return LORD_STAND_META[stand]
}

export function formatKingAges(ages?: KingRecord['ages']): string | null {
  if (!ages) return null
  const parts: string[] = []
  if (ages.accessionAge != null) {
    parts.push(`${ages.accessionAge} años al comenzar a reinar`)
  }
  if (ages.reignYears != null) {
    const y = ages.reignYears
    parts.push(
      y === 0 ? 'reinado muy breve (semanas o meses)' : `${y} años de reinado`,
    )
  }
  if (ages.deathAge != null) {
    parts.push(`${ages.deathAge} años al morir`)
  }
  return parts.length ? parts.join(' · ') : null
}

export function kingsChronological(): KingRecord[] {
  return [...KINGS].sort((a, b) => b.startBc - a.startBc || b.endBc - a.endBc)
}

const REYES_TO_GATEWAY: Record<string, string> = {
  '1 Reyes': '1 Kings',
  '2 Reyes': '2 Kings',
  '1 Crónicas': '1 Chronicles',
  '2 Crónicas': '2 Chronicles',
}

export function formatBcYear(year: number): string {
  return `${year} a. C.`
}

export function formatReignSpan(king: KingRecord): string {
  if (king.startBc === king.endBc) {
    return `c. ${formatBcYear(king.startBc)} (reinado breve)`
  }
  return `c. ${formatBcYear(king.startBc)} – ${formatBcYear(king.endBc)}`
}

export function passageToNtvUrl(passage: string): string {
  const trimmed = passage.trim()
  for (const [spanish, english] of Object.entries(REYES_TO_GATEWAY)) {
    if (trimmed.startsWith(spanish)) {
      const rest = trimmed.slice(spanish.length).trim()
      return bibleGatewayNtvUrl(`${english} ${rest}`)
    }
  }
  return bibleGatewayNtvUrl(trimmed)
}

export function kingsByKingdom(kingdom: KingdomId): KingRecord[] {
  return KINGS.filter((k) => k.kingdom === kingdom).sort(
    (a, b) => b.startBc - a.startBc || b.endBc - a.endBc,
  )
}

export function kingById(id: string | null | undefined): KingRecord | null {
  if (!id) return null
  return KINGS.find((k) => k.id === id) ?? null
}

/** The kingdom splits after Salomón (1 Reyes 12). */
export const DIVISION_BC = 931

/** A rival king before the division, such as Is-boset, outside the lines of Judá and Israel. */
export function isBeforeDivision(king: KingRecord): boolean {
  return (king.kingdom === 'judah' || king.kingdom === 'israel') && king.startBc > DIVISION_BC
}

/** Judá's or Israel's kings from the division on, oldest first. */
export function dividedLine(kingdom: KingdomId): KingRecord[] {
  return kingsByKingdom(kingdom).filter((k) => k.startBc <= DIVISION_BC)
}

/** The line of kings a king belongs to; Judá and Israel both begin after Salomón. */
export function lineOf(king: KingRecord): KingRecord[] {
  if (king.kingdom === 'united' || isBeforeDivision(king)) return [king]
  return dividedLine(king.kingdom)
}

export function predecessorsOf(king: KingRecord): KingRecord[] {
  if (king.kingdom === 'united' || isBeforeDivision(king)) return []
  const line = lineOf(king)
  const idx = line.findIndex((k) => k.id === king.id)
  if (idx > 0) return [line[idx - 1]]
  if (king.kingdom === 'judah' || king.kingdom === 'israel') {
    return KINGS.filter((k) => k.kingdom === 'united')
  }
  return []
}

export function successorsOf(king: KingRecord): KingRecord[] {
  if (king.kingdom === 'united') {
    return [dividedLine('judah')[0], dividedLine('israel')[0]].filter(Boolean)
  }
  if (isBeforeDivision(king)) return []
  const line = lineOf(king)
  const idx = line.findIndex((k) => k.id === king.id)
  return idx >= 0 && line[idx + 1] ? [line[idx + 1]] : []
}

/** Where a new ruling house (or a usurper) takes the throne. */
export const DYNASTY_STARTS: Record<string, string> = {
  rehoboam: 'Casa de David',
  athaliah: 'Atalía usurpa el trono',
  'joash-judah': 'Vuelve la casa de David',
  'jeroboam-i': 'Casa de Jeroboam',
  baasha: 'Casa de Baasa',
  zimri: 'Zimri (golpe de 7 días)',
  omri: 'Casa de Omri',
  jehu: 'Casa de Jehú',
  shallum: 'Salum (golpe)',
  menahem: 'Casa de Menahem',
  pekah: 'Peka (golpe)',
  hoshea: 'Oseas (último rey)',
}

export type KeyEvent = { year: number; label: string; short: string }

export const KEY_EVENTS: KeyEvent[] = [
  { year: 931, label: 'División del reino', short: 'División' },
  { year: 722, label: 'Caída de Samaria (Asiria)', short: 'Samaria cae' },
  { year: 586, label: 'Caída de Jerusalén (Babilonia)', short: 'Jerusalén cae' },
]

export function reignYears(king: KingRecord): number {
  return king.ages?.reignYears ?? Math.max(king.startBc - king.endBc, 0)
}

type PassageRange = { bookId: string; chapterStart: number; chapterEnd: number }

const PASSAGE_BOOK_IDS: Record<string, string> = {
  '1 Reyes': '1-reyes',
  '2 Reyes': '2-reyes',
}

/** "1 Reyes 12:25-33" → 1-reyes, 12–12; "2 Reyes 8:25–9:29" → 2-reyes, 8–9. Chronicles are skipped. */
export function parsePassage(passage: string): PassageRange | null {
  const match = passage
    .trim()
    .match(/^([12] Reyes)\s+(\d+)(?::[\d]+)?(?:\s*[-–]\s*(\d+)(?::(\d+))?)?/)
  if (!match) return null
  const bookId = PASSAGE_BOOK_IDS[match[1]]
  const chapterStart = Number(match[2])
  // A range "a:b-c" stays in chapter a; "a:b-c:d" ends in chapter c.
  const chapterEnd = match[4] ? Number(match[3]) : chapterStart
  return { bookId, chapterStart, chapterEnd: Math.max(chapterEnd, chapterStart) }
}

/** Chapters of 1–2 Reyes that tell this king's story, filling gaps between cited chapters. */
export function kingChapters(king: KingRecord): { bookId: string; chapter: number }[] {
  const byBook = new Map<string, { min: number; max: number }>()
  for (const p of king.passages) {
    const range = parsePassage(p)
    if (!range) continue
    const cur = byBook.get(range.bookId)
    byBook.set(range.bookId, {
      min: Math.min(cur?.min ?? Infinity, range.chapterStart),
      max: Math.max(cur?.max ?? -Infinity, range.chapterEnd),
    })
  }
  const out: { bookId: string; chapter: number }[] = []
  for (const [bookId, { min, max }] of byBook) {
    for (let chapter = min; chapter <= max; chapter++) out.push({ bookId, chapter })
  }
  return out
}

export function cardsForKing<T extends { bookId: string; chapter: number; originalNumber: number }>(
  king: KingRecord,
  cards: T[],
): T[] {
  const wanted = new Set(kingChapters(king).map((c) => `${c.bookId}:${c.chapter}`))
  return cards
    .filter((c) => wanted.has(`${c.bookId}:${c.chapter}`))
    .sort(
      (a, b) =>
        a.bookId.localeCompare(b.bookId) ||
        a.chapter - b.chapter ||
        a.originalNumber - b.originalNumber,
    )
}

export function kingdomMeta(id: KingdomId) {
  return KINGDOMS.find((k) => k.id === id)!
}

const SPAN_BC = TIMELINE_START_BC - TIMELINE_END_BC

export function reignBarPercent(king: KingRecord): { left: number; width: number } {
  const reignStart = Math.min(king.startBc, TIMELINE_START_BC)
  const reignEnd = Math.max(king.endBc, TIMELINE_END_BC)
  const left = ((TIMELINE_START_BC - reignStart) / SPAN_BC) * 100
  const width = Math.max(((reignStart - reignEnd) / SPAN_BC) * 100, 0)
  return {
    left: Math.min(100, Math.max(0, left)),
    width: Math.min(100 - left, Math.max(width, 0)),
  }
}

export type ReignPlacement = {
  king: KingRecord
  leftPx: number
  barPx: number
  lane: number
  nameOutside: boolean
}

const LANE_GAP_PX = 8

function labelPx(name: string) {
  return Math.ceil(name.length * 7.2 + 16)
}

/** True reign length, with the name beside the bar when it does not fit inside. Overlaps get their own lane. */
export function placeKingdomReigns(
  kings: KingRecord[],
  trackPx: number,
): { laneCount: number; items: ReignPlacement[] } {
  const metrics = kings.map((king) => {
    const bar = reignBarPercent(king)
    const leftPx = (bar.left / 100) * trackPx
    const barPx = Math.max((bar.width / 100) * trackPx, 6)
    const nameOutside = barPx < labelPx(king.name)
    const endPx = nameOutside ? leftPx + barPx + 4 + labelPx(king.name) : leftPx + barPx
    return { king, leftPx, barPx, nameOutside, endPx }
  })
  metrics.sort((a, b) => a.leftPx - b.leftPx || b.barPx - a.barPx)

  const laneEnds: number[] = []
  const items: ReignPlacement[] = metrics.map((item) => {
    let lane = laneEnds.findIndex((end) => item.leftPx >= end + LANE_GAP_PX)
    if (lane < 0) {
      lane = laneEnds.length
      laneEnds.push(item.endPx)
    } else {
      laneEnds[lane] = item.endPx
    }
    return {
      king: item.king,
      leftPx: item.leftPx,
      barPx: item.barPx,
      lane,
      nameOutside: item.nameOutside,
    }
  })
  return { laneCount: Math.max(laneEnds.length, 1), items }
}

export function axisTickYears(): number[] {
  const step = 50
  const ticks: number[] = []
  for (let y = TIMELINE_START_BC; y >= TIMELINE_END_BC; y -= step) {
    ticks.push(y)
  }
  if (ticks[ticks.length - 1] !== TIMELINE_END_BC) {
    ticks.push(TIMELINE_END_BC)
  }
  return ticks
}

/** Visible span of the explorer: from Is-boset (2 Samuel) to the fall of Jerusalén. */
export const EXPLORER_START_BC = 1015
export const EXPLORER_END_BC = 580

export function axisTicks(stepYears: number): number[] {
  const ticks: number[] = []
  const first = Math.floor(EXPLORER_START_BC / stepYears) * stepYears
  for (let y = first; y >= EXPLORER_END_BC; y -= stepYears) ticks.push(y)
  return ticks
}

export const DEFAULT_VISIBLE_KINGDOMS: KingdomId[] = [
  'united',
  'judah',
  'israel',
  'aram',
  'assyria',
  'egypt',
]
