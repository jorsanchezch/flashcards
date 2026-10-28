import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  DYNASTY_STARTS,
  EXPLORER_END_BC,
  EXPLORER_START_BC,
  KEY_EVENTS,
  KINGS,
  formatReignSpan,
  kingById,
  kingdomMeta,
  kingsByKingdom,
  lordStandMeta,
  predecessorsOf,
  reignYears,
  successorsOf,
  type KingRecord,
  type KingdomId,
} from '@/lib/kingsTimeline'
import { cn } from '@/lib/utils'
import { StandGlyph } from './StandGlyph'

type Density = 'compact' | 'detailed'

const DENSITIES: { id: Density; label: string; pxPerYear: number; tick: number }[] = [
  { id: 'compact', label: 'Compacto', pxPerYear: 2, tick: 50 },
  { id: 'detailed', label: 'Detallado', pxPerYear: 3.6, tick: 25 },
]

const AXIS_PX = 40
const PAD_TOP = 18
const PAD_BOTTOM = 28
/** Where each column's line runs, from the column's left edge. */
const TRACK_PX = 16
const LANE_GAP_PX = 10
const NAME_LINE_PX = 18
const DYNASTY_LINE_PX = 13
/** Below this width the neighbors' column is dropped to keep names readable. */
const NEIGHBORS_MIN_PX = 560
/** Narrow columns drop the reign length so names stay whole. */
const ROOMY_COLUMN_PX = 170

const FOREIGN: KingdomId[] = ['aram', 'assyria', 'egypt']

type Column = {
  id: 'david' | 'israel' | 'neighbors'
  title: string
  color: string
  kings: KingRecord[]
}

type Mark = {
  king: KingRecord
  top: number
  height: number
  lane: number
  labelTop: number
  labelHeight: number
  dynasty?: string
}

/** Time runs down the page; labels that would collide slide down and get a leader line. */
function layoutColumn(kings: KingRecord[], pxPerYear: number) {
  const y = (year: number) => PAD_TOP + (EXPLORER_START_BC - year) * pxPerYear
  const sorted = [...kings].sort((a, b) => b.startBc - a.startBc || b.endBc - a.endBc)
  const laneEnds: number[] = []
  let labelBottom = -Infinity
  const marks: Mark[] = sorted.map((king) => {
    const top = y(king.startBc)
    const span = (king.startBc - king.endBc) * pxPerYear
    const height = Math.max(span, 6)
    // Pack by the true reign, so successors that take over the same year share a line.
    let lane = laneEnds.findIndex((end) => top >= end)
    if (lane < 0) {
      lane = laneEnds.length
      laneEnds.push(top + span)
    } else {
      laneEnds[lane] = top + span
    }
    const dynasty = DYNASTY_STARTS[king.id]
    const labelHeight = NAME_LINE_PX + (dynasty ? DYNASTY_LINE_PX : 0)
    // Line the name up with the station; a dynasty tag sits just above it.
    const wanted = top - NAME_LINE_PX / 2 - (dynasty ? DYNASTY_LINE_PX : 0)
    const labelTop = Math.max(wanted, labelBottom + 2)
    labelBottom = labelTop + labelHeight
    return { king, top, height, lane, labelTop, labelHeight, dynasty }
  })
  return { marks, lanes: Math.max(laneEnds.length, 1), bottom: labelBottom }
}

