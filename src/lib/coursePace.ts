/** Ritmo del curso: fechas, libros/capítulos y días de sesión, recalculado. */

export type CourseBookId = string

export type CourseChapter = {
  bookId: CourseBookId
  bookLabel: string
  chapter: number
}

export type CourseSession = {
  date: string
  chapters: CourseChapter[]
}

export type CourseBookRange = {
  bookId: string
  bookLabel: string
  from: number
  to: number
}

export type CoursePaceSettings = {
  start: string
  end: string
  weekdays: number[]
  books: CourseBookRange[]
}

export const WEEKDAY_OPTIONS: { day: number; label: string; short: string }[] = [
  { day: 1, label: 'Lunes', short: 'L' },
  { day: 2, label: 'Martes', short: 'M' },
  { day: 3, label: 'Miércoles', short: 'X' },
  { day: 4, label: 'Jueves', short: 'J' },
  { day: 5, label: 'Viernes', short: 'V' },
  { day: 6, label: 'Sábado', short: 'S' },
  { day: 0, label: 'Domingo', short: 'D' },
]

const SHARED_PACE_KEY = 'flashcards-shared-pace-v1'
const LOCAL_PACE_KEY = 'flashcards-course-pace-v1'

const FALLBACK_BOOKS: CourseBookRange[] = [
  { bookId: '1-samuel', bookLabel: '1 Samuel', from: 1, to: 31 },
  { bookId: '2-samuel', bookLabel: '2 Samuel', from: 1, to: 24 },
  { bookId: '1-reyes', bookLabel: '1 Reyes', from: 1, to: 22 },
  { bookId: '2-reyes', bookLabel: '2 Reyes', from: 1, to: 25 },
]

export function defaultCoursePaceSettings(): CoursePaceSettings {
  return {
    start: '2026-09-01',
    end: '2026-10-31',
    weekdays: [1, 3, 5],
    books: FALLBACK_BOOKS.map((b) => ({ ...b })),
  }
}

export type CourseBookMeta = {
  id: string
  label: string
  maxChapter: number
}

