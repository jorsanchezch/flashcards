import { useEffect, useMemo, useState } from 'react'
import {
  CheckSquare,
  Pencil,
  Plus,
  Search,
  Square,
  Trash2,
} from 'lucide-react'
import type { Flashcard } from '@/lib/parseFlashcard'
import { bookSortKey } from '@/lib/biblical'
import { DeckSessionPrompt } from '@/components/DeckSessionPrompt'
import { UserPickerView } from '@/components/UserPickerView'
import { useUser } from '@/context/UserContext'
import { getCardStatus, getReviewHistory } from '@/lib/progress'
import { cardsInBookChapterRange } from '@/lib/studyPool'
import { isBuiltInCardEdited } from '@/lib/userData'
import { CardEditorDialog } from '@/components/CardEditorDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const BULK_CONFIRM_MIN = 15

type BrowseViewProps = {
  cards: Flashcard[]
  baseCards: Flashcard[]
  suggestedUserId?: string | null
  onSelectCard: (id: string) => void
  onStartStudyGroup?: () => void
}

type BookGroup = {
  bookId: string
  bookLabel: string
  canonIndex: number
  chapters: { chapter: number; cards: Flashcard[] }[]
}

function buildBookGroups(list: Flashcard[]): BookGroup[] {
  const byBook = new Map<string, BookGroup>()

  for (const card of list) {
    let group = byBook.get(card.bookId)
    if (!group) {
      group = {
        bookId: card.bookId,
        bookLabel: card.bookLabel,
        canonIndex: card.canonIndex,
        chapters: [],
      }
      byBook.set(card.bookId, group)
    }
    let chapterGroup = group.chapters.find((c) => c.chapter === card.chapter)
    if (!chapterGroup) {
      chapterGroup = { chapter: card.chapter, cards: [] }
      group.chapters.push(chapterGroup)
    }
    chapterGroup.cards.push(card)
  }

  const books = [...byBook.values()].sort(
    (a, b) =>
      bookSortKey(a.bookId, a.canonIndex) -
      bookSortKey(b.bookId, b.canonIndex),
  )

  for (const book of books) {
    book.chapters.sort((a, b) => a.chapter - b.chapter)
    for (const ch of book.chapters) {
      ch.cards.sort((a, b) => a.question.localeCompare(b.question, 'es'))
    }
  }

  return books
}

function bookIdFromLabel(cards: Flashcard[], label: string | null): string {
  if (!label) return 'all'
  const match = cards.find((c) => c.bookLabel === label)
  return match?.bookId ?? 'all'
}

