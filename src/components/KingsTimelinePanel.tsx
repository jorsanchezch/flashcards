import { useMemo, useState } from 'react'
import { Crown, ExternalLink } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DEFAULT_VISIBLE_KINGDOMS,
  KINGDOMS,
  KINGS,
  TIMELINE_END_BC,
  TIMELINE_START_BC,
  axisTickYears,
  formatBcYear,
  formatReignSpan,
  kingdomMeta,
  kingsByKingdom,
  passageToNtvUrl,
  reignBarPercent,
  type KingRecord,
  type KingdomId,
} from '@/lib/kingsTimeline'
import { cn } from '@/lib/utils'

type KingsTimelinePanelProps = {
  open: boolean
  onToggle: () => void
}

export function KingsTimelinePanel({ open, onToggle }: KingsTimelinePanelProps) {
  const [visible, setVisible] = useState<KingdomId[]>(DEFAULT_VISIBLE_KINGDOMS)
  const [selectedId, setSelectedId] = useState<string | null>('solomon')

  const selected = useMemo(
    () => KINGS.find((k) => k.id === selectedId) ?? null,
    [selectedId],
  )

  const toggleKingdom = (id: KingdomId) => {
    setVisible((cur) =>
      cur.includes(id) ? cur.filter((k) => k !== id) : [...cur, id],
    )
  }

  const rows = KINGDOMS.filter((k) => visible.includes(k.id))

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
              Línea de tiempo: Israel, Judá, Aram y potencias vecinas
            </span>
          </span>
        </span>
        <span className="text-xs text-muted-foreground">{open ? 'Cerrar' : 'Abrir'}</span>
      </button>
      {open && (
        <Card className="mt-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Orden y época de los reinados
            </CardTitle>
            <CardDescription>
              Cronología aproximada (convencional) para comparar reinos en paralelo.
              Toca un nombre para ver fechas, sucesión y pasajes en NTV (Bible Gateway).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {KINGDOMS.map((k) => {
                const on = visible.includes(k.id)
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKingdom(k.id)}
                    className={cn(
                      'inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors',
                      on ? 'bg-accent text-accent-foreground' : 'opacity-50',
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

            <div className="overflow-x-auto rounded-lg border bg-muted/30 p-2 sm:p-3">
              <div className="min-w-[min(100%,36rem)] sm:min-w-[42rem]">
                <div className="relative mb-1 h-6 border-b border-border/80 text-[10px] text-muted-foreground sm:text-xs">
                  {axisTickYears().map((year) => {
                    const left =
                      ((TIMELINE_START_BC - year) /
                        (TIMELINE_START_BC - TIMELINE_END_BC)) *
                      100
                    return (
                      <span
                        key={year}
                        className="absolute -translate-x-1/2 whitespace-nowrap"
                        style={{ left: `${left}%` }}
                      >
                        {year}
                      </span>
                    )
                  })}
                  <span className="absolute right-0 top-0 text-[10px]">a. C.</span>
                </div>

                <ul className="space-y-2">
                  {rows.map((row) => (
                    <li key={row.id}>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        {row.label}
                      </div>
                      <div
                        className="relative h-9 rounded-md bg-background/80"
                        role="list"
                        aria-label={`Reinados de ${row.label}`}
                      >
                        {kingsByKingdom(row.id).map((king) => {
                          const bar = reignBarPercent(king)
                          const isSelected = king.id === selectedId
                          return (
                            <button
                              key={king.id}
                              type="button"
                              role="listitem"
                              title={`${king.name} (${formatReignSpan(king)})`}
                              onClick={() => setSelectedId(king.id)}
                              className={cn(
                                'absolute top-1 flex h-7 min-w-[2px] items-center overflow-hidden rounded px-1 text-[10px] font-medium text-white shadow-sm transition ring-offset-2 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[11px]',
                                isSelected && 'ring-2 ring-primary ring-offset-2',
                              )}
                              style={{
                                left: `${bar.left}%`,
                                width: `${bar.width}%`,
                                backgroundColor: row.color,
                              }}
                            >
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

            {selected ? (
              <KingDetail king={selected} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Elige un rey en la línea de tiempo para ver detalles.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </li>
  )
}

function KingDetail({ king }: { king: KingRecord }) {
  const meta = kingdomMeta(king.kingdom)
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{king.name}</h3>
          <p className="text-sm text-muted-foreground">{meta.label}</p>
        </div>
        <Badge variant="secondary">{formatReignSpan(king)}</Badge>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {king.father && (
          <div>
            <dt className="text-muted-foreground">Padre</dt>
            <dd>{king.father}</dd>
          </div>
        )}
        {king.predecessor && (
          <div>
            <dt className="text-muted-foreground">Predecesor / contexto</dt>
            <dd>{king.predecessor}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-sm leading-relaxed">{king.events}</p>
      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">
          Pasajes en NTV (Bible Gateway)
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {king.passages.map((p) => (
            <li key={p}>
              <a
                href={passageToNtvUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-4 shrink-0" />
                {p}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Las fechas siguen una cronología bíblica convencional aproximada; los
        años exactos varían entre estudios. El relato canónico está en 1–2 Reyes
        ({formatBcYear(TIMELINE_START_BC)} – {formatBcYear(TIMELINE_END_BC)} en
        esta vista).
      </p>
    </div>
  )
}
