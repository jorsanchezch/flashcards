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
  barClass: string
  badgeClass: string
}

const LORD_STAND_META: Record<LordStand, LordStandMeta> = {
  righteous: {
    label: 'Recto ante el Señor',
    shortLabel: 'Recto',
    barClass: 'ring-2 ring-emerald-400/80',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100',
  },
  evil: {
    label: 'Malo ante el Señor',
    shortLabel: 'Malo',
    barClass: 'ring-2 ring-rose-400/80',
    badgeClass: 'border-rose-500/40 bg-rose-500/15 text-rose-900 dark:text-rose-100',
  },
  mixed: {
    label: 'Recto y malo (según el relato)',
    shortLabel: 'Mixto',
    barClass: 'ring-2 ring-amber-400/80',
    badgeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-100',
  },
  not_applicable: {
    label: 'Sin fórmula de evaluación',
    shortLabel: 'Extranjero',
    barClass: 'ring-1 ring-border',
    badgeClass: 'border-border bg-muted text-muted-foreground',
  },
}

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
  return [...KINGS].sort((a, b) => b.startBc - a.startBc)
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
    (a, b) => b.startBc - a.startBc,
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
  const width = Math.max(
    ((reignStart - reignEnd) / SPAN_BC) * 100,
    king.startBc === king.endBc ? 1.2 : 0.8,
  )
  return {
    left: Math.min(100, Math.max(0, left)),
    width: Math.min(100 - left, Math.max(width, 0.8)),
  }
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

export const DEFAULT_VISIBLE_KINGDOMS: KingdomId[] = [
  'united',
  'judah',
  'israel',
  'aram',
  'assyria',
  'egypt',
]
