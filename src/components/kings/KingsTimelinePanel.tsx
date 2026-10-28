import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Crown, GraduationCap, Rows3, Search, Waypoints } from 'lucide-react'
import { MaterialRow } from '@/components/MaterialRow'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  DEFAULT_VISIBLE_KINGDOMS,
  KINGDOMS,
  KINGS,
  LORD_STANDS,
  kingById,
  kingsChronological,
  lordStandMeta,
  type KingdomId,
} from '@/lib/kingsTimeline'
import type { Flashcard } from '@/lib/parseFlashcard'
import { cn } from '@/lib/utils'
import { KingDetail } from './KingDetail'
import { KingStepper } from './KingStepper'
import { KingsPractice } from './KingsPractice'
import { StandGlyph } from './StandGlyph'
import { SuccessionView } from './SuccessionView'
import { TimelineExplorer } from './TimelineExplorer'

type Mode = 'explore' | 'succession' | 'practice'

const MODES: { id: Mode; label: string; icon: typeof Crown }[] = [
  { id: 'explore', label: 'Explorar', icon: Waypoints },
  { id: 'succession', label: 'Sucesión', icon: Rows3 },
  { id: 'practice', label: 'Practicar', icon: GraduationCap },
]

const DESKTOP_QUERY = '(min-width: 1280px)'

function useIsDesktop() {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(DESKTOP_QUERY)
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
  )
}

type KingsTimelinePanelProps = {
  cards: Flashcard[]
  open: boolean
  onToggle: () => void
  onOpenCardInStudy?: (cardId: string) => void
}

