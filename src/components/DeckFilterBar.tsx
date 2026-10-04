import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Shuffle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGlossary } from '@/context/GlossaryContext'
import {
  applyDeckGroupings,
  canonicalIds,
  getBookRange,
  getCardIdsGrouping,
  getGlossaryTermIds,
  hasActiveFilters,
  setBookRangeGrouping,
  setGlossaryTermIds,
  toggleGlossaryTerm,
  type DeckGrouping,
} from '@/lib/deckFilter'
import { bookSortKey } from '@/lib/biblical'
import type { Flashcard } from '@/lib/parseFlashcard'
import { shuffleIdsFresh } from '@/lib/shuffle'
import {
  groupingsPatch,
  shuffleConfigPatch,
  stopShuffleConfigPatch,
  type UserConfig,
} from '@/lib/userData'
import { cn } from '@/lib/utils'

type DeckFilterBarProps = {
  cards: Flashcard[]
  config: UserConfig
  onPatch: (patch: Partial<UserConfig>) => void
}

function keepPageScroll(e: React.MouseEvent) {
  e.preventDefault()
}

export function DeckFilterBar({ cards, config, onPatch }: DeckFilterBarProps) {
  const { entries, matchers } = useGlossary()
  const [glossaryQuery, setGlossaryQuery] = useState('')
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const glossaryBox = useRef<HTMLDivElement>(null)

  const books = useMemo(() => {
    const map = new Map<string, { label: string; canonIndex: number; chapters: number[] }>()
    for (const card of cards) {
      let row = map.get(card.bookId)
      if (!row) {
        row = { label: card.bookLabel, canonIndex: card.canonIndex, chapters: [] }
        map.set(card.bookId, row)
      }
      if (!row.chapters.includes(card.chapter)) row.chapters.push(card.chapter)
    }
    return [...map.entries()]
      .map(([id, meta]) => ({
        id,
        ...meta,
        chapters: meta.chapters.sort((a, b) => a - b),
      }))
      .sort(
        (a, b) =>
          bookSortKey(a.id, a.canonIndex) - bookSortKey(b.id, b.canonIndex),
      )
  }, [cards])

  const bookRange = getBookRange(config.groupings)
  const glossaryIds = getGlossaryTermIds(config.groupings)
  const cardGroup = getCardIdsGrouping(config.groupings)
  const selectedBook = books.find((b) => b.id === bookRange?.bookId) ?? null
  const chapters = selectedBook?.chapters ?? []

  const filtered = useMemo(
    () => applyDeckGroupings(cards, config.groupings, matchers),
    [cards, config.groupings, matchers],
  )

  const glossarySelected = entries.filter((e) => glossaryIds.includes(e.id))
  const q = glossaryQuery.trim().toLocaleLowerCase('es')
  const glossaryChoices = entries.filter((e) => {
    if (glossaryIds.includes(e.id)) return false
    if (!q) return true
    return (
      e.term.toLocaleLowerCase('es').includes(q) ||
      e.aliases.some((a) => a.toLocaleLowerCase('es').includes(q))
    )
  })

  useEffect(() => {
    if (!glossaryOpen) return
    const onPointer = (event: PointerEvent) => {
      if (!glossaryBox.current?.contains(event.target as Node)) {
        setGlossaryOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [glossaryOpen])

  const patchGroupings = (groupings: DeckGrouping[]) => {
    onPatch(groupingsPatch(config, groupings))
  }

  const parseChapter = (raw: string): number | null => {
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const shuffleNow = () => {
    const ids = shuffleIdsFresh(
      canonicalIds(filtered),
      config.studySessionOrder,
    )
    onPatch(shuffleConfigPatch(config, ids, 0))
  }

  const stopShuffle = () => {
    onPatch(stopShuffleConfigPatch(config, canonicalIds(filtered)))
  }

  const addGlossaryTerm = (termId: string) => {
    patchGroupings(
      setGlossaryTermIds(config.groupings, [...glossaryIds, termId]),
    )
    setGlossaryQuery('')
    setGlossaryOpen(false)
  }

  const filtersOn = hasActiveFilters(config.groupings) || config.shuffle

  return (
    <div className="rounded-xl border bg-card/50 p-4 [overflow-anchor:none]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Filtros</p>
        <div className="flex flex-wrap items-center gap-2">
          <ShuffleControl
            shuffle={config.shuffle}
            disabled={filtered.length <= 1}
            onStart={shuffleNow}
            onStop={stopShuffle}
            onReshuffle={shuffleNow}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11"
            disabled={!filtersOn}
            onMouseDown={keepPageScroll}
            onClick={() => onPatch(groupingsPatch(config, []))}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {filtered.length} tarjetas con estos filtros
      </p>

      {cardGroup && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span>
            Grupo:{' '}
            <strong>{cardGroup.label ?? `${cardGroup.ids.length} tarjetas`}</strong>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onMouseDown={keepPageScroll}
            onClick={() =>
              patchGroupings(
                config.groupings.filter((g) => g.kind !== 'card-ids'),
              )
            }
          >
            Quitar grupo
          </Button>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Libro</p>
        <div className="flex flex-wrap gap-2">
          <Badge
            asChild
            variant={!bookRange ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button
              type="button"
              onMouseDown={keepPageScroll}
              onClick={() =>
                patchGroupings(
                  setBookRangeGrouping(config.groupings, null, null, null),
                )
              }
            >
              Todos
            </button>
          </Badge>
          {books.map((book) => (
            <Badge
              key={book.id}
              asChild
              variant={bookRange?.bookId === book.id ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              <button
                type="button"
                onMouseDown={keepPageScroll}
                onClick={() =>
                  patchGroupings(
                    setBookRangeGrouping(
                      config.groupings,
                      book.id,
                      null,
                      null,
                    ),
                  )
                }
              >
                {book.label}
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {selectedBook && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="filter-from" className="text-xs">
              Desde capítulo
            </Label>
            <Input
              id="filter-from"
              type="number"
              min={chapters[0] ?? 1}
              max={chapters.at(-1)}
              className="mt-1 h-11 w-24"
              placeholder={String(chapters[0] ?? 1)}
              value={bookRange?.from ?? ''}
              onChange={(e) =>
                patchGroupings(
                  setBookRangeGrouping(
                    config.groupings,
                    selectedBook.id,
                    parseChapter(e.target.value),
                    bookRange?.to ?? null,
                  ),
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="filter-to" className="text-xs">
              Hasta capítulo
            </Label>
            <Input
              id="filter-to"
              type="number"
              min={chapters[0] ?? 1}
              max={chapters.at(-1)}
              className="mt-1 h-11 w-24"
              placeholder={String(chapters.at(-1) ?? '')}
              value={bookRange?.to ?? ''}
              onChange={(e) =>
                patchGroupings(
                  setBookRangeGrouping(
                    config.groupings,
                    selectedBook.id,
                    bookRange?.from ?? null,
                    parseChapter(e.target.value),
                  ),
                )
              }
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Palabras del glosario
        </p>
        {glossarySelected.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {glossarySelected.map((entry) => (
              <Badge key={entry.id} variant="default" className="gap-1 pr-1">
                {entry.term}
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-primary-foreground/20"
                  aria-label={`Quitar ${entry.term}`}
                  onMouseDown={keepPageScroll}
                  onClick={() =>
                    patchGroupings(
                      toggleGlossaryTerm(config.groupings, entry.id),
                    )
                  }
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="relative" ref={glossaryBox}>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={glossaryQuery}
            onChange={(e) => {
              setGlossaryQuery(e.target.value)
              setGlossaryOpen(true)
            }}
            onFocus={() => setGlossaryOpen(true)}
            placeholder="Buscar y añadir una palabra…"
            className="h-11 pl-9"
            aria-label="Buscar palabra del glosario"
            aria-expanded={glossaryOpen}
            aria-controls="glossary-filter-list"
          />
          {glossaryOpen && (
            <ul
              id="glossary-filter-list"
              className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-popover p-1 shadow-md"
            >
              {glossaryChoices.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {q
                    ? 'Ninguna palabra coincide.'
                    : 'Todas las palabras ya están en el filtro.'}
                </li>
              ) : (
                glossaryChoices.slice(0, 40).map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm hover:bg-accent/50"
                      onMouseDown={keepPageScroll}
                      onClick={() => addGlossaryTerm(entry.id)}
                    >
                      <span>{entry.term}</span>
                      <span className="text-xs text-muted-foreground">
                        Añadir
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export function ShuffleControl({
  shuffle,
  disabled,
  onStart,
  onStop,
  onReshuffle,
}: {
  shuffle: boolean
  disabled?: boolean
  onStart: () => void
  onStop: () => void
  onReshuffle: () => void
}) {
  if (!shuffle) {
    return (
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={disabled}
        onMouseDown={keepPageScroll}
        onClick={onStart}
      >
        <Shuffle className="size-4" />
        Mezclar
      </Button>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex h-11 min-h-11 overflow-hidden rounded-md border bg-background',
        disabled && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center border-r hover:bg-accent"
        aria-label="Dejar de mezclar"
        disabled={disabled}
        onMouseDown={keepPageScroll}
        onClick={onStop}
      >
        <X className="size-4" />
      </button>
      <button
        type="button"
        className="flex h-11 min-w-11 items-center justify-center gap-1 px-2 hover:bg-accent"
        aria-label="Mezclar de nuevo"
        title="Mezclar de nuevo"
        disabled={disabled}
        onMouseDown={keepPageScroll}
        onClick={onReshuffle}
      >
        <Shuffle className="size-4" />
      </button>
    </div>
  )
}
