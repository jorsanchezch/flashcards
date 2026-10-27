import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_VISIBLE_KINGDOMS,
  KINGDOMS,
  KINGS,
  TIMELINE_END_BC,
  TIMELINE_START_BC,
  axisTickYears,
  formatBcYear,
  formatKingAges,
  formatReignSpan,
  kingdomMeta,
  kingsByKingdom,
  kingsChronological,
  lordStandMeta,
  passageToNtvUrl,
  reignBarPercent,
  type KingRecord,
  type KingdomId,
  type LordStand,
} from '@/lib/kingsTimeline'
import { cn } from '@/lib/utils'

type KingsTimelinePanelProps = {
  open: boolean
  onToggle: () => void
}

const STAND_LEGEND: { stand: LordStand; hint: string }[] = [
  { stand: 'righteous', hint: 'Hizo lo recto ante los ojos del Señor' },
  { stand: 'evil', hint: 'Hizo lo malo ante los ojos del Señor' },
  { stand: 'mixed', hint: 'Recto en parte, malo después o con reservas' },
  { stand: 'not_applicable', hint: 'Reyes extranjeros (Aram, Asiria, Egipto)' },
]

export function KingsTimelinePanel({ open, onToggle }: KingsTimelinePanelProps) {
  const [visible, setVisible] = useState<KingdomId[]>(DEFAULT_VISIBLE_KINGDOMS)
  const [selectedId, setSelectedId] = useState<string | null>('solomon')
  const [query, setQuery] = useState('')

  const chronological = useMemo(() => kingsChronological(), [])
  const selected = useMemo(
    () => KINGS.find((k) => k.id === selectedId) ?? null,
    [selectedId],
  )

  const searchHits = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es')
    if (!q) return []
    return KINGS.filter((k) => k.name.toLocaleLowerCase('es').includes(q)).slice(
      0,
      8,
    )
  }, [query])

  const toggleKingdom = (id: KingdomId) => {
    setVisible((cur) =>
      cur.includes(id) ? cur.filter((k) => k !== id) : [...cur, id],
    )
  }

  const rows = KINGDOMS.filter((k) => visible.includes(k.id))

  const selectKing = (id: string) => {
    setSelectedId(id)
    setQuery('')
  }

  const stepKing = (dir: -1 | 1) => {
    if (!selectedId) return
    const idx = chronological.findIndex((k) => k.id === selectedId)
    if (idx < 0) return
    const next = chronological[idx + dir]
    if (next) setSelectedId(next.id)
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-h-11 items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <span className="flex items-center gap-3">
          <Crown className="size-5 shrink-0 text-primary" />
          <span>
            <span className="block font-medium">Reyes en 1–2 Reyes</span>
            <span className="block text-xs text-muted-foreground">
              Tiempo, edades y evaluación ante el Señor (NTV)
            </span>
          </span>
        </span>
        <span className="text-xs text-muted-foreground">{open ? 'Cerrar' : 'Abrir'}</span>
      </button>
      {open && (
        <Card className="mt-2 overflow-hidden border-primary/15 bg-gradient-to-b from-primary/5 via-card to-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" aria-hidden />
              Orden, edades y camino ante Dios
            </CardTitle>
            <CardDescription>
              Cronología convencional aproximada. Toca un reinado, busca un nombre o
              usa las flechas para recorrer la historia en 1–2 Reyes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar rey o reina…"
                className="min-h-11 pl-9"
                aria-label="Buscar rey"
              />
              {searchHits.length > 0 && (
                <ul
                  className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-md"
                  role="listbox"
                >
                  {searchHits.map((k) => (
                    <li key={k.id}>
                      <button
                        type="button"
                        role="option"
                        className="flex w-full min-h-10 items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => selectKing(k.id)}
                      >
                        <span>{k.name}</span>
                        <StandDot stand={k.lordStand} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {KINGDOMS.map((k) => {
                const on = visible.includes(k.id)
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKingdom(k.id)}
                    className={cn(
                      'inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-all',
                      on
                        ? 'border-transparent bg-card shadow-sm'
                        : 'opacity-45 grayscale',
                    )}
                    aria-pressed={on}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: k.color }}
                      aria-hidden
                    />
                    {k.shortLabel}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {STAND_LEGEND.map(({ stand, hint }) => {
                const meta = lordStandMeta(stand)!
                return (
                  <span
                    key={stand}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2 py-1',
                      meta.badgeClass,
                    )}
                  >
                    <StandDot stand={stand} />
                    {meta.shortLabel}
                    <span className="hidden sm:inline opacity-80">— {hint}</span>
                  </span>
                )
              })}
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full rounded-xl border bg-background/60 p-2 shadow-inner sm:p-3">
                <p className="mb-2 text-[11px] text-muted-foreground">
                  Años en a. C.
                </p>
                <div className="w-full">
                  <div className="relative mb-2 h-7 border-b border-dashed border-border/80 text-[10px] text-muted-foreground sm:text-xs">
                    {axisTickYears().map((year) => {
                      const left =
                        ((TIMELINE_START_BC - year) /
                          (TIMELINE_START_BC - TIMELINE_END_BC)) *
                        100
                      return (
                        <span
                          key={year}
                          className="absolute -translate-x-1/2 whitespace-nowrap tabular-nums"
                          style={{ left: `${left}%` }}
                        >
                          {year}
                        </span>
                      )
                    })}
                  </div>

                  <ul className="space-y-3">
                    {rows.map((row) => (
                      <li key={row.id}>
                        <div className="mb-1 flex items-center gap-2 text-xs font-medium">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: row.color }}
                            aria-hidden
                          />
                          {row.label}
                        </div>
                        <div
                          className="relative h-11 rounded-lg bg-muted/50"
                          role="list"
                          aria-label={`Reinados de ${row.label}`}
                        >
                          {kingsByKingdom(row.id).map((king) => {
                            const bar = reignBarPercent(king)
                            const isSelected = king.id === selectedId
                            const stand = lordStandMeta(king.lordStand)
                            return (
                              <button
                                key={king.id}
                                type="button"
                                role="listitem"
                                title={`${king.name} · ${formatReignSpan(king)}`}
                                onClick={() => selectKing(king.id)}
                                className={cn(
                                  'absolute top-1.5 flex h-8 min-w-[2px] max-w-[92%] items-center gap-1 overflow-hidden rounded-md px-1.5 text-[10px] font-semibold text-white shadow-md transition hover:scale-[1.02] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[11px]',
                                  isSelected && 'z-10 scale-[1.03] shadow-lg',
                                  stand?.barClass,
                                )}
                                style={{
                                  left: `${bar.left}%`,
                                  width: `${bar.width}%`,
                                  backgroundColor: row.color,
                                }}
                              >
                                <StandDot stand={king.lordStand} className="shrink-0" />
                                <span className="truncate">{king.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-full">
                {selected ? (
                  <KingDetail
                    king={selected}
                    onPrev={() => stepKing(-1)}
                    onNext={() => stepKing(1)}
                  />
                ) : (
                  <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Elige un reinado en la línea de tiempo o búscalo arriba.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </li>
  )
}

function StandDot({
  stand,
  className,
}: {
  stand?: LordStand
  className?: string
}) {
  const colors: Record<LordStand, string> = {
    righteous: 'bg-emerald-400',
    evil: 'bg-rose-400',
    mixed: 'bg-amber-400',
    not_applicable: 'bg-muted-foreground/50',
  }
  if (!stand) {
    return (
      <span
        className={cn('inline-block size-2 rounded-full bg-white/40', className)}
        aria-hidden
      />
    )
  }
  return (
    <span
      className={cn('inline-block size-2 rounded-full ring-1 ring-white/50', colors[stand], className)}
      aria-hidden
    />
  )
}

function KingDetail({
  king,
  onPrev,
  onNext,
}: {
  king: KingRecord
  onPrev: () => void
  onNext: () => void
}) {
  const meta = kingdomMeta(king.kingdom)
  const stand = lordStandMeta(king.lordStand)
  const agesText = formatKingAges(king.ages)

  return (
    <div className="rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="min-h-10 min-w-10 shrink-0"
          onClick={onPrev}
          aria-label="Rey anterior en el tiempo"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <h3 className="truncate text-lg font-semibold tracking-tight">{king.name}</h3>
          <p className="text-xs text-muted-foreground">{meta.label}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="min-h-10 min-w-10 shrink-0"
          onClick={onNext}
          aria-label="Rey siguiente en el tiempo"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Badge variant="secondary" className="tabular-nums">
          {formatReignSpan(king)}
        </Badge>
        {stand && (
          <Badge variant="outline" className={cn('font-normal', stand.badgeClass)}>
            {stand.label}
          </Badge>
        )}
      </div>

      {agesText && (
        <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm leading-snug">
          <span className="font-medium text-foreground">Edades (relato): </span>
          {agesText}
        </p>
      )}

      {king.lordVerdict && (
        <blockquote className="mt-3 border-l-4 border-primary/40 pl-3 text-sm italic leading-relaxed text-foreground/90">
          {king.lordVerdict}
        </blockquote>
      )}

      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
        {king.father && (
          <div className="rounded-md bg-muted/40 px-2 py-1.5">
            <dt className="text-xs text-muted-foreground">Padre</dt>
            <dd className="font-medium">{king.father}</dd>
          </div>
        )}
        {king.predecessor && (
          <div className="rounded-md bg-muted/40 px-2 py-1.5">
            <dt className="text-xs text-muted-foreground">Predecesor / contexto</dt>
            <dd className="font-medium">{king.predecessor}</dd>
          </div>
        )}
      </dl>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{king.events}</p>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Pasajes NTV
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {king.passages.map((p) => (
            <li key={p}>
              <a
                href={passageToNtvUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <ExternalLink className="size-4 shrink-0" />
                {p}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Fechas y edades según 1–2 Reyes (y edades cuando el libro las indica); cronología
        convencional aproximada ({formatBcYear(TIMELINE_START_BC)} –{' '}
        {formatBcYear(TIMELINE_END_BC)}). La evaluación resume la fórmula del relato, no
        un comentario moderno.
      </p>
    </div>
  )
}