export function KingsTimelinePanel({
  cards,
  open,
  onToggle,
  onOpenCardInStudy,
}: KingsTimelinePanelProps) {
  const [mode, setMode] = useState<Mode>('explore')
  const [visible, setVisible] = useState<KingdomId[]>(DEFAULT_VISIBLE_KINGDOMS)
  const [selectedId, setSelectedId] = useState<string | null>('solomon')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isDesktop = useIsDesktop()

  const chronological = useMemo(() => kingsChronological(), [])
  const selected = kingById(selectedId)

  const searchHits = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es')
    if (!q) return []
    return KINGS.filter((k) => k.name.toLocaleLowerCase('es').includes(q)).slice(0, 8)
  }, [query])

  /** Taps open the detail sheet on small screens; stepping through kings does not. */
  const selectKing = (id: string, { openSheet = true } = {}) => {
    setSelectedId(id)
    setQuery('')
    if (openSheet) setSheetOpen(true)
    const king = kingById(id)
    if (king && !visible.includes(king.kingdom)) {
      setVisible((cur) => [...cur, king.kingdom])
    }
  }

  const selectedIndex = chronological.findIndex((k) => k.id === selectedId)

  const stepKing = (dir: -1 | 1, openSheet = false) => {
    const next = chronological[selectedIndex + dir]
    if (next) selectKing(next.id, { openSheet })
  }

  // ←/→ walk the chronology; the timeline follows the selected reign.
  useEffect(() => {
    if (!open || mode === 'practice') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"], [role="menu"], [role="listbox"]')
      ) {
        return
      }
      event.preventDefault()
      stepKing(event.key === 'ArrowRight' ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const toggleKingdom = (id: KingdomId) => {
    setVisible((cur) => (cur.includes(id) ? cur.filter((k) => k !== id) : [...cur, id]))
  }

  const detail = selected && (
    <KingDetail
      key={selected.id}
      king={selected}
      cards={cards}
      onSelect={selectKing}
      onPrev={() => stepKing(-1, true)}
      onNext={() => stepKing(1, true)}
      onOpenCardInStudy={onOpenCardInStudy}
      onClose={isDesktop ? undefined : () => setSheetOpen(false)}
    />
  )

  return (
    <li>
      <MaterialRow
        icon={Crown}
        title="Reyes en 1–2 Reyes"
        subtitle="Línea de tiempo, sucesión y práctica (NTV)"
        open={open}
        onToggle={onToggle}
      />
      {open && (
        <section className="animate-fade-in mt-2 overflow-hidden rounded-2xl border bg-card shadow-card">
          <header className="space-y-3 border-b bg-gradient-to-b from-accent/40 to-transparent p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  Los reyes de Israel y Judá
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cronología convencional aproximada · {KINGS.length} gobernantes
                </p>
              </div>
              <div
                className="flex w-full rounded-xl bg-muted p-1 sm:inline-flex sm:w-auto"
                role="tablist"
                aria-label="Modo de estudio"
              >
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      'inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-all sm:flex-none sm:px-3',
                      mode === m.id
                        ? 'bg-card text-foreground shadow-card'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <m.icon className="size-4" aria-hidden />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {mode !== 'practice' && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative sm:w-64">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchHits[0]) selectKing(searchHits[0].id)
                      if (e.key === 'Escape') setQuery('')
                    }}
                    placeholder="Buscar rey o reina…"
                    className="min-h-10 bg-card pl-9"
                    aria-label="Buscar rey"
                  />
                  {searchHits.length > 0 && (
                    <ul
                      className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl border bg-popover p-1 shadow-raised"
                      role="listbox"
                    >
                      {searchHits.map((k) => (
                        <li key={k.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={false}
                            className="flex w-full min-h-10 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
                            onClick={() => selectKing(k.id)}
                          >
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor: KINGDOMS.find((x) => x.id === k.kingdom)?.color,
                              }}
                              aria-hidden
                            />
                            <span className="flex-1">{k.name}</span>
                            <StandGlyph stand={k.lordStand} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {KINGDOMS.map((k) => {
                    const on = visible.includes(k.id)
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggleKingdom(k.id)}
                        aria-pressed={on}
                        className={cn(
                          'inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all',
                          on
                            ? 'bg-card shadow-card'
                            : 'border-dashed bg-transparent text-muted-foreground',
                        )}
                      >
                        <span
                          className={cn('size-2.5 rounded-full transition-opacity', !on && 'opacity-35')}
                          style={{ backgroundColor: k.color }}
                          aria-hidden
                        />
                        {k.shortLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {mode !== 'practice' && (
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {LORD_STANDS.map((s) => (
                    <li key={s} className="inline-flex items-center gap-1">
                      <StandGlyph stand={s} className="size-3.5 text-[9px]" />
                      {lordStandMeta(s)!.shortLabel}
                    </li>
                  ))}
                  <li className="hidden sm:inline">· Evaluación según la fórmula del relato</li>
                </ul>
                <KingStepper
                  king={selected}
                  canPrev={selectedIndex > 0}
                  canNext={selectedIndex >= 0 && selectedIndex < chronological.length - 1}
                  onPrev={() => stepKing(-1)}
                  onNext={() => stepKing(1)}
                  onOpen={isDesktop ? undefined : () => setSheetOpen(true)}
                  className="w-full sm:w-72"
                />
              </div>
            )}
          </header>

          <div className="p-3 sm:p-4">
            {mode === 'practice' ? (
              <KingsPractice
                onSelect={(id) => {
                  setMode('explore')
                  selectKing(id)
                }}
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,400px)]">
                <div className="min-w-0">
                  {mode === 'explore' ? (
                    <TimelineExplorer
                      visible={visible}
                      selectedId={selectedId}
                      onSelect={selectKing}
                    />
                  ) : (
                    <SuccessionView
                      visible={visible}
                      selectedId={selectedId}
                      onSelect={selectKing}
                    />
                  )}
                </div>
                {isDesktop && (
                  <aside className="sticky top-4 max-h-[calc(100svh-2rem)] self-start overflow-y-auto scrollbar-thin">
                    {detail ?? (
                      <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Elige un reinado para ver su historia.
                      </p>
                    )}
                  </aside>
                )}
              </div>
            )}
          </div>

          <p className="border-t px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            Fechas aproximadas (cronología convencional) y edades cuando 1–2 Reyes las indica. La
            evaluación resume la fórmula del relato, no un comentario moderno.
          </p>
        </section>
      )}

      <Sheet
        open={open && !isDesktop && sheetOpen && !!detail && mode !== 'practice'}
        onOpenChange={setSheetOpen}
      >
        <SheetContent side="responsive" className="sm:p-3">
          <SheetTitle className="sr-only">Detalle de {selected?.name}</SheetTitle>
          {detail}
        </SheetContent>
      </Sheet>
    </li>
  )
}
