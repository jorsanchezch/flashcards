import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import type { Flashcard } from '@/lib/parseFlashcard'
import { useUser } from '@/context/UserContext'
import { getCardStatus, getReviewHistory, type CardStatus } from '@/lib/progress'
import { restoreStudyCursor } from '@/lib/studyOrder'
import { orderForFilter, applyDeckGroupings, groupingsSignature } from '@/lib/deckFilter'
import { reshuffleStudyOrder } from '@/lib/shuffle'
import { CardEditorDialog } from '@/components/CardEditorDialog'
import { CitationLinks, CitedText } from '@/components/CitedText'
import { DeckFilterBar } from '@/components/DeckFilterBar'
import { FlipCard } from '@/components/FlipCard'
import { ReviewedMarkButton } from '@/components/ReviewedMarkButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { isBuiltInCardEdited, rememberStudyCursor } from '@/lib/userData'
import { useGlossary } from '@/context/GlossaryContext'
import { cn } from '@/lib/utils'

type StudyViewProps = {
  cards: Flashcard[]
  baseCards: Flashcard[]
  initialCardId?: string | null
  onExitToBrowse?: () => void
  onBackToGlossary?: () => void
}

export function StudyView({
  cards,
  baseCards,
  initialCardId,
  onExitToBrowse,
  onBackToGlossary,
}: StudyViewProps) {
  const {
    userDoc,
    setCardStatus,
    recordCardReview,
    saveCardContent,
    revertCardContent,
    patchConfig,
  } = useUser()
  const { matchers } = useGlossary()
  const baseCardMap = useMemo(
    () => new Map(baseCards.map((c) => [c.id, c])),
    [baseCards],
  )
  const [editorOpen, setEditorOpen] = useState(false)

  const studyPool = useMemo(() => {
    if (!userDoc) return cards
    return applyDeckGroupings(cards, userDoc.config.groupings, matchers)
  }, [cards, userDoc?.config.groupings, matchers])

  const cardMap = useMemo(
    () => new Map(studyPool.map((c) => [c.id, c])),
    [studyPool],
  )

  const poolIds = useMemo(() => studyPool.map((c) => c.id), [studyPool])
  const poolSignature = poolIds.join('\n')

  const defaultOrder = useMemo(
    () =>
      orderForFilter({
        pool: studyPool,
        shuffle: userDoc?.config.shuffle ?? false,
        savedOrder: userDoc?.config.studySessionOrder,
      }),
    [
      studyPool,
      userDoc?.config.shuffle,
      userDoc?.config.studySessionOrder,
    ],
  )

  const initialCursor = restoreStudyCursor({
    poolIds,
    defaultOrder,
    savedOrder: userDoc?.config.studySessionOrder,
    savedIndex: userDoc?.config.studySessionIndex,
    initialCardId,
  })

  const [order, setOrder] = useState<string[]>(initialCursor.order)
  const [index, setIndex] = useState(initialCursor.index)
  const [flipped, setFlipped] = useState(false)
  const [skipFlipMotion, setSkipFlipMotion] = useState(false)
  const [sessionMarked, setSessionMarked] = useState(0)
  const [indexDraft, setIndexDraft] = useState(String(initialCursor.index + 1))
  const [indexFocused, setIndexFocused] = useState(false)
  const [draggingProgress, setDraggingProgress] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const activeUserId = userDoc?.userId
  const filterSignature = groupingsSignature(userDoc?.config.groupings ?? [])
  const savedOrderKey = (userDoc?.config.studySessionOrder ?? []).join('\n')

  useEffect(() => {
    if (!activeUserId) return
    const next = restoreStudyCursor({
      poolIds,
      defaultOrder,
      savedOrder: userDoc?.config.studySessionOrder,
      savedIndex: userDoc?.config.studySessionIndex,
      initialCardId,
    })
    setOrder(next.order)
    setIndex(next.index)
    setSkipFlipMotion(true)
    setFlipped(false)
    // Restore when the person or the study pool changes — not when marks update.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultOrder is random when shuffle is on
  }, [activeUserId, poolSignature, initialCardId, filterSignature])

  useEffect(() => {
    if (!userDoc) return
    const saved = userDoc.config.studySessionOrder
    if (!saved?.length) return
    const same =
      saved.length === order.length &&
      saved.every((id, i) => id === order[i])
    if (same) return
    const next = restoreStudyCursor({
      poolIds,
      defaultOrder,
      savedOrder: saved,
      savedIndex: userDoc.config.studySessionIndex,
      initialCardId,
    })
    setOrder(next.order)
    setIndex(next.index)
    setSkipFlipMotion(true)
    setFlipped(false)
    // Adopt Mezclar / other-book cursor written from the filter bar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedOrderKey, userDoc?.config.studySessionIndex])

  useEffect(() => {
    if (!userDoc || !order.length) return
    const saved = userDoc.config.studySessionOrder
    const sameOrder =
      Boolean(saved) &&
      saved!.length === order.length &&
      saved!.every((id, i) => id === order[i])
    if (sameOrder && userDoc.config.studySessionIndex === index) return
    patchConfig({
      studySessionOrder: order,
      studySessionIndex: index,
      studyCursors: rememberStudyCursor({
        ...userDoc.config,
        studySessionOrder: order,
        studySessionIndex: index,
      }),
    })
    // Persist cursor; skip looping on userDoc identity after save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, index, patchConfig])

  useEffect(() => {
    if (!skipFlipMotion) return
    let frame2 = 0
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setSkipFlipMotion(false))
    })
    return () => {
      cancelAnimationFrame(frame1)
      cancelAnimationFrame(frame2)
    }
  }, [skipFlipMotion])

  const current = cardMap.get(order[index])
  const status: CardStatus | undefined =
    userDoc && current ? getCardStatus(userDoc, current.id) : undefined
  const reviewHistory =
    userDoc && current ? getReviewHistory(userDoc, current.id) : []

  const showQuestionInstantly = useCallback(() => {
    setSkipFlipMotion(true)
    setFlipped(false)
  }, [])

  const go = useCallback(
    (next: number) => {
      if (!order.length) return
      showQuestionInstantly()
      setIndex((next + order.length) % order.length)
    },
    [order.length, showQuestionInstantly],
  )

  const jumpToCardNumber = useCallback(
    (raw: string) => {
      if (!order.length) return
      const trimmed = raw.trim()
      if (trimmed === '') {
        setIndexDraft(String(index + 1))
        return
      }
      const n = Number.parseInt(trimmed, 10)
      if (!Number.isFinite(n)) {
        setIndexDraft(String(index + 1))
        return
      }
      const clamped = Math.min(order.length, Math.max(1, n))
      showQuestionInstantly()
      setIndex(clamped - 1)
      setIndexDraft(String(clamped))
    },
    [index, order.length, showQuestionInstantly],
  )

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = progressBarRef.current
      if (!el || !order.length) return
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0) return
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const nextIndex =
        order.length === 1 ? 0 : Math.round(ratio * (order.length - 1))
      showQuestionInstantly()
      setIndex(nextIndex)
    },
    [order.length, showQuestionInstantly],
  )

  const onProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      setDraggingProgress(true)
      seekFromClientX(e.clientX)
    },
    [seekFromClientX],
  )

  const onProgressPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
      seekFromClientX(e.clientX)
    },
    [seekFromClientX],
  )

  const onProgressPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      setDraggingProgress(false)
    },
    [],
  )

  const onProgressKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!order.length) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        go(index + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        go(index - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        showQuestionInstantly()
        setIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        showQuestionInstantly()
        setIndex(order.length - 1)
      }
    },
    [go, index, order.length, showQuestionInstantly],
  )

  useEffect(() => {
    if (!indexFocused) setIndexDraft(String(index + 1))
  }, [index, indexFocused])

  const applyShuffle = useCallback(() => {
    const currentId = order[index]
    const { order: nextOrder, index: nextIndex } = reshuffleStudyOrder(
      order,
      currentId,
    )
    setOrder(nextOrder)
    setIndex(nextIndex)
    showQuestionInstantly()
    patchConfig({
      shuffle: true,
      studySessionOrder: nextOrder,
      studySessionIndex: nextIndex,
      studyCursors: rememberStudyCursor({
        ...userDoc!.config,
        shuffle: true,
        studySessionOrder: nextOrder,
        studySessionIndex: nextIndex,
      }),
    })
  }, [order, index, patchConfig, showQuestionInstantly])

  const markKnown = () => {
    if (!current) return
    setCardStatus(current.id, status === 'known' ? null : 'known')
    setSessionMarked((n) => n + 1)
  }

  const markReviewed = () => {
    if (!current) return
    recordCardReview(current.id)
    setSessionMarked((n) => n + 1)
  }

  const markRepasar = () => {
    if (!current) return
    setCardStatus(current.id, status === 'unknown' ? null : 'unknown')
    setSessionMarked((n) => n + 1)
  }

  useEffect(() => {
    if (editorOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }
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
  }, [applyShuffle, current, editorOpen, go, index])

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
        No hay tarjetas con estos filtros. Limpia los filtros o elige otro rango.
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
    order.length <= 1
      ? 100
      : Math.round((index / (order.length - 1)) * 100)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Modo estudio</h2>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
            <label htmlFor="study-card-number" className="shrink-0">
              Tarjeta
            </label>
            <Input
              id="study-card-number"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="go"
              autoComplete="off"
              aria-label="Número de tarjeta"
              className="h-11 min-h-11 w-16 px-2 text-center text-base tabular-nums md:text-base"
              value={indexDraft}
              onFocus={(e) => {
                setIndexFocused(true)
                e.currentTarget.select()
              }}
              onChange={(e) =>
                setIndexDraft(e.target.value.replace(/[^\d]/g, ''))
              }
              onBlur={() => {
                setIndexFocused(false)
                jumpToCardNumber(indexDraft)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  jumpToCardNumber(indexDraft)
                  e.currentTarget.blur()
                }
              }}
            />
            <span>
              de {order.length}
              {sessionMarked > 0 && ` · ${sessionMarked} marcadas esta sesión`}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditorOpen(true)}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          {onBackToGlossary && (
            <Button variant="ghost" size="sm" onClick={onBackToGlossary}>
              Volver al glosario
            </Button>
          )}
          {onExitToBrowse && (
            <Button variant="ghost" size="sm" onClick={onExitToBrowse}>
              Ver listado
            </Button>
          )}
        </div>
      </div>

      <DeckFilterBar cards={cards} config={userDoc.config} onPatch={patchConfig} />

      <div
        ref={progressBarRef}
        role="slider"
        tabIndex={0}
        aria-label="Posición en la sesión"
        aria-valuemin={1}
        aria-valuemax={order.length}
        aria-valuenow={index + 1}
        aria-valuetext={`Tarjeta ${index + 1} de ${order.length}`}
        className="relative touch-none cursor-ew-resize py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        onPointerDown={onProgressPointerDown}
        onPointerMove={onProgressPointerMove}
        onPointerUp={onProgressPointerUp}
        onPointerCancel={onProgressPointerUp}
        onKeyDown={onProgressKeyDown}
      >
        <Progress
          value={sessionPercent}
          className={cn(
            'pointer-events-none h-2',
            draggingProgress &&
              '[&_[data-slot=progress-indicator]]:transition-none',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm',
            !draggingProgress && 'transition-[left]',
          )}
          style={{ left: `${sessionPercent}%` }}
        />
      </div>

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
        key={current.id}
        front={
          <>
            <CitedText text={current.question} />
            <CitationLinks
              text={`${current.question}\n${current.answer}`}
              compact
              className="mt-3"
            />
          </>
        }
        back={
          <>
            <CitedText text={current.answer} citeStyle="plain" />
            <CitationLinks text={current.answer} compact className="mt-3" />
          </>
        }
        flipped={flipped}
        instant={skipFlipMotion}
        onFlip={() => setFlipped((f) => !f)}
        originalNumber={current.originalNumber}
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
        <Button type="button" variant="default" onClick={markKnown}>
          <ThumbsUp className="size-4" />
          La sé (K)
        </Button>
        <ReviewedMarkButton
          timestamps={reviewHistory}
          onMark={markReviewed}
          shortcutHint="R"
        />
        <Button type="button" variant="outline" onClick={markRepasar}>
          <ThumbsDown className="size-4" />
          Repasar (U)
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Atajos: ← → navegar · arrastra la barra · Espacio voltear · S mezclar ·
        K la sé · R revisada · U repasar
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
