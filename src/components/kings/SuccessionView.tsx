import { useMemo } from 'react'
import { Crown } from 'lucide-react'
import {
  DYNASTY_STARTS,
  KEY_EVENTS,
  KINGS,
  kingdomMeta,
  kingsByKingdom,
  reignYears,
  type KingRecord,
  type KingdomId,
} from '@/lib/kingsTimeline'
import { cn } from '@/lib/utils'
import { StandGlyph } from './StandGlyph'

type Column = 'judah' | 'israel'

type Row =
  | { type: 'kings'; year: number; judah?: KingRecord; israel?: KingRecord }
  | { type: 'event'; year: number; label: string }
  | { type: 'neighbors'; year: number; kings: KingRecord[] }

const FOREIGN: KingdomId[] = ['aram', 'assyria', 'egypt']
/** Reigns that begin within this many years share a row, so synchronisms line up. */
const SAME_ROW_YEARS = 3

function buildRows(visible: KingdomId[]): Row[] {
  const columns = (['judah', 'israel'] as Column[]).filter((c) => visible.includes(c))
  const israelites = columns
    .flatMap((c) => kingsByKingdom(c))
    .sort((a, b) => b.startBc - a.startBc || b.endBc - a.endBc)
  const neighbors = KINGS.filter(
    (k) => FOREIGN.includes(k.kingdom) && visible.includes(k.kingdom),
  )

  const rows: Row[] = []
  for (const king of israelites) {
    const col = king.kingdom as Column
    const last = rows[rows.length - 1]
    if (
      last?.type === 'kings' &&
      !last[col] &&
      Math.abs(last.year - king.startBc) <= SAME_ROW_YEARS
    ) {
      last[col] = king
    } else {
      rows.push({ type: 'kings', year: king.startBc, [col]: king })
    }
  }

  // Neighbors join the row closest to when they came to power.
  const neighborRows: Row[] = []
  for (const n of neighbors) {
    const existing = neighborRows.find(
      (r) => r.type === 'neighbors' && Math.abs(r.year - n.startBc) <= 10,
    )
    if (existing && existing.type === 'neighbors') existing.kings.push(n)
    else neighborRows.push({ type: 'neighbors', year: n.startBc, kings: [n] })
  }

  const events: Row[] = KEY_EVENTS.filter((e) => e.year < 931).map((e) => ({
    type: 'event',
    year: e.year,
    label: e.label,
  }))

  const order = (r: Row) => (r.type === 'event' ? 0 : r.type === 'neighbors' ? 1 : 2)
  return [...rows, ...neighborRows, ...events].sort(
    (a, b) => b.year - a.year || order(a) - order(b),
  )
}