type VerticalTimelineProps = {
  visible: KingdomId[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Rendered at the start of the toolbar (the orientation switch). */
  toolbarStart?: ReactNode
}

export function VerticalTimeline({ visible, selectedId, onSelect, toolbarStart }: VerticalTimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const [density, setDensity] = useState<Density>('compact')
  const firstRender = useRef(true)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const scale = DENSITIES.find((d) => d.id === density)!
  const pxPerYear = scale.pxPerYear
  const y = (year: number) => PAD_TOP + (EXPLORER_START_BC - year) * pxPerYear

  const columns = useMemo(() => {
    const cols: Column[] = []
    const david = [
      ...(visible.includes('united') ? kingsByKingdom('united') : []),
      ...(visible.includes('judah') ? kingsByKingdom('judah') : []),
    ]
    if (david.length) {
      cols.push({
        id: 'david',
        title: visible.includes('judah') ? 'Judá' : 'Unida',
        color: kingdomMeta('judah').color,
        kings: david,
      })
    }
    if (visible.includes('israel')) {
      cols.push({
        id: 'israel',
        title: 'Israel',
        color: kingdomMeta('israel').color,
        kings: kingsByKingdom('israel'),
      })
    }
    const neighbors = KINGS.filter((k) => FOREIGN.includes(k.kingdom) && visible.includes(k.kingdom))
    if (neighbors.length && width >= NEIGHBORS_MIN_PX) {
      cols.push({ id: 'neighbors', title: 'Vecinos', color: 'var(--stand-foreign)', kings: neighbors })
    }
    return cols.map((col) => ({ ...col, ...layoutColumn(col.kings, pxPerYear) }))
  }, [visible, pxPerYear, width])

  const colWidth = columns.length ? (width - AXIS_PX) / columns.length : 0
  const colLeft = (i: number) => AXIS_PX + i * colWidth
  const roomy = colWidth >= ROOMY_COLUMN_PX
  const height =
    Math.max(y(EXPLORER_END_BC), ...columns.map((c) => c.bottom)) + PAD_BOTTOM

  const selected = kingById(selectedId)
  const related = useMemo(() => {
    if (!selected) return new Set<string>()
    return new Set([...predecessorsOf(selected), ...successorsOf(selected)].map((k) => k.id))
  }, [selected])

  // Follow the selection down the page, but not on first paint.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    rootRef.current
      ?.querySelector(`[data-king-label="${selectedId}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedId])

  const ticks: number[] = []
  for (let year = Math.floor(EXPLORER_START_BC / scale.tick) * scale.tick; year >= EXPLORER_END_BC; year -= scale.tick) {
    if (year <= EXPLORER_START_BC) ticks.push(year)
  }

  const davidIndex = columns.findIndex((c) => c.id === 'david')
  const israelIndex = columns.findIndex((c) => c.id === 'israel')
  const showBranch = davidIndex >= 0 && israelIndex >= 0 && visible.includes('united')

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {toolbarStart}
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5" role="group" aria-label="Densidad">
            {DENSITIES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDensity(d.id)}
                aria-pressed={density === d.id}
                className={cn(
                  'min-h-8 rounded-md px-2.5 text-xs font-medium transition-all',
                  density === d.id ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">El tiempo baja · el largo de cada tramo son sus años</p>
      </div>

      <div className="rounded-xl border bg-background/70">
        {/* Column headers stay in view while the timeline scrolls past. */}
        <div className="sticky top-16 z-20 flex rounded-t-xl border-b bg-card/95 backdrop-blur-sm" style={{ paddingLeft: AXIS_PX }}>
          {columns.map((col) => (
            <div key={col.id} className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-2 text-xs font-semibold">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: col.color }} aria-hidden />
              <span className="truncate">{col.title}</span>
              <span className="font-normal text-muted-foreground tabular-nums">{col.kings.length}</span>
            </div>
          ))}
        </div>

        <div ref={rootRef} className="relative" style={{ height }} aria-label="Línea de tiempo vertical de los reyes">
          {/* Year grid */}
          {ticks.map((year) => (
            <div key={year} className="absolute right-0 left-0" style={{ top: y(year) }} aria-hidden>
              <span className="absolute -translate-y-1/2 pl-2 text-[10px] text-muted-foreground tabular-nums" style={{ left: 0 }}>
                {year}
              </span>
              <span className="absolute right-0 border-t border-border/60" style={{ left: AXIS_PX }} />
            </div>
          ))}

          {/* Turning points */}
          {KEY_EVENTS.map((e) => (
            <div key={e.year} className="absolute right-0 left-0" style={{ top: y(e.year) }}>
              <span className="absolute right-0 border-t border-dashed border-gold" style={{ left: AXIS_PX - 6 }} aria-hidden />
              <span className="absolute -top-2 left-0 w-[40px] pl-1.5 text-[10px] leading-none font-bold text-gold-foreground tabular-nums dark:text-gold">
                {e.year}
              </span>
              {width >= NEIGHBORS_MIN_PX && (
                <span className="absolute right-1.5 -translate-y-full rounded-sm bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold-foreground dark:text-gold">
                  {e.short}
                </span>
              )}
            </div>
          ))}

          <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden>
            {/* Israel branches off Salomón's line at the division. */}
            {showBranch && (
              <path
                d={`M ${colLeft(davidIndex) + TRACK_PX} ${y(931) - 22} C ${colLeft(davidIndex) + TRACK_PX} ${y(931) - 4}, ${colLeft(israelIndex) + TRACK_PX} ${y(931) - 18}, ${colLeft(israelIndex) + TRACK_PX} ${y(931)}`}
                fill="none"
                stroke={kingdomMeta('israel').color}
                strokeWidth={3}
                strokeDasharray="4 3"
                opacity={0.7}
              />
            )}
            {/* Leader lines for names pushed below their station. */}
            {columns.map((col, ci) =>
              col.marks.map((m) => {
                const stationX = colLeft(ci) + TRACK_PX + m.lane * LANE_GAP_PX
                const labelX = colLeft(ci) + TRACK_PX + col.lanes * LANE_GAP_PX + 6
                const nameY = m.labelTop + m.labelHeight - NAME_LINE_PX / 2
                if (Math.abs(nameY - m.top) < 3) return null
                return (
                  <path
                    key={m.king.id}
                    d={`M ${stationX + 7} ${m.top} L ${labelX - 6} ${nameY} L ${labelX - 1} ${nameY}`}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                )
              }),
            )}
          </svg>

          {columns.map((col, ci) => (
            <div key={col.id} className="absolute top-0 bottom-0" style={{ left: colLeft(ci), width: colWidth }}>
              {/* The line itself, faint between reigns */}
              <span
                className="absolute w-0.5 rounded-full opacity-25"
                style={{
                  left: TRACK_PX - 1,
                  top: col.marks[0]?.top ?? 0,
                  bottom: PAD_BOTTOM,
                  backgroundColor: col.color,
                }}
                aria-hidden
              />
              {col.marks.map((m) => {
                const color = col.id === 'israel' ? col.color : kingdomMeta(m.king.kingdom).color
                const isSelected = m.king.id === selectedId
                const isRelated = related.has(m.king.id)
                const x = TRACK_PX + m.lane * LANE_GAP_PX
                const years = reignYears(m.king)
                // The column already names the kingdom, so narrow screens drop "(Judá)" and aliases.
                const shownName = roomy ? m.king.name : m.king.name.replace(/\s*\(.*\)$/, '')
                return (
                  <div key={m.king.id}>
                    <span
                      className={cn(
                        'absolute rounded-full transition-all',
                        isSelected ? 'w-2.5 shadow-[0_0_0_3px_var(--background),0_0_0_5px_var(--foreground)]' : 'w-1.5',
                        selectedId && !isSelected && !isRelated && 'opacity-60',
                      )}
                      style={{
                        left: x - (isSelected ? 5 : 3),
                        top: m.top,
                        height: m.height,
                        backgroundColor: color,
                      }}
                      aria-hidden
                    />
                    {/* Small stations stay readable when reigns start a few years apart. */}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      onClick={() => onSelect(m.king.id)}
                      className={cn(
                        'absolute size-2.5 rounded-full shadow-[0_0_0_2px_var(--background)] transition-transform hover:scale-150',
                        isRelated && 'shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--gold)]',
                        isSelected && 'scale-150',
                      )}
                      style={{
                        left: x - 5,
                        top: m.top - 5,
                        backgroundColor: lordStandMeta(m.king.lordStand)?.color ?? color,
                      }}
                    />
                    <button
                      type="button"
                      data-king-label={m.king.id}
                      onClick={() => onSelect(m.king.id)}
                      aria-pressed={isSelected}
                      aria-label={`${m.king.name}, ${formatReignSpan(m.king)}${
                        m.king.lordStand ? `, ${lordStandMeta(m.king.lordStand)!.shortLabel}` : ''
                      }`}
                      className={cn(
                        'absolute right-1 flex scroll-my-24 flex-col items-start rounded-md px-1 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                        isSelected && 'bg-primary/10',
                      )}
                      style={{ left: TRACK_PX + col.lanes * LANE_GAP_PX + 4, top: m.labelTop, height: m.labelHeight }}
                    >
                      {m.dynasty && (
                        <span className="w-full truncate text-[9px] leading-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                          {m.dynasty}
                        </span>
                      )}
                      <span className="flex w-full min-w-0 items-center gap-1 leading-[18px]">
                        <StandGlyph stand={m.king.lordStand} className="size-3.5 text-[9px]" />
                        <span
                          className={cn(
                            'truncate text-xs',
                            isSelected ? 'font-bold text-foreground' : 'font-semibold text-foreground/90',
                          )}
                        >
                          {shownName}
                        </span>
                        {roomy && (
                          <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {years ? `${years}a` : 'breve'}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {width < NEIGHBORS_MIN_PX && visible.some((k) => FOREIGN.includes(k)) && (
        <p className="text-[11px] text-muted-foreground">
          Los reyes vecinos se ven en pantallas más anchas o en la vista horizontal.
        </p>
      )}
    </div>
  )
}
