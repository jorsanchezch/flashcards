import type { UserDocument } from '@/lib/userData'

/**
 * Days in a row with study activity, ending today (or yesterday, so the
 * streak survives until the person studies again today).
 *
 * Revisada marks carry timestamps in the user document; La sé and Repasar do
 * not, so any mark also records the day in a small per-device log.
 */

const KEEP_DAYS = 120

function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function storageKey(userId: string) {
  return `study-days:${userId}`
}

function loadDays(userId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === 'string') : []
  } catch {
    return []
  }
}

export function recordStudyDay(userId: string, now = new Date()) {
  const today = dayKey(now)
  const days = loadDays(userId)
  if (days.includes(today)) return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...days, today].slice(-KEEP_DAYS)))
  } catch {
    // Not saved; the streak just won't count today on this device.
  }
}

export type StudyStreak = { days: number; studiedToday: boolean }

export function studyStreak(doc: UserDocument, now = new Date()): StudyStreak {
  const days = new Set(loadDays(doc.userId))
  for (const entry of Object.values(doc.progress)) {
    for (const ts of entry.reviewedAt ?? []) {
      const date = new Date(ts)
      if (!Number.isNaN(date.getTime())) days.add(dayKey(date))
    }
  }
  const cursor = new Date(now)
  const studiedToday = days.has(dayKey(cursor))
  if (!studiedToday) cursor.setDate(cursor.getDate() - 1)
  let count = 0
  while (days.has(dayKey(cursor))) {
    count++
    cursor.setDate(cursor.getDate() - 1)
  }
  return { days: count, studiedToday }
}
