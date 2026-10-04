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
import { applyDeckGroupings, getBookRange } from '@/lib/deckFilter'
import { defaultUserConfig, isBuiltInCardEdited } from '@/lib/userData'
import { useGlossary } from '@/context/GlossaryContext'
import { CardEditorDialog } from '@/components/CardEditorDialog'
import { CitationLinks, CitedText } from '@/components/CitedText'
import { DeckFilterBar } from '@/components/DeckFilterBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  cardCount: number
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
        cardCount: 0,
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
    book.cardCount = 0
    for (const ch of book.chapters) {
      ch.cards.sort((a, b) => a.question.localeCompare(b.question, 'es'))
      book.cardCount += ch.cards.length
    }
  }

  return books
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
  const { matchers } = useGlossary()
  const [localConfig, setLocalConfig] = useState(defaultUserConfig)
  const [query, setQuery] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add')
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Flashcard | null>(null)
  const [sessionPromptOpen, setSessionPromptOpen] = useState(false)
  const [showIdentifyPicker, setShowIdentifyPicker] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
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

  const filterConfig = userDoc?.config ?? localConfig
  const patchFilters = (patch: Parameters<typeof patchConfig>[0]) => {
    if (userDoc) patchConfig(patch)
    else setLocalConfig((prev) => ({ ...prev, ...patch }))
  }

  const filtered = useMemo(() => {
    const grouped = applyDeckGroupings(cards, filterConfig.groupings, matchers)
    const q = query.trim().toLowerCase()
    if (!q) return grouped
    return grouped.filter(
      (c) =>
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q) ||
        c.bookLabel.toLowerCase().includes(q) ||
        c.chapterTitle.toLowerCase().includes(q) ||
        String(c.chapter).includes(q),
    )
  }, [cards, query, filterConfig.groupings, matchers])

  const grouped = useMemo(() => buildBookGroups(filtered), [filtered])

  const knownCount = userDoc
    ? cards.filter((c) => getCardStatus(userDoc, c.id) === 'known').length
    : 0

  const editorDefaults = useMemo(() => {
    const range = getBookRange(filterConfig.groupings)
    const bookId = range?.bookId ?? '1-samuel'
    const chapter =
      range?.from ??
      cards.find((c) => c.bookId === bookId)?.chapter ??
      1
    return { bookId, chapter }
  }, [filterConfig.groupings, cards])

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

  const startStudyGroup = (pool: Flashcard[], label: string) => {
    if (!pool.length) return
    requireSession(() => {
      setStudyGroup(pool.map((c) => c.id), label)
      setSelectionMode(false)
      clearSelection()
      onStartStudyGroup?.()
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

  const hasStudyGroup = Boolean(userDoc?.config.studyGroupCardIds?.length)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Lista de tarjetas
        </h2>
        <p className="text-sm text-muted-foreground">
          {filtered.length === 1 ? '1 tarjeta' : `${filtered.length} tarjetas`}
          {userDoc && (
            <>
              {' '}
              · {knownCount} conocidas para {userDoc.displayName}
            </>
          )}
        </p>
      </div>

      <div className="mb-4">
        <DeckFilterBar
          cards={cards}
          config={filterConfig}
          onPatch={patchFilters}
        />
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
              <h3 className="mb-4 flex items-baseline justify-between gap-3 border-b pb-2 text-lg font-semibold tracking-tight">
                <span>{book.bookLabel}</span>
                <span className="shrink-0 text-sm font-normal tabular-nums text-muted-foreground">
                  {book.cardCount === 1
                    ? '1 tarjeta'
                    : `${book.cardCount} tarjetas`}
                </span>
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
                              <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectionMode) {
                                    toggleSelected(card.id)
                                    return
                                  }
                                  onSelectCard(card.id)
                                }}
                                className="w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/40"
                              >
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {card.bookLabel} {card.chapter}
                                  </span>
                                  {card.originalNumber > 0 && (
                                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                                      {card.originalNumber}
                                    </span>
                                  )}
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
                                  <CitedText text={card.question} />
                                </p>
                              </button>
                              <CitationLinks
                                text={`${card.question}\n${card.answer}`}
                                compact
                                className="mt-0 px-2 pb-1"
                              />
                              </div>
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
