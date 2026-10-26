import { bibleGatewayNtvUrl } from '@/lib/bibleGateway'
import {
  KINGDOMS,
  KINGS,
  TIMELINE_END_BC,
  TIMELINE_START_BC,
  type KingRecord,
  type KingdomId,
} from '@/lib/kingsTimelineData'

export {
  KINGDOMS,
  KINGS,
  TIMELINE_END_BC,
  TIMELINE_START_BC,
  type KingRecord,
  type KingdomId,
} from '@/lib/kingsTimelineData'

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
