import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, GanttChart, ListTree, ZoomIn } from 'lucide-react'
import {
  EXPLORER_END_BC,
  EXPLORER_START_BC,
  KEY_EVENTS,
  KINGDOMS,
  axisTicks,
  formatReignSpan,
  kingById,
  kingsByKingdom,
  lordStandMeta,
  predecessorsOf,
  successorsOf,
  type KingRecord,
  type KingdomId,
} from '@/lib/kingsTimeline'
import { cn } from '@/lib/utils'
import { StandGlyph } from './StandGlyph'
import { VerticalTimeline } from './VerticalTimeline'

type Zoom = 'fit' | 'century' | 'decades'

const ZOOMS: { id: Zoom; label: string }[] = [
  { id: 'fit', label: 'Vista general' },
  { id: 'century', label: '100 años' },
  { id: 'decades', label: '50 años' },
]

const LABEL_COL_PX = 76
const LANE_PX = 30
const BAR_PX = 24
const MAX_LANES = 4
/** Room after the last reign for a name drawn beside its bar. */
const TRAILING_PX = 120
const SPAN_YEARS = EXPLORER_START_BC - EXPLORER_END_BC

type Placed = {
  king: KingRecord
  left: number
  width: number
  lane: number
  label: 'inside' | 'outside' | 'none'
}

function labelWidth(name: string) {
  return Math.ceil(name.length * 6.6 + 28)
}

/** Packs reigns into lanes; names go beside short bars until the lanes run out. */
function placeReigns(kings: KingRecord[], pxPerYear: number): Placed[] {
  const pack = (allowOutside: boolean) => {
    const laneEnds: number[] = []
    const placed: Placed[] = []
    const sorted = [...kings].sort((a, b) => b.startBc - a.startBc)
    for (const king of sorted) {
      const left = (EXPLORER_START_BC - king.startBc) * pxPerYear
      const width = Math.max((king.startBc - king.endBc) * pxPerYear, 6)
      const fits = width >= labelWidth(king.name)
      const label = fits ? 'inside' : allowOutside ? 'outside' : 'none'
      const end = label === 'outside' ? left + width + labelWidth(king.name) - 12 : left + width
      let lane = laneEnds.findIndex((e) => left >= e + 3)
      if (lane < 0) {
        lane = laneEnds.length
        laneEnds.push(end)
      } else {
        laneEnds[lane] = end
      }
      placed.push({ king, left, width, lane, label })
    }
    return { placed, lanes: laneEnds.length }
  }
  const withNames = pack(true)
  return withNames.lanes <= MAX_LANES ? withNames.placed : pack(false).placed
}

type TimelineExplorerProps = {
  visible: KingdomId[]
  selectedId: string | null
  onSelect: (id: string) => void
}

type Orientation = 'horizontal' | 'vertical'

const ORIENTATION_KEY = 'kings-timeline-orientation'

function initialOrientation(): Orientation {
  try {
    const saved = localStorage.getItem(ORIENTATION_KEY)
    if (saved === 'horizontal' || saved === 'vertical') return saved
  } catch {
    // Storage may be blocked; fall back to the vertical view.
  }
  return 'vertical'
}

/** The timeline in either direction, remembering the viewer's choice. */
export function TimelineExplorer(props: TimelineExplorerProps) {
  const [orientation, setOrientation] = useState<Orientation>(initialOrientation)
  const choose = (next: Orientation) => {
    setOrientation(next)
    try {
      localStorage.setItem(ORIENTATION_KEY, next)
    } catch {
      // Ignore: the choice just won't be remembered.
    }
  }
  const toggle = <OrientationToggle value={orientation} onChange={choose} />
  return orientation === 'vertical' ? (
    <VerticalTimeline {...props} toolbarStart={toggle} />
  ) : (
    <HorizontalTimeline {...props} toolbarStart={toggle} />
  )
}

function OrientationToggle({
  value,
  onChange,
}: {
  value: Orientation
  onChange: (next: Orientation) => void
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5" role="group" aria-label="Orientación de la línea de tiempo">
      {(
        [
          { id: 'vertical', label: 'Vertical', icon: ListTree },
          { id: 'horizontal', label: 'Horizontal', icon: GanttChart },
        ] as const
      ).map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn(
            'inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all',
            value === o.id ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <o.icon className="size-3.5" aria-hidden />
          {o.label}
        </button>
      ))}
    </div>
  )
}