export function courseBooksFromCards(
  cards: { bookId: string; bookLabel: string; chapter: number }[],
): CourseBookMeta[] {
  const map = new Map<string, CourseBookMeta>()
  for (const card of cards) {
    const cur = map.get(card.bookId)
    if (!cur) {
      map.set(card.bookId, {
        id: card.bookId,
        label: card.bookLabel,
        maxChapter: card.chapter,
      })
    } else if (card.chapter > cur.maxChapter) {
      cur.maxChapter = card.chapter
    }
  }
  const order = ['1-samuel', '2-samuel', '1-reyes', '2-reyes']
  return [...map.values()].sort((a, b) => {
    const ia = order.indexOf(a.id)
    const ib = order.indexOf(b.id)
    if (ia >= 0 && ib >= 0) return ia - ib
    if (ia >= 0) return -1
    if (ib >= 0) return 1
    return a.label.localeCompare(b.label, 'es')
  })
}

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYmd(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function isYmd(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function normalizeCoursePaceSettings(
  raw: unknown,
  booksMeta?: CourseBookMeta[],
): CoursePaceSettings {
  const fallback = defaultCoursePaceSettings()
  const meta =
    booksMeta && booksMeta.length
      ? booksMeta
      : fallback.books.map((b) => ({
          id: b.bookId,
          label: b.bookLabel,
          maxChapter: b.to,
        }))
  const source =
    raw && typeof raw === 'object' ? (raw as Partial<CoursePaceSettings>) : {}
  let start = isYmd(source.start) ? source.start : fallback.start
  let end = isYmd(source.end) ? source.end : fallback.end
  if (parseYmd(end) < parseYmd(start)) {
    const swap = start
    start = end
    end = swap
  }
  const weekdaysRaw = Array.isArray(source.weekdays) ? source.weekdays : fallback.weekdays
  const weekdays = [
    ...new Set(
      weekdaysRaw.filter(
        (d): d is number =>
          typeof d === 'number' && Number.isInteger(d) && d >= 0 && d <= 6,
      ),
    ),
  ]
  const safeDays = weekdays.length ? weekdays : [...fallback.weekdays]

  const byId = new Map(meta.map((b) => [b.id, b]))
  const books: CourseBookRange[] = []
  if (Array.isArray(source.books)) {
    for (const row of source.books) {
      if (!row || typeof row !== 'object') continue
      const bookId = typeof row.bookId === 'string' ? row.bookId : ''
      const info = byId.get(bookId)
      if (!info) continue
      const max = info.maxChapter
      let from =
        typeof row.from === 'number' && Number.isFinite(row.from)
          ? Math.floor(row.from)
          : 1
      let to =
        typeof row.to === 'number' && Number.isFinite(row.to)
          ? Math.floor(row.to)
          : max
      from = Math.min(max, Math.max(1, from))
      to = Math.min(max, Math.max(1, to))
      if (to < from) {
        const t = from
        from = to
        to = t
      }
      books.push({
        bookId: info.id,
        bookLabel: info.label,
        from,
        to,
      })
    }
  }
  if (!books.length) {
    for (const info of meta) {
      books.push({
        bookId: info.id,
        bookLabel: info.label,
        from: 1,
        to: info.maxChapter,
      })
    }
  }

  return { start, end, weekdays: safeDays, books }
}

export function loadSharedCoursePace(
  booksMeta?: CourseBookMeta[],
): CoursePaceSettings | null {
  try {
    const raw = localStorage.getItem(SHARED_PACE_KEY)
    if (!raw) return null
    return normalizeCoursePaceSettings(JSON.parse(raw), booksMeta)
  } catch {
    return null
  }
}

export function saveSharedCoursePace(settings: CoursePaceSettings) {
  localStorage.setItem(SHARED_PACE_KEY, JSON.stringify(settings))
}

export function loadLocalCoursePace(
  booksMeta?: CourseBookMeta[],
): CoursePaceSettings | null {
  try {
    const raw = localStorage.getItem(LOCAL_PACE_KEY)
    if (!raw) return null
    return normalizeCoursePaceSettings(JSON.parse(raw), booksMeta)
  } catch {
    return null
  }
}

export function saveLocalCoursePace(settings: CoursePaceSettings) {
  localStorage.setItem(LOCAL_PACE_KEY, JSON.stringify(settings))
}

export function resolveCoursePaceSettings(options: {
  personal?: unknown
  booksMeta?: CourseBookMeta[]
}): CoursePaceSettings {
  const meta = options.booksMeta
  if (options.personal) {
    return normalizeCoursePaceSettings(options.personal, meta)
  }
  return (
    loadSharedCoursePace(meta) ??
    loadLocalCoursePace(meta) ??
    normalizeCoursePaceSettings(null, meta)
  )
}

export function allCourseChapters(settings: CoursePaceSettings): CourseChapter[] {
  const list: CourseChapter[] = []
  for (const book of settings.books) {
    for (let n = book.from; n <= book.to; n += 1) {
      list.push({
        bookId: book.bookId,
        bookLabel: book.bookLabel,
        chapter: n,
      })
    }
  }
  return list
}

export function studyDatesInCourse(settings: CoursePaceSettings): string[] {
  const dates: string[] = []
  const wanted = new Set(settings.weekdays)
  const cur = parseYmd(settings.start)
  const end = parseYmd(settings.end)
  while (cur.getTime() <= end.getTime()) {
    if (wanted.has(cur.getDay())) dates.push(ymd(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

function splitChaptersAcrossSessions(
  chapters: CourseChapter[],
  sessionCount: number,
): CourseChapter[][] {
  const buckets: CourseChapter[][] = Array.from(
    { length: sessionCount },
    () => [],
  )
  if (sessionCount <= 0) return buckets
  const n = chapters.length
  for (let i = 0; i < n; i += 1) {
    const sessionIndex = Math.min(
      sessionCount - 1,
      Math.floor((i * sessionCount) / n),
    )
    buckets[sessionIndex].push(chapters[i])
  }
  return buckets
}

export function buildCourseSessions(settings: CoursePaceSettings): CourseSession[] {
  const dates = studyDatesInCourse(settings)
  const buckets = splitChaptersAcrossSessions(
    allCourseChapters(settings),
    dates.length,
  )
  return dates.map((date, i) => ({ date, chapters: buckets[i] ?? [] }))
}

export function formatChapterRange(chapters: CourseChapter[]): string {
  if (!chapters.length) return 'Ningún capítulo'
  const parts: string[] = []
  let i = 0
  while (i < chapters.length) {
    const book = chapters[i].bookLabel
    const start = chapters[i].chapter
    let end = start
    i += 1
    while (
      i < chapters.length &&
      chapters[i].bookLabel === book &&
      chapters[i].chapter === end + 1
    ) {
      end = chapters[i].chapter
      i += 1
    }
    parts.push(start === end ? `${book} ${start}` : `${book} ${start}–${end}`)
  }
  return parts.join(', ')
}

export function formatLongDate(iso: string): string {
  return parseYmd(iso).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function weekdaySummary(weekdays: number[]): string {
  const labels = WEEKDAY_OPTIONS.filter((d) => weekdays.includes(d.day)).map(
    (d) => d.label.toLowerCase(),
  )
  if (!labels.length) return 'sin días de sesión'
  if (labels.length === 1) return `un día por semana (${labels[0]})`
  return `${labels.length} días por semana (${labels.join(', ')})`
}

export function booksSummary(books: CourseBookRange[]): string {
  if (!books.length) return 'sin libros'
  return books
    .map((b) =>
      b.from === b.to ? `${b.bookLabel} ${b.from}` : `${b.bookLabel} ${b.from}–${b.to}`,
    )
    .join(', ')
}

export type CoursePaceSnapshot = {
  totalChapters: number
  totalSessions: number
  sessionsDone: number
  percent: number
  coveredThrough: CourseChapter | null
  coveredLabel: string
  todaySession: CourseSession | null
  nextSession: CourseSession | null
  lastSession: CourseSession | null
  isStudyDay: boolean
  settings: CoursePaceSettings
}

export function coursePaceOn(
  settings: CoursePaceSettings,
  today: Date = new Date(),
): CoursePaceSnapshot {
  const sessions = buildCourseSessions(settings)
  const todayKey = ymd(today)
  const start = parseYmd(settings.start)
  const end = parseYmd(settings.end)
  const t = parseYmd(todayKey)

  let lastIdx = -1
  for (let i = 0; i < sessions.length; i += 1) {
    if (sessions[i].date <= todayKey) lastIdx = i
  }
  const todaySession = sessions.find((s) => s.date === todayKey) ?? null
  const nextSession = sessions.find((s) => s.date > todayKey) ?? null

  let sessionsDone = 0
  if (t < start) sessionsDone = 0
  else if (t > end) sessionsDone = sessions.length
  else sessionsDone = lastIdx >= 0 ? lastIdx + 1 : 0

  const covered = sessions.slice(0, sessionsDone).flatMap((s) => s.chapters)
  const coveredThrough = covered.at(-1) ?? null
  const totalChapters = allCourseChapters(settings).length
  const percent =
    totalChapters <= 0 ? 0 : Math.round((covered.length / totalChapters) * 100)

  let coveredLabel = 'El curso aún no comienza'
  if (t > end) coveredLabel = 'Este tramo del curso ya terminó'
  else if (coveredThrough) {
    coveredLabel = `Hasta ${coveredThrough.bookLabel} ${coveredThrough.chapter}`
  } else if (!sessions.length) {
    coveredLabel = 'No hay sesiones con estas fechas y días'
  }

  return {
    totalChapters,
    totalSessions: sessions.length,
    sessionsDone,
    percent,
    coveredThrough,
    coveredLabel,
    todaySession,
    nextSession,
    lastSession: lastIdx >= 0 ? sessions[lastIdx] : null,
    isStudyDay: Boolean(todaySession),
    settings,
  }
}
