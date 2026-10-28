import { useCallback, useState } from 'react'
import { ArrowDown, ArrowUp, Check, RotateCcw, Trophy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatReignSpan,
  kingdomMeta,
  lordStandMeta,
  type KingRecord,
} from '@/lib/kingsTimeline'
import {
  QUIZ_KINDS,
  isOrderCorrect,
  loadQuizStats,
  makeQuestion,
  saveQuizStats,
  type QuizKind,
  type QuizQuestion,
  type QuizScope,
  type QuizStats,
} from '@/lib/kingsQuiz'
import { cn } from '@/lib/utils'
import { StandGlyph } from './StandGlyph'

const SCOPES: { id: QuizScope; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'judah', label: 'Judá' },
  { id: 'israel', label: 'Israel' },
]

type KingsPracticeProps = {
  onSelect: (id: string) => void
}

export function KingsPractice({ onSelect }: KingsPracticeProps) {
  const [kind, setKind] = useState<QuizKind>('order')
  const [scope, setScope] = useState<QuizScope>('all')
  const [question, setQuestion] = useState<QuizQuestion>(() => makeQuestion('order', 'all'))
  const [order, setOrder] = useState<KingRecord[]>(() =>
    question.kind === 'order' ? question.kings : [],
  )
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState<boolean | null>(null)
  const [missed, setMissed] = useState<KingRecord[]>([])
  const [streak, setStreak] = useState(0)
  const [stats, setStats] = useState<QuizStats>(loadQuizStats)

  const next = useCallback(
    (nextKind = kind, nextScope = scope) => {
      // Now and then, bring back a king the learner missed.
      const focus = missed.length && Math.random() < 0.4 ? missed[0] : undefined
      const q = makeQuestion(nextKind, nextScope, focus)
      if (focus && q.kind !== 'order' && q.king.id === focus.id) {
        setMissed((m) => m.slice(1))
      }
      setQuestion(q)
      setOrder(q.kind === 'order' ? q.kings : [])
      setPicked(null)
      setChecked(null)
    },
    [kind, scope, missed],
  )

  const record = (correct: boolean, kings: KingRecord[]) => {
    setChecked(correct)
    setStreak((s) => (correct ? s + 1 : 0))
    if (!correct) {
      setMissed((m) => [...m, ...kings.filter((k) => !m.some((x) => x.id === k.id))])
    }
    setStats((s) => {
      const nextStreak = correct ? streak + 1 : 0
      const updated = {
        answered: s.answered + 1,
        correct: s.correct + (correct ? 1 : 0),
        best: Math.max(s.best, nextStreak),
      }
      saveQuizStats(updated)
      return updated
    })
  }

  const choose = (choice: string) => {
    if (question.kind === 'order' || checked !== null) return
    setPicked(choice)
    record(choice === question.answer, [question.king])
  }

  const checkOrder = () => {
    if (question.kind !== 'order') return
    const correct = isOrderCorrect(order)
    record(correct, correct ? [] : order)
  }

  const move = (index: number, dir: -1 | 1) => {
    setOrder((cur) => {
      const target = index + dir
      if (target < 0 || target >= cur.length) return cur
      const copy = [...cur]
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy
    })
  }

  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-3">
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
          {QUIZ_KINDS.map((q) => (
            <button
              key={q.kind}
              type="button"
              onClick={() => {
                setKind(q.kind)
                next(q.kind, scope)
              }}
              aria-pressed={kind === q.kind}
              className={cn(
                'min-h-12 rounded-xl border px-3 py-2 text-left transition-all',
                kind === q.kind
                  ? 'border-primary bg-primary text-primary-foreground shadow-card'
                  : 'bg-card hover:border-primary/30 hover:bg-accent/30',
              )}
            >
              <span className="block text-sm font-semibold">{q.label}</span>
              <span
                className={cn(
                  'block text-[11px]',
                  kind === q.kind ? 'opacity-85' : 'text-muted-foreground',
                )}
              >
                {q.hint}
              </span>
            </button>
          ))}
        </div>
        <div className="inline-flex w-full rounded-lg bg-muted p-0.5" role="group" aria-label="Reino">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setScope(s.id)
                next(kind, s.id)
              }}
              aria-pressed={scope === s.id}
              className={cn(
                'min-h-8 flex-1 rounded-md text-xs font-medium transition-all',
                scope === s.id
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <dl className="grid grid-cols-3 gap-1.5 text-center">
          <Stat label="Racha" value={streak} />
          <Stat label="Acierto" value={`${accuracy}%`} />
          <Stat label="Mejor" value={stats.best} icon />
        </dl>
        {missed.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            {missed.length} {missed.length === 1 ? 'rey vuelve' : 'reyes vuelven'} para repasar.
          </p>
        )}
      </aside>

      <section
        className="rounded-2xl border bg-card p-4 shadow-raised sm:p-5"
        aria-live="polite"
      >
        <p className="font-display text-lg leading-snug font-semibold sm:text-xl">
          {question.prompt}
        </p>

        {question.kind === 'order' ? (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              Usa las flechas para mover cada rey. Arriba = el primero en reinar.
            </p>
            <ol className="mt-3 space-y-1.5">
              {order.map((king, i) => {
                const meta = kingdomMeta(king.kingdom)
                const sortedIndex = [...order]
                  .sort((a, b) => b.startBc - a.startBc)
                  .findIndex((k) => k.id === king.id)
                const rightSpot = checked !== null && sortedIndex === i
                return (
                  <li
                    key={king.id}
                    className={cn(
                      'flex min-h-12 items-center gap-2 rounded-xl border bg-background px-2 py-1.5 transition-colors',
                      checked !== null &&
                        (rightSpot
                          ? 'border-stand-righteous/60 bg-stand-righteous/10'
                          : 'border-stand-evil/60 bg-stand-evil/10'),
                    )}
                  >
                    <span className="w-5 text-center text-xs font-semibold text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{king.name}</span>
                      {checked !== null && (
                        <span className="block text-[11px] text-muted-foreground tabular-nums">
                          {formatReignSpan(king)}
                        </span>
                      )}
                    </span>
                    {checked === null && (
                      <span className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="size-9"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          aria-label={`Subir ${king.name}`}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="size-9"
                          onClick={() => move(i, 1)}
                          disabled={i === order.length - 1}
                          aria-label={`Bajar ${king.name}`}
                        >
                          <ArrowDown />
                        </Button>
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {question.choices.map((choice) => {
              const isAnswer = choice === question.answer
              const isPicked = choice === picked
              const standKey =
                question.kind === 'stand'
                  ? (['righteous', 'evil', 'mixed'] as const).find(
                      (s) => lordStandMeta(s)!.shortLabel === choice,
                    )
                  : undefined
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => choose(choice)}
                  disabled={checked !== null}
                  className={cn(
                    'flex min-h-12 items-center gap-2 rounded-xl border bg-background px-3 py-2 text-left font-medium transition-all',
                    checked === null && 'hover:border-primary/40 hover:bg-accent/30',
                    checked !== null && isAnswer && 'border-stand-righteous bg-stand-righteous/12',
                    checked !== null && isPicked && !isAnswer && 'border-stand-evil bg-stand-evil/12',
                    checked !== null && !isAnswer && !isPicked && 'opacity-55',
                  )}
                >
                  {standKey && <StandGlyph stand={standKey} />}
                  <span className="flex-1">{choice}</span>
                  {checked !== null && isAnswer && <Check className="size-4 text-stand-righteous" />}
                  {checked !== null && isPicked && !isAnswer && <X className="size-4 text-stand-evil" />}
                </button>
              )
            })}
          </div>
        )}

        {checked !== null && (
          <Feedback question={question} correct={checked} onSelect={onSelect} />
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {question.kind === 'order' && checked === null ? (
            <Button type="button" className="min-h-11" onClick={checkOrder}>
              <Check /> Comprobar
            </Button>
          ) : (
            checked !== null && (
              <Button type="button" className="min-h-11" onClick={() => next()}>
                Siguiente pregunta
              </Button>
            )
          )}
          {checked === null && (
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => next()}>
              <RotateCcw /> Otra
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon?: boolean }) {
  return (
    <div className="rounded-xl bg-muted/60 px-1 py-1.5">
      <dd className="flex items-center justify-center gap-1 font-display text-lg font-semibold tabular-nums">
        {icon && <Trophy className="size-3.5 text-gold" aria-hidden />}
        {value}
      </dd>
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
    </div>
  )
}

function Feedback({
  question,
  correct,
  onSelect,
}: {
  question: QuizQuestion
  correct: boolean
  onSelect: (id: string) => void
}) {
  const king = question.kind === 'order' ? null : question.king
  return (
    <div
      className={cn(
        'animate-fade-in mt-4 rounded-xl border p-3',
        correct
          ? 'border-stand-righteous/40 bg-stand-righteous/8'
          : 'border-stand-evil/40 bg-stand-evil/8',
      )}
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        {correct ? (
          <Check className="size-4 text-stand-righteous" />
        ) : (
          <X className="size-4 text-stand-evil" />
        )}
        {correct ? '¡Correcto!' : 'Casi. Así es en el relato:'}
      </p>
      {king ? (
        <>
          {king.lordVerdict && (
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85 italic">
              {king.lordVerdict}
            </p>
          )}
          <button
            type="button"
            onClick={() => onSelect(king.id)}
            className="mt-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            Ver a {king.name} en la línea de tiempo
          </button>
        </>
      ) : (
        !correct && (
          <p className="mt-1 text-sm text-muted-foreground">
            Las fechas ya aparecen debajo de cada nombre; compáralas con tu orden.
          </p>
        )
      )}
    </div>
  )
}