function HorizontalTimeline({
  visible,
  selectedId,
  onSelect,
  toolbarStart,
}: TimelineExplorerProps & { toolbarStart?: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<Zoom>('century')
  const [viewportPx, setViewportPx] = useState(720)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const updateEdges = () => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const max = scroller.scrollWidth - scroller.clientWidth
    const next = { left: scroller.scrollLeft > 4, right: scroller.scrollLeft < max - 4 }
    setEdges((cur) => (cur.left === next.left && cur.right === next.right ? cur : next))
  }

  const pan = (dir: -1 | 1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: dir * scroller.clientWidth * 0.6, behavior: 'smooth' })
  }

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const observer = new ResizeObserver(([entry]) =>
      setViewportPx(entry.contentRect.width),
    )
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [])

  // Trackpads send horizontal swipes as wheel events; keep them in the chart.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      if (scroller.scrollWidth <= scroller.clientWidth) return
      event.preventDefault()
      scroller.scrollLeft += event.deltaX
    }
    scroller.addEventListener('wheel', onWheel, { passive: false })
    return () => scroller.removeEventListener('wheel', onWheel)
  }, [])

  const trackPx = useMemo(() => {
    const fit = Math.max(viewportPx - LABEL_COL_PX - 12, 240)
    if (zoom === 'fit') return fit
    const yearsOnScreen = zoom === 'century' ? 100 : 50
    return Math.max(fit, (SPAN_YEARS / yearsOnScreen) * fit)
  }, [viewportPx, zoom])
  const pxPerYear = trackPx / SPAN_YEARS
  const x = (year: number) => (EXPLORER_START_BC - year) * pxPerYear

  const rows = useMemo(
    () =>
      KINGDOMS.filter((k) => visible.includes(k.id)).map((k) => {
        const placed = placeReigns(kingsByKingdom(k.id), pxPerYear)
        const lanes = Math.max(1, ...placed.map((p) => p.lane + 1))
        return { kingdom: k, placed, lanes }
      }),
    [visible, pxPerYear],
  )

  const selected = kingById(selectedId)
  const related = useMemo(() => {
    if (!selected) return new Set<string>()
    return new Set([...predecessorsOf(selected), ...successorsOf(selected)].map((k) => k.id))
  }, [selected])

  // Bring the selected reign into view whenever it changes or the zoom changes.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !selected) return
    if (scroller.scrollWidth <= scroller.clientWidth) return
    const center = LABEL_COL_PX + x(selected.startBc) + ((selected.startBc - selected.endBc) * pxPerYear) / 2
    scroller.scrollTo({
      left: center - scroller.clientWidth / 2 + LABEL_COL_PX / 2,
      behavior: 'smooth',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, pxPerYear])

  // The chart's width changes with zoom and window size; recheck which arrows apply.
  useLayoutEffect(updateEdges, [trackPx, viewportPx])

  const hovered = kingById(hoverId) ?? selected
  const tickStep = pxPerYear * 25 > 70 ? 25 : pxPerYear * 50 > 70 ? 50 : 100

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {toolbarStart}
          <div
            className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5"
            role="group"
            aria-label="Zoom de la línea de tiempo"
          >
            <ZoomIn className="mx-1.5 size-3.5 text-muted-foreground" aria-hidden />
            {ZOOMS.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setZoom(z.id)}
                aria-pressed={zoom === z.id}
                className={cn(
                  'min-h-8 rounded-md px-2.5 text-xs font-medium transition-all',
                  zoom === z.id
                    ? 'bg-card text-foreground shadow-card'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
        <p className="hidden text-[11px] text-muted-foreground sm:block">
          <kbd className="rounded border bg-muted px-1 font-sans">←</kbd>{' '}
          <kbd className="rounded border bg-muted px-1 font-sans">→</kbd> recorren los reyes
        </p>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          className="scrollbar-thin relative overflow-x-auto overscroll-x-contain rounded-xl border bg-background/70"
          aria-label="Línea de tiempo de los reyes"
        >
          <div className="relative" style={{ width: LABEL_COL_PX + trackPx + TRAILING_PX }}>
            {/* Axis */}
            <div className="relative z-10 flex h-9 border-b bg-card/90">
              <div
                className="sticky left-0 z-20 flex shrink-0 items-end border-r bg-card/95 px-2 pb-1.5 text-[10px] text-muted-foreground"
                style={{ width: LABEL_COL_PX }}
              >
                a. C.
              </div>
              <div className="relative flex-1">
                {axisTicks(tickStep).map((year) => (
                  <span
                    key={year}
                    className="absolute bottom-1.5 -translate-x-1/2 text-[10px] text-muted-foreground tabular-nums"
                    style={{ left: x(year) }}
                  >
                    {year}
                  </span>
                ))}
              </div>
            </div>

            {/* Key events: vertical guides through every row */}
            <div
              className="pointer-events-none absolute top-0 bottom-0"
              style={{ left: LABEL_COL_PX }}
              aria-hidden
            >
              {KEY_EVENTS.map((e) => (
                <div
                  key={e.year}
                  className="absolute top-9 bottom-0 border-l border-dashed border-gold"
                  style={{ left: x(e.year) }}
                />
              ))}
            </div>

            {rows.map(({ kingdom, placed, lanes }) => (
              <div key={kingdom.id} className="flex border-b last:border-b-0">
                <div
                  className="sticky left-0 z-20 flex shrink-0 items-center gap-1.5 border-r bg-card px-2 text-xs font-medium"
                  style={{ width: LABEL_COL_PX }}
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: kingdom.color }}
                    aria-hidden
                  />
                  <span className="truncate">{kingdom.shortLabel}</span>
                </div>
                <ul
                  className="relative flex-1"
                  style={{ height: lanes * LANE_PX + 8 }}
                  aria-label={`Reinados de ${kingdom.label}`}
                >
                  {placed.map((p) => {
                    const isSelected = p.king.id === selectedId
                    const isRelated = related.has(p.king.id)
                    const stand = lordStandMeta(p.king.lordStand)
                    return (
                      <li
                        key={p.king.id}
                        className="absolute"
                        style={{ left: p.left, top: p.lane * LANE_PX + 6 }}
                      >
                        <button
                          type="button"
                          data-king={p.king.id}
                          onClick={() => onSelect(p.king.id)}
                          onMouseEnter={() => setHoverId(p.king.id)}
                          onMouseLeave={() => setHoverId(null)}
                          onFocus={() => setHoverId(p.king.id)}
                          onBlur={() => setHoverId(null)}
                          aria-pressed={isSelected}
                          aria-label={`${p.king.name}, ${formatReignSpan(p.king)}${stand ? `, ${stand.shortLabel}` : ''}`}
                          className="group flex items-center rounded-md focus-visible:outline-none"
                          style={{ height: BAR_PX }}
                        >
                          <span
                            className={cn(
                              'flex h-full items-center gap-1 overflow-hidden rounded-md px-1 text-[11px] font-semibold whitespace-nowrap text-white transition-all',
                              'group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-ring',
                              isSelected && 'ring-2 ring-foreground ring-offset-1 ring-offset-background',
                              isRelated && !isSelected && 'ring-2 ring-gold',
                              // Desaturate rather than fade, so names on other bars stay readable.
                            selectedId && !isSelected && !isRelated && 'saturate-[.55]',
                            )}
                            style={{
                              width: p.width,
                              backgroundColor: kingdom.color,
                            }}
                          >
                            {p.width >= 18 && (
                              <StandGlyph
                                stand={p.king.lordStand}
                                className="size-3.5 bg-white/25 ring-1 ring-white/40"
                              />
                            )}
                            {p.label === 'inside' && <span className="truncate">{p.king.name}</span>}
                          </span>
                          {p.label === 'outside' && (
                            <span
                              className={cn(
                                'ml-1 text-[11px] font-medium whitespace-nowrap text-foreground/80',
                                isSelected && 'font-semibold text-foreground',
                              )}
                            >
                              {p.king.name}
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {edges.left && (
          <PanButton side="left" onClick={() => pan(-1)} />
        )}
        {edges.right && (
          <PanButton side="right" onClick={() => pan(1)} />
        )}
      </div>

      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <p className="flex min-w-0 items-center gap-1.5 text-muted-foreground" aria-live="polite">
          {hovered ? (
            <>
              <StandGlyph stand={hovered.lordStand} />
              <span className="font-semibold text-foreground">{hovered.name}</span>
              <span className="tabular-nums">· {formatReignSpan(hovered)}</span>
            </>
          ) : (
            'Toca un reinado para ver su historia.'
          )}
        </p>
        <p className="flex flex-wrap gap-x-3 text-muted-foreground">
          {KEY_EVENTS.map((e) => (
            <span key={e.year} className="inline-flex items-center gap-1">
              <span className="h-3 border-l border-dashed border-gold" aria-hidden />
              {e.year} {e.short}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

function PanButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Ver años anteriores' : 'Ver años posteriores'}
      className={cn(
        'animate-fade-in absolute top-1/2 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-card/95 text-foreground shadow-raised backdrop-blur-sm transition-all',
        'hover:scale-105 hover:border-primary/40 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95',
      )}
      style={side === 'left' ? { left: LABEL_COL_PX + 8 } : { right: 8 }}
    >
      <Icon className="size-5" />
    </button>
  )
}
