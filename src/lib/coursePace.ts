/** Course pace: 1–2 Samuel and 1–2 Reyes, 3 study days/week, 1 Sep–31 Oct 2026. */

export type CourseBookId = '1-samuel' | '2-samuel' | '1-reyes' | '2-reyes'

export type CourseChapter = {
  bookId: CourseBookId
  bookLabel: string
  chapter: number
}

export type CourseSession = {
  date: string
  chapters: CourseChapter[]
}

const COURSE_START = '2026-09-01'
const COURSE_END = '2026-10-31'
const STUDY_WEEKDAYS = new Set([1, 3, 5]) // lunes, miércoles, viernes

const BOOKS: { id: CourseBookId; label: string; chapters: number }[] = [
  { id: '1-samuel', label: '1 Samuel', chapters: 22 },
  { id: '2-samuel', label: '2 Samuel', chapters: 24 },
  { id: '1-reyes', label: '1 Reyes', chapters: 22 },
  { id: '2-reyes', label: '2 Reyes', chapters: 25 },
]

export function allCourseChapters(): CourseChapter[] {
  const list: CourseChapter[] = []
  for (const book of BOOKS) {
    for (let n = 1; n <= book.chapters; n += 1) {
      list.push({ bookId: book.id, bookLabel: book.label, chapter: n })
    }
  }
  return list
}

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYmd(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function studyDatesInCourse(): string[] {
  const dates: string[] = []
  const cur = parseYmd(COURSE_START)
  const end = parseYmd(COURSE_END)
  while (cur.getTime() <= end.getTime()) {
    if (STUDY_WEEKDAYS.has(cur.getDay())) dates.push(ymd(cur))
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

export function buildCourseSessions(): CourseSession[] {
  const dates = studyDatesInCourse()
  const buckets = splitChaptersAcrossSessions(allCourseChapters(), dates.length)
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
}

export function coursePaceOn(today: Date = new Date()): CoursePaceSnapshot {
  const sessions = buildCourseSessions()
  const todayKey = ymd(today)
  const start = parseYmd(COURSE_START)
  const end = parseYmd(COURSE_END)
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

  const covered = sessions
    .slice(0, sessionsDone)
    .flatMap((s) => s.chapters)
  const coveredThrough = covered.at(-1) ?? null
  const totalChapters = allCourseChapters().length
  const percent =
    totalChapters <= 0
      ? 0
      : Math.round((covered.length / totalChapters) * 100)

  let coveredLabel = 'El curso aún no comienza'
  if (t > end) coveredLabel = 'El tramo de septiembre–octubre ya terminó'
  else if (coveredThrough) {
    coveredLabel = `Hasta ${coveredThrough.bookLabel} ${coveredThrough.chapter}`
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
  }
}
