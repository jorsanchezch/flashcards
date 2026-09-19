import { isBuiltInCardEdited } from '@/lib/userData'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Shuffle,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import type { Flashcard } from '@/lib/parseFlashcard'
import { useUser } from '@/context/UserContext'
import { getCardStatus, getReviewHistory, type CardStatus } from '@/lib/progress'
import { buildStudyOrder, reshuffleWithinChapter } from '@/lib/studyOrder'
import { resolveStudyPool } from '@/lib/studyPool'
import { reshuffleStudyOrder } from '@/lib/shuffle'
import { CardEditorDialog } from '@/components/CardEditorDialog'
import { FlipCard } from '@/components/FlipCard'
import { ReviewedMarkButton } from '@/components/ReviewedMarkButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'

type StudyViewProps = {
  cards: Flashcard[]
  baseCards: Flashcard[]
  initialCardId?: string | null
  onExitToBrowse?: () => void
}

export function StudyView({
  cards,
  baseCards,
  initialCardId,
  onExitToBrowse,
}: StudyViewProps) {
  const {
    userDoc,
    setCardStatus,
    recordCardReview,
    clearStudyGroup,
    saveCardContent,
    revertCardContent,
    patchConfig,
  } = useUser()
  const baseCardMap = useMemo(
    () => new Map(baseCards.map((c) => [c.id, c])),
    [baseCards],
  )
  const [editorOpen, setEditorOpen] = useState(false)

  const studyGroupActive = Boolean(userDoc?.config.studyGroupCardIds?.length)

  const studyPool = useMemo(() => {
    if (!userDoc) return cards
    return resolveStudyPool(cards, userDoc.config)
  }, [cards, userDoc])

  const cardMap = useMemo(
    () => new Map(studyPool.map((c) => [c.id, c])),
    [studyPool],
  )

  const defaultOrder = useMemo(
    () =>
      buildStudyOrder(studyPool, {
        shuffle: userDoc?.config.shuffle ?? false,
        shuffleByChapter: userDoc?.config.shuffleByChapter ?? false,
      }),
    [studyPool, userDoc?.config.shuffle, userDoc?.config.shuffleByChapter],
  )

  const [order, setOrder] = useState<string[]>(defaultOrder)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionMarked, setSessionMarked] = useState(0)

  const activeUserId = userDoc?.userId
  const shuffleByChapter = userDoc?.config.shuffleByChapter ?? false

  useEffect(() => {
    if (!activeUserId) return
    setOrder(defaultOrder)
    setIndex(0)
    setFlipped(false)
  }, [activeUserId, defaultOrder])

  useEffect(() => {
    if (!initialCardId) return
    const idx = order.indexOf(initialCardId)
    if (idx >= 0) setIndex(idx)
  }, [initialCardId, order])

  const current = cardMap.get(order[index])
  const status: CardStatus | undefined =
    userDoc && current ? getCardStatus(userDoc, current.id) : undefined
  const reviewHistory =
    userDoc && current ? getReviewHistory(userDoc, current.id) : []

  const chapterOptions = useMemo(() => {
    const set = new Set<number>()
    for (const c of cards) set.add(c.chapter)
    return [...set].sort((a, b) => a - b)
  }, [cards])

  const go = useCallback(
    (next: number) => {
      if (!order.length) return
      setFlipped(false)
      setIndex((next + order.length) % order.length)
    },
    [order.length],
  )

  const applyShuffle = useCallback(() => {
    const currentId = order[index]
    if (shuffleByChapter && currentId) {
      const { order: nextOrder, index: nextIndex } = reshuffleWithinChapter(
        order,
        cardMap,
        currentId,
      )
      setOrder(nextOrder)
      setIndex(nextIndex)
    } else {
      const { order: nextOrder, index: nextIndex } = reshuffleStudyOrder(
        order,
        currentId,
      )
      setOrder(nextOrder)
      setIndex(nextIndex)
    }
    setFlipped(false)
  }, [order, index, shuffleByChapter, cardMap])

  const markKnown = () => {
    if (!current) return
    setCardStatus(current.id, 'known')
    setSessionMarked((n) => n + 1)
    go(index + 1)
  }

  const markReviewed = () => {
    if (!current) return
    recordCardReview(current.id)
    setSessionMarked((n) => n + 1)
    go(index + 1)
  }

  const markRepasar = () => {
    if (!current) return
    setCardStatus(current.id, 'unknown')
    setSessionMarked((n) => n + 1)
    go(index + 1)
  }

  const parseChapterInput = (value: string): number | null => {
    const n = Number.parseInt(value, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        go(index + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        go(index - 1)
      } else if (e.key === 's') {
        applyShuffle()
      } else if (e.key === 'k') {
        if (!current) return
        markKnown()
      } else if (e.key === 'r') {
        if (!current) return
        markReviewed()
      } else if (e.key === 'u') {
        markRepasar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [applyShuffle, current, go, index])

  if (!userDoc) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Elige cómo quieres entrar al modo estudio.
      </p>
    )
  }

  if (!studyPool.length) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        {studyGroupActive
          ? 'El grupo de estudio no tiene tarjetas visibles. Elige otro grupo en Explorar o quita el grupo.'
          : 'No hay tarjetas en el rango de capítulos elegido. Amplía el rango abajo.'}
      </p>
    )
  }

  if (!current) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No hay tarjetas para estudiar.
      </p>
    )
  }

  const sessionPercent =
    order.length > 0 ? Math.round(((index + 1) / order.length) * 100) : 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Modo estudio</h2>
          <p className="text-sm text-muted-foreground">
            Tarjeta {index + 1} de {order.length}
            {sessionMarked > 0 && ` · ${sessionMarked} marcadas esta sesión`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={applyShuffle}
            disabled={order.length <= 1}
          >
            <Shuffle className="size-4" />
            Mezclar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditorOpen(true)}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          {onExitToBrowse && (
            <Button variant="ghost" size="sm" onClick={onExitToBrowse}>
              Ver listado
            </Button>
          )}
        </div>
      </div>

      {studyGroupActive && userDoc.config.studyGroupLabel && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm">
            <span className="font-medium">Grupo de estudio:</span>{' '}
            {userDoc.config.studyGroupLabel}
            <span className="text-muted-foreground">
              {' '}
              · {studyPool.length} tarjetas
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => clearStudyGroup()}
          >
            <X className="size-4" />
            Quitar grupo
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-card/50 p-4">
        <p className="mb-3 text-sm font-medium">
          {studyGroupActive
            ? 'Capítulos (desactivado mientras hay grupo)'
            : 'Rango de capítulos'}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="study-from" className="text-xs">Desde</Label>
            <Input
              id="study-from"
              type="number"
              min={1}
              className="mt-1 w-24"
              placeholder="1"
              value={userDoc.config.studyChapterFrom ?? ''}
              disabled={studyGroupActive}
              onChange={(e) =>
                patchConfig({
                  studyChapterFrom: parseChapterInput(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="study-to" className="text-xs">Hasta</Label>
            <Input
              id="study-to"
              type="number"
              min={1}
              className="mt-1 w-24"
              placeholder={String(chapterOptions.at(-1) ?? '')}
              value={userDoc.config.studyChapterTo ?? ''}
              disabled={studyGroupActive}
              onChange={(e) =>
                patchConfig({
                  studyChapterTo: parseChapterInput(e.target.value),
                })
              }
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={studyGroupActive}
            onClick={() =>
              patchConfig({ studyChapterFrom: null, studyChapterTo: null })
            }
          >
            Todo el libro
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Switch
              checked={userDoc.config.shuffle}
              onCheckedChange={(checked) => patchConfig({ shuffle: checked })}
            />
            Mezclar al empezar
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Switch
              checked={userDoc.config.shuffleByChapter}
              onCheckedChange={(checked) =>
                patchConfig({ shuffleByChapter: checked })
              }
            />
            Mezclar por capítulo (orden de capítulos fijo)
          </label>
        </div>
      </div>

      <Progress value={sessionPercent} className="h-2" />

      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="secondary">{current.chapterTitle}</Badge>
        {status === 'known' && (
          <Badge className="bg-sky-600 text-white">La sé</Badge>
        )}
        {(status === 'reviewed' || reviewHistory.length > 0) && (
          <Badge className="bg-emerald-600 text-white">
            Revisada
            {reviewHistory.length > 0 && ` · ${reviewHistory.length}`}
          </Badge>
        )}
        {status === 'unknown' && (
          <Badge variant="destructive">Repasar</Badge>
        )}
      </div>

      <FlipCard
        front={current.question}
        back={current.answer}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={() => go(index - 1)}>
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button variant="outline" onClick={() => setFlipped((f) => !f)}>
          Voltear
        </Button>
        <Button variant="outline" onClick={() => go(index + 1)}>
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="default" onClick={markKnown}>
          <ThumbsUp className="size-4" />
          La sé (K)
        </Button>
        <ReviewedMarkButton
          timestamps={reviewHistory}
          onMark={markReviewed}
          shortcutHint="R"
        />
        <Button variant="outline" onClick={markRepasar}>
          <ThumbsDown className="size-4" />
          Repasar (U)
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Atajos: ← → navegar · Espacio voltear · S mezclar · K la sé · R
        revisada · U repasar
      </p>

      <CardEditorDialog
        mode="edit"
        open={editorOpen}
        initialQuestion={current.question}
        initialAnswer={current.answer}
        originalQuestion={baseCardMap.get(current.id)?.question}
        originalAnswer={baseCardMap.get(current.id)?.answer}
        canRevertToOriginal={
          Boolean(
            userDoc &&
              baseCardMap.has(current.id) &&
              isBuiltInCardEdited(userDoc, current.id),
          )
        }
        defaults={{
          bookId: current.bookId,
          chapter: current.chapter,
        }}
        onClose={() => setEditorOpen(false)}
        onSave={({ question, answer }) => {
          const original = baseCardMap.get(current.id)
          saveCardContent(
            current.id,
            question,
            answer,
            original
              ? { question: original.question, answer: original.answer }
              : undefined,
          )
        }}
        onRevertToOriginal={
          baseCardMap.has(current.id)
            ? () => revertCardContent(current.id)
            : undefined
        }
      />
    </div>
  )
}
