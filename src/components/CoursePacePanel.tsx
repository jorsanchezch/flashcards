import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import {
  booksSummary,
  courseBooksFromCards,
  coursePaceOn,
  formatChapterRange,
  formatLongDate,
  normalizeCoursePaceSettings,
  resolveCoursePaceSettings,
  saveLocalCoursePace,
  saveSharedCoursePace,
  weekdaySummary,
  WEEKDAY_OPTIONS,
  type CourseBookRange,
  type CoursePaceSettings,
} from '@/lib/coursePace'
import type { Flashcard } from '@/lib/parseFlashcard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

type CoursePacePanelProps = {
  cards: Flashcard[]
  open: boolean
  onToggle: () => void
}

export function CoursePacePanel({ cards, open, onToggle }: CoursePacePanelProps) {
  const { userDoc, patchConfig, isAdmin } = useUser()
  const booksMeta = useMemo(() => courseBooksFromCards(cards), [cards])
  const [revision, setRevision] = useState(0)
  const settings = useMemo(
    () =>
      resolveCoursePaceSettings({
        personal: userDoc?.config.coursePace,
        booksMeta,
      }),
    [booksMeta, userDoc?.config.coursePace, revision],
  )
  const pace = useMemo(() => coursePaceOn(settings), [settings])
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<CoursePaceSettings>(settings)
  const [savedNote, setSavedNote] = useState<string | null>(null)

  const startEdit = () => {
    setDraft(normalizeCoursePaceSettings(settings, booksMeta))
    setEditing(true)
    setSavedNote(null)
  }

  const persist = (next: CoursePaceSettings, shared: boolean) => {
    const clean = normalizeCoursePaceSettings(next, booksMeta)
    saveLocalCoursePace(clean)
    patchConfig({ coursePace: clean })
    if (shared) saveSharedCoursePace(clean)
    setRevision((n) => n + 1)
    setEditing(false)
    setSavedNote(
      shared
        ? 'Ritmo guardado como predeterminado de este aparato.'
        : 'Ritmo guardado en este perfil.',
    )
  }

  const toggleWeekday = (day: number) => {
    setDraft((cur) => {
      const has = cur.weekdays.includes(day)
      const weekdays = has
        ? cur.weekdays.filter((d) => d !== day)
        : [...cur.weekdays, day]
      return { ...cur, weekdays }
    })
  }

  const setSessionsPerWeek = (count: number) => {
    const n = Math.min(7, Math.max(1, count))
    const presets: number[][] = [
      [1],
      [1, 3],
      [1, 3, 5],
      [1, 3, 5, 4],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6, 0],
    ]
    setDraft((cur) => ({ ...cur, weekdays: presets[n - 1] ?? cur.weekdays }))
  }

  const toggleBook = (metaId: string) => {
    setDraft((cur) => {
      const exists = cur.books.some((b) => b.bookId === metaId)
      if (exists) {
        return { ...cur, books: cur.books.filter((b) => b.bookId !== metaId) }
      }
      const info = booksMeta.find((b) => b.id === metaId)
      if (!info) return cur
      const books: CourseBookRange[] = [
        ...cur.books,
        {
          bookId: info.id,
          bookLabel: info.label,
          from: 1,
          to: info.maxChapter,
        },
      ]
      return { ...cur, books }
    })
  }

  const updateBookRange = (bookId: string, field: 'from' | 'to', value: number) => {
    setDraft((cur) => ({
      ...cur,
      books: cur.books.map((b) =>
        b.bookId === bookId ? { ...b, [field]: value } : b,
      ),
    }))
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-h-11 items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <span className="flex items-center gap-3">
          <CalendarDays className="size-5 shrink-0 text-primary" />
          <span>
            <span className="block font-medium">Ritmo del curso</span>
            <span className="block text-xs text-muted-foreground">
              {weekdaySummary(settings.weekdays)} · {settings.start} a {settings.end}
            </span>
          </span>
        </span>
        <span className="text-xs text-muted-foreground">{open ? 'Cerrar' : 'Abrir'}</span>
      </button>
      {open && (
        <Card className="mt-2">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Dónde deberíamos ir</CardTitle>
              {pace.isStudyDay ? (
                <Badge>Hoy hay sesión</Badge>
              ) : (
                <Badge variant="secondary">Hoy no hay sesión</Badge>
              )}
            </div>
            <CardDescription>
              {booksSummary(settings.books)} · {weekdaySummary(settings.weekdays)} ·{' '}
              {pace.totalChapters} capítulos en {pace.totalSessions} sesiones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{pace.coveredLabel}</span>
                <span className="font-medium tabular-nums">{pace.percent}%</span>
              </div>
              <Progress value={pace.percent} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {pace.sessionsDone} de {pace.totalSessions} sesiones del calendario ya
                pasaron.
              </p>
            </div>
            {pace.isStudyDay && pace.todaySession && (
              <p className="text-sm">
                <strong>Esta sesión:</strong>{' '}
                {formatChapterRange(pace.todaySession.chapters)}
              </p>
            )}
            {!pace.isStudyDay && pace.lastSession && (
              <p className="text-sm">
                <strong>Última sesión</strong> ({formatLongDate(pace.lastSession.date)}
                ): {formatChapterRange(pace.lastSession.chapters)}
              </p>
            )}
            {pace.nextSession && (
              <p className="text-sm">
                <strong>Próxima sesión</strong> ({formatLongDate(pace.nextSession.date)}
                ): {formatChapterRange(pace.nextSession.chapters)}
              </p>
            )}

            {!editing ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={startEdit}>
                  Cambiar ritmo
                </Button>
              </div>
            ) : (
              <form
                className="space-y-4 rounded-xl border p-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  persist(draft, false)
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="pace-start">Inicio</Label>
                    <Input
                      id="pace-start"
                      type="date"
                      value={draft.start}
                      onChange={(e) =>
                        setDraft((cur) => ({ ...cur, start: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pace-end">Fin</Label>
                    <Input
                      id="pace-end"
                      type="date"
                      value={draft.end}
                      onChange={(e) =>
                        setDraft((cur) => ({ ...cur, end: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pace-rate">Sesiones por semana</Label>
                  <Input
                    id="pace-rate"
                    type="number"
                    min={1}
                    max={7}
                    value={draft.weekdays.length || 1}
                    onChange={(e) =>
                      setSessionsPerWeek(Number(e.target.value) || 1)
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_OPTIONS.map((d) => {
                      const on = draft.weekdays.includes(d.day)
                      return (
                        <button
                          key={d.day}
                          type="button"
                          onClick={() => toggleWeekday(d.day)}
                          className={`min-h-11 rounded-full border px-3 text-sm ${
                            on
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'bg-background'
                          }`}
                        >
                          {d.short}
                          <span className="ml-1 hidden sm:inline">{d.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {weekdaySummary(draft.weekdays)}. Cambia el número o toca los días.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Libros y capítulos</p>
                  <ul className="space-y-2">
                    {booksMeta.map((book) => {
                      const row = draft.books.find((b) => b.bookId === book.id)
                      return (
                        <li
                          key={book.id}
                          className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
                        >
                          <label className="flex min-h-11 items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={Boolean(row)}
                              onChange={() => toggleBook(book.id)}
                            />
                            {book.label}
                          </label>
                          {row && (
                            <>
                              <Label className="text-xs text-muted-foreground">
                                De
                                <Input
                                  className="ml-1 w-16"
                                  type="number"
                                  min={1}
                                  max={book.maxChapter}
                                  value={row.from}
                                  onChange={(e) =>
                                    updateBookRange(
                                      book.id,
                                      'from',
                                      Number(e.target.value) || 1,
                                    )
                                  }
                                />
                              </Label>
                              <Label className="text-xs text-muted-foreground">
                                a
                                <Input
                                  className="ml-1 w-16"
                                  type="number"
                                  min={1}
                                  max={book.maxChapter}
                                  value={row.to}
                                  onChange={(e) =>
                                    updateBookRange(
                                      book.id,
                                      'to',
                                      Number(e.target.value) || book.maxChapter,
                                    )
                                  }
                                />
                              </Label>
                            </>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit">Guardar en este perfil</Button>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => persist(draft, true)}
                    >
                      Guardar como predeterminado
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
            {savedNote && (
              <p className="text-xs text-muted-foreground">{savedNote}</p>
            )}
          </CardContent>
        </Card>
      )}
    </li>
  )
}