export function BrowseView({
  cards,
  baseCards,
  suggestedUserId,
  onSelectCard,
  onStartStudyGroup,
}: BrowseViewProps) {
  const {
    roster,
    userDoc,
    patchConfig,
    saveCardContent,
    revertCardContent,
    addCustomCard,
    removeCardFromDeck,
    markManyReviewed,
    setStudyGroup,
    clearStudyGroup,
    continueAsGuest,
    selectUser,
  } = useUser()
  const [query, setQuery] = useState('')
  const [bookFilter, setBookFilter] = useState<string>('all')
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>('all')
  const [filtersReady, setFiltersReady] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add')
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Flashcard | null>(null)
  const [sessionPromptOpen, setSessionPromptOpen] = useState(false)
  const [showIdentifyPicker, setShowIdentifyPicker] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [bulkConfirm, setBulkConfirm] = useState<{
    title: string
    detail: string
    onConfirm: () => void
  } | null>(null)

  const baseCardMap = useMemo(
    () => new Map(baseCards.map((c) => [c.id, c])),
    [baseCards],
  )

  useEffect(() => {
    if (!userDoc || !pendingAction) return
    pendingAction()
    setPendingAction(null)
    setSessionPromptOpen(false)
    setShowIdentifyPicker(false)
  }, [userDoc, pendingAction])

  const requireSession = (action: () => void) => {
    if (userDoc) {
      action()
      return
    }
    setPendingAction(() => action)
    setSessionPromptOpen(true)
  }

  useEffect(() => {
    if (!userDoc || filtersReady) return
    const bookId = bookIdFromLabel(cards, userDoc.config.lastBook)
    setBookFilter(bookId)
    const ch = userDoc.config.lastChapter
    setChapterFilter(
      bookId !== 'all' && ch != null ? ch : 'all',
    )
    setFiltersReady(true)
  }, [userDoc, cards, filtersReady])

  useEffect(() => {
    setFiltersReady(false)
  }, [userDoc?.userId])

  const booksInDeck = useMemo(() => {
    const map = new Map<string, { label: string; canonIndex: number }>()
    for (const c of cards) {
      map.set(c.bookId, { label: c.bookLabel, canonIndex: c.canonIndex })
    }
    return [...map.entries()]
      .map(([id, meta]) => ({ id, ...meta }))
      .sort(
        (a, b) =>
          bookSortKey(a.id, a.canonIndex) - bookSortKey(b.id, b.canonIndex),
      )
  }, [cards])

  const chaptersForBook = useMemo(() => {
    if (bookFilter === 'all') return []
    const set = new Set<number>()
    for (const c of cards) {
      if (c.bookId === bookFilter) set.add(c.chapter)
    }
    return [...set].sort((a, b) => a - b)
  }, [cards, bookFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter((c) => {
      if (bookFilter !== 'all' && c.bookId !== bookFilter) return false
      if (chapterFilter !== 'all' && c.chapter !== chapterFilter) return false
      if (!q) return true
      return (
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q) ||
        c.bookLabel.toLowerCase().includes(q) ||
        c.chapterTitle.toLowerCase().includes(q) ||
        String(c.chapter).includes(q)
      )
    })
  }, [cards, query, bookFilter, chapterFilter])

  const grouped = useMemo(() => buildBookGroups(filtered), [filtered])

  const knownCount = userDoc
    ? cards.filter((c) => getCardStatus(userDoc, c.id) === 'known').length
    : 0

  const persistBrowseFilters = (bookId: string, chapter: number | 'all') => {
    if (!userDoc) return
    if (bookId === 'all') {
      patchConfig({ lastBook: null, lastChapter: null })
      return
    }
    const label = booksInDeck.find((b) => b.id === bookId)?.label ?? null
    patchConfig({
      lastBook: label,
      lastChapter: chapter === 'all' ? null : chapter,
    })
  }

  const selectBook = (bookId: string) => {
    setBookFilter(bookId)
    setChapterFilter('all')
    persistBrowseFilters(bookId, 'all')
  }

  const selectChapter = (ch: number | 'all') => {
    setChapterFilter(ch)
    persistBrowseFilters(bookFilter, ch)
  }

  const editorDefaults = useMemo(() => {
    const bookId = bookFilter === 'all' ? '1-samuel' : bookFilter
    const chapter =
      chapterFilter === 'all'
        ? cards.find((c) => c.bookId === bookId)?.chapter ?? 1
        : chapterFilter
    return { bookId, chapter }
  }, [bookFilter, chapterFilter, cards])

  const openAdd = () => {
    requireSession(() => {
      setEditorMode('add')
      setEditingCard(null)
      setEditorOpen(true)
    })
  }

  const openEdit = (card: Flashcard) => {
    requireSession(() => {
      setEditorMode('edit')
      setEditingCard(card)
      setEditorOpen(true)
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    removeCardFromDeck(deleteTarget.id)
    setDeleteTarget(null)
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filtered.map((c) => c.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const runBulkReviewed = (ids: string[], contextLabel: string) => {
    if (!ids.length) return
    const run = () => {
      markManyReviewed(ids)
      setBulkConfirm(null)
    }
    if (ids.length >= BULK_CONFIRM_MIN) {
      setBulkConfirm({
        title: `¿Marcar ${ids.length} tarjetas como revisadas?`,
        detail: contextLabel,
        onConfirm: run,
      })
      return
    }
    run()
  }

  const parseRangeChapter = (value: string): number | null => {
    const n = Number.parseInt(value, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const rangeCards = useMemo(() => {
    if (bookFilter === 'all') return []
    const from = parseRangeChapter(rangeFrom)
    const to = parseRangeChapter(rangeTo)
    if (from == null || to == null) return []
    const lo = Math.min(from, to)
    const hi = Math.max(from, to)
    return cardsInBookChapterRange(cards, bookFilter, lo, hi)
  }, [cards, bookFilter, rangeFrom, rangeTo])

  const bookLabel =
    booksInDeck.find((b) => b.id === bookFilter)?.label ?? 'Libro'

  const startStudyGroup = (pool: Flashcard[], label: string) => {
    if (!pool.length) return
    requireSession(() => {
      setStudyGroup(pool.map((c) => c.id), label)
      setSelectionMode(false)
      clearSelection()
      onStartStudyGroup?.()
    })
  }

  const markRangeReviewed = () => {
    requireSession(() => {
      runBulkReviewed(
        rangeCards.map((c) => c.id),
        `${bookLabel}, capítulos ${rangeFrom}–${rangeTo}.`,
      )
    })
  }

  const markSelectionReviewed = () => {
    requireSession(() => {
      runBulkReviewed(
        [...selectedIds],
        'Solo las tarjetas que marcaste en la lista.',
      )
    })
  }

  const studySelected = () => {
    const pool = filtered.filter((c) => selectedIds.has(c.id))
    startStudyGroup(
      pool,
      pool.length === 1
        ? '1 tarjeta elegida'
        : `${pool.length} tarjetas elegidas`,
    )
  }

  const studyRange = () => {
    startStudyGroup(
      rangeCards,
      `${bookLabel} · cap. ${rangeFrom}–${rangeTo}`,
    )
  }

  const hasStudyGroup = Boolean(userDoc?.config.studyGroupCardIds?.length)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Explorar tarjetas
        </h2>
        <p className="text-sm text-muted-foreground">
          {cards.length} tarjetas
          {userDoc && (
            <>
              {' '}
              · {knownCount} conocidas para {userDoc.displayName}
            </>
          )}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          Añadir tarjeta
        </Button>
        <Button
          type="button"
          size="sm"
          variant={selectionMode ? 'default' : 'outline'}
          onClick={() => {
            setSelectionMode((v) => !v)
            clearSelection()
          }}
        >
          {selectionMode ? (
            <CheckSquare className="size-4" />
          ) : (
            <Square className="size-4" />
          )}
          {selectionMode ? 'Selección activa' : 'Elegir varias'}
        </Button>
        {selectionMode && (
          <>
            <Button type="button" size="sm" variant="outline" onClick={selectAllFiltered}>
              Todas las visibles ({filtered.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              disabled={selectedIds.size === 0}
            >
              Limpiar ({selectedIds.size})
            </Button>
          </>
        )}
      </div>

      {selectionMode && selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border bg-muted/30 p-3">
          <Button type="button" size="sm" onClick={markSelectionReviewed}>
            Marcar {selectedIds.size} como revisadas
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={studySelected}>
            Estudiar esta selección
          </Button>
        </div>
      )}

      {bookFilter !== 'all' && (
        <div className="mb-6 rounded-xl border bg-card/50 p-4">
          <p className="mb-2 text-sm font-medium">Rango por capítulo</p>
          <p className="mb-3 text-xs text-muted-foreground">
            En {bookLabel}: marca como revisadas o arma un grupo de estudio.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">Desde cap.</Label>
              <Input
                type="number"
                min={1}
                className="mt-1 w-24"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Hasta cap.</Label>
              <Input
                type="number"
                min={1}
                className="mt-1 w-24"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
              />
            </div>
          </div>
          {rangeCards.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={markRangeReviewed}>
                Revisadas · {rangeCards.length} tarjetas
              </Button>
              <Button type="button" size="sm" onClick={studyRange}>
                Estudiar cap. {rangeFrom}–{rangeTo}
              </Button>
            </div>
          )}
        </div>
      )}

      {hasStudyGroup && userDoc?.config.studyGroupLabel && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span>
            Grupo activo en Estudiar:{' '}
            <strong>{userDoc.config.studyGroupLabel}</strong>
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => requireSession(() => clearStudyGroup())}
          >
            Quitar grupo
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-9"
            placeholder="Buscar pregunta, respuesta, libro o capítulo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar tarjetas"
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Libro</p>
        <div className="flex flex-wrap gap-2">
          <Badge
            asChild
            variant={bookFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button type="button" onClick={() => selectBook('all')}>
              Todos
            </button>
          </Badge>
          {booksInDeck.map((book) => (
            <Badge
              key={book.id}
              asChild
              variant={bookFilter === book.id ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              <button type="button" onClick={() => selectBook(book.id)}>
                {book.label}
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {bookFilter !== 'all' && chaptersForBook.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Capítulo
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge
              asChild
              variant={chapterFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              <button type="button" onClick={() => selectChapter('all')}>
                Todos
              </button>
            </Badge>
            {chaptersForBook.map((ch) => (
              <Badge
                key={ch}
                asChild
                variant={chapterFilter === ch ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                <button type="button" onClick={() => selectChapter(ch)}>
                  {ch}
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {bookFilter === 'all' && <div className="mb-6" />}

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin resultados</CardTitle>
            <CardDescription>
              No hay tarjetas con estos filtros. Prueba otra búsqueda o elige
              otro libro o capítulo.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((book) => (
            <section key={book.bookId}>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold tracking-tight">
                {book.bookLabel}
              </h3>
              <div className="flex flex-col gap-6">
                {book.chapters.map((ch) => (
                  <div key={`${book.bookId}-${ch.chapter}`}>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      Capítulo {ch.chapter}
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {ch.cards.map((card) => {
                        const st = userDoc
                          ? getCardStatus(userDoc, card.id)
                          : undefined
                        const reviews = userDoc
                          ? getReviewHistory(userDoc, card.id)
                          : []
                        return (
                          <li key={card.id}>
                            <div className="flex gap-2 rounded-xl border bg-card p-2">
                              {selectionMode && (
                                <button
                                  type="button"
                                  className="flex shrink-0 items-start px-1 pt-3"
                                  aria-label={
                                    selectedIds.has(card.id)
                                      ? 'Quitar de la selección'
                                      : 'Añadir a la selección'
                                  }
                                  onClick={() => toggleSelected(card.id)}
                                >
                                  {selectedIds.has(card.id) ? (
                                    <CheckSquare className="size-5 text-primary" />
                                  ) : (
                                    <Square className="size-5 text-muted-foreground" />
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectionMode) {
                                    toggleSelected(card.id)
                                    return
                                  }
                                  onSelectCard(card.id)
                                }}
                                className="min-w-0 flex-1 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/40"
                              >
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {card.bookLabel} {card.chapter}
                                  </span>
                                  {card.id.startsWith('custom/') && (
                                    <Badge variant="outline" className="text-[10px]">
                                      Añadida por ti
                                    </Badge>
                                  )}
                                  {userDoc &&
                                    isBuiltInCardEdited(userDoc, card.id) && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px]"
                                      >
                                        Editada
                                      </Badge>
                                    )}
                                  {st === 'known' && (
                                    <Badge className="bg-sky-600 text-white text-[10px]">
                                      La sé
                                    </Badge>
                                  )}
                                  {(st === 'reviewed' || reviews.length > 0) && (
                                    <Badge className="bg-emerald-600 text-white text-[10px]">
                                      Revisada
                                      {reviews.length > 0 && ` · ${reviews.length}`}
                                    </Badge>
                                  )}
                                  {st === 'unknown' && (
                                    <Badge
                                      variant="destructive"
                                      className="text-[10px]"
                                    >
                                      Repasar
                                    </Badge>
                                  )}
                                </div>
                                <p className="line-clamp-2 text-sm font-medium">
                                  {card.question}
                                </p>
                              </button>
                              <div className="flex shrink-0 flex-col gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  aria-label="Editar tarjeta"
                                  onClick={() => openEdit(card)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  aria-label="Quitar del mazo"
                                  onClick={() =>
                                    requireSession(() => setDeleteTarget(card))
                                  }
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <CardEditorDialog
        mode={editorMode}
        open={editorOpen}
        initialQuestion={editingCard?.question ?? ''}
        initialAnswer={editingCard?.answer ?? ''}
        originalQuestion={
          editingCard ? baseCardMap.get(editingCard.id)?.question : undefined
        }
        originalAnswer={
          editingCard ? baseCardMap.get(editingCard.id)?.answer : undefined
        }
        canRevertToOriginal={
          Boolean(
            editingCard &&
              baseCardMap.has(editingCard.id) &&
              userDoc &&
              isBuiltInCardEdited(userDoc, editingCard.id),
          )
        }
        defaults={editorDefaults}
        onClose={() => setEditorOpen(false)}
        onSave={({ question, answer, bookId, chapter }) => {
          if (editorMode === 'add') {
            addCustomCard(question, answer, bookId, chapter)
            return
          }
          if (editingCard) {
            const original = baseCardMap.get(editingCard.id)
            saveCardContent(
              editingCard.id,
              question,
              answer,
              original
                ? { question: original.question, answer: original.answer }
                : undefined,
            )
          }
        }}
        onRevertToOriginal={
          editingCard && baseCardMap.has(editingCard.id)
            ? () => revertCardContent(editingCard.id)
            : undefined
        }
      />

      <DeckSessionPrompt
        open={sessionPromptOpen && !showIdentifyPicker}
        onContinueAsGuest={() => continueAsGuest()}
        onIdentify={() => {
          setSessionPromptOpen(false)
          setShowIdentifyPicker(true)
        }}
        onClose={() => {
          setSessionPromptOpen(false)
          setPendingAction(null)
        }}
      />

      {showIdentifyPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
          <UserPickerView
            users={roster}
            suggestedUserId={suggestedUserId}
            onSelect={selectUser}
            title="Identifícate"
            description="Elige tu nombre para guardar tus tarjetas."
          />
          <div className="px-4 pb-8 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowIdentifyPicker(false)
                setPendingAction(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {bulkConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="alertdialog"
          aria-labelledby="bulk-review-title"
          onClick={() => setBulkConfirm(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="bulk-review-title" className="font-medium">
              {bulkConfirm.title}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {bulkConfirm.detail}
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkConfirm(null)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={bulkConfirm.onConfirm}>
                Sí, marcar
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="alertdialog"
          aria-labelledby="delete-card-title"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="delete-card-title" className="font-medium">
              ¿Quitar esta tarjeta de tu mazo?
            </p>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {deleteTarget.question}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Solo desaparece para ti. El resto del equipo sigue viendo la
              tarjeta original.
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete}>
                Sí, quitar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