type SuccessionViewProps = {
  visible: KingdomId[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function SuccessionView({ visible, selectedId, onSelect }: SuccessionViewProps) {
  const rows = useMemo(() => buildRows(visible), [visible])
  const numbers = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of ['judah', 'israel'] as Column[]) {
      kingsByKingdom(c).forEach((k, i) => map.set(k.id, i + 1))
    }
    return map
  }, [])
  const showJudah = visible.includes('judah')
  const showIsrael = visible.includes('israel')
  const twoCols = showJudah && showIsrael
  const solomon = KINGS.find((k) => k.kingdom === 'united')

  return (
    <div className="space-y-3">
      {solomon && visible.includes('united') && (
        <div className="mx-auto max-w-xs">
          <SuccessionCard
            king={solomon}
            label="Reino unido"
            selected={selectedId === solomon.id}
            onSelect={onSelect}
          />
        </div>
      )}

      <div className="relative flex items-center gap-2 py-1">
        <span className="h-px flex-1 bg-gold/60" />
        <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-foreground dark:text-gold">
          931 a. C. · El reino se divide
        </span>
        <span className="h-px flex-1 bg-gold/60" />
      </div>

      <div className={cn('grid gap-x-3', twoCols ? 'grid-cols-2' : 'grid-cols-1')}>
        {showJudah && (
          <ColumnHeader kingdom="judah" note="Sur · Jerusalén · casa de David" />
        )}
        {showIsrael && (
          <ColumnHeader kingdom="israel" note="Norte · Siquem, Tirsa, Samaria" />
        )}
      </div>

      <ol className="space-y-2">
        {rows.map((row, i) => {
          if (row.type === 'event') {
            return (
              <li key={`e-${row.year}`} className="flex items-center gap-2 py-1">
                <span className="h-px flex-1 bg-gold/60" />
                <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-foreground dark:text-gold">
                  {row.year} a. C. · {row.label}
                </span>
                <span className="h-px flex-1 bg-gold/60" />
              </li>
            )
          }
          if (row.type === 'neighbors') {
            return (
              <li
                key={`n-${row.year}-${i}`}
                className="flex flex-wrap items-center justify-center gap-1.5"
              >
                <span className="text-[11px] text-muted-foreground">Vecinos:</span>
                {row.kings.map((k) => {
                  const meta = kingdomMeta(k.kingdom)
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => onSelect(k.id)}
                      className={cn(
                        'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-dashed bg-background px-2.5 text-xs transition-colors hover:bg-accent/40',
                        selectedId === k.id && 'border-solid border-foreground',
                      )}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden
                      />
                      <span className="font-medium">{k.name}</span>
                      <span className="text-muted-foreground">{meta.shortLabel}</span>
                    </button>
                  )
                })}
              </li>
            )
          }
          return (
            <li
              key={`k-${row.year}-${i}`}
              className={cn('grid gap-x-3', twoCols ? 'grid-cols-2' : 'grid-cols-1')}
            >
              {showJudah && (
                <Cell
                  king={row.judah}
                  number={row.judah ? numbers.get(row.judah.id) : undefined}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              )}
              {showIsrael && (
                <Cell
                  king={row.israel}
                  number={row.israel ? numbers.get(row.israel.id) : undefined}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              )}
            </li>
          )
        })}
      </ol>

      {!showJudah && !showIsrael && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Activa Judá o Israel para ver la sucesión.
        </p>
      )}
    </div>
  )
}

function ColumnHeader({ kingdom, note }: { kingdom: Column; note: string }) {
  const meta = kingdomMeta(kingdom)
  return (
    <div
      className="rounded-xl px-3 py-2 text-center text-white shadow-card"
      style={{ backgroundColor: meta.color }}
    >
      <p className="font-display text-base font-semibold">{meta.shortLabel}</p>
      <p className="text-[11px] opacity-85">{note}</p>
    </div>
  )
}

function Cell({
  king,
  number,
  selectedId,
  onSelect,
}: {
  king?: KingRecord
  number?: number
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (!king) {
    return <div className="mx-auto w-px self-stretch bg-border" aria-hidden />
  }
  const dynasty = DYNASTY_STARTS[king.id]
  return (
    <div className="min-w-0 space-y-1">
      {dynasty && (
        <p className="truncate px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {dynasty}
        </p>
      )}
      <SuccessionCard
        king={king}
        number={number}
        selected={selectedId === king.id}
        onSelect={onSelect}
      />
    </div>
  )
}

function SuccessionCard({
  king,
  number,
  label,
  selected,
  onSelect,
}: {
  king: KingRecord
  number?: number
  label?: string
  selected: boolean
  onSelect: (id: string) => void
}) {
  const meta = kingdomMeta(king.kingdom)
  const years = reignYears(king)
  return (
    <button
      type="button"
      onClick={() => onSelect(king.id)}
      aria-pressed={selected}
      className={cn(
        'flex w-full min-h-14 items-center gap-2.5 rounded-xl border bg-card px-2.5 py-2 text-left shadow-card transition-all',
        'hover:-translate-y-px hover:border-primary/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        selected && 'border-foreground ring-1 ring-foreground',
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: meta.color }}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums"
        style={{
          backgroundColor: `color-mix(in oklch, ${meta.color} 14%, transparent)`,
          color: meta.color,
        }}
      >
        {number != null ? `${number}º` : <Crown className="size-4" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-semibold">{king.name}</span>
          <StandGlyph stand={king.lordStand} />
        </span>
        <span className="block truncate text-[11px] text-muted-foreground tabular-nums">
          {label ? `${label} · ` : ''}
          {king.startBc}
          {king.endBc !== king.startBc ? `–${king.endBc}` : ''} ·{' '}
          {years ? `${years} años` : 'breve'}
        </span>
      </span>
    </button>
  )
}
