import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Pencil,
  RefreshCw,
  RotateCcw,
  Shuffle,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  CheckCircle2,
} from 'lucide-react'
import type { Flashcard } from '@/lib/parseFlashcard'
import { useUser } from '@/context/UserContext'
import { getCardStatus, getReviewHistory, type CardStatus } from '@/lib/progress'
import { restoreStudyCursor } from '@/lib/studyOrder'
import { orderForFilter, applyDeckGroupings, canonicalIds, groupingsSignature } from '@/lib/deckFilter'
import { reshuffleStudyOrder, shuffleIdsFresh } from '@/lib/shuffle'
import { CardEditorDialog } from '@/components/CardEditorDialog'
import { CitationLinks, CitedText } from '@/components/CitedText'
import { DeckFilterBar } from '@/components/DeckFilterBar'
import { FlipCard } from '@/components/FlipCard'
import { Confetti } from '@/components/Confetti'
import { ProgressRing } from '@/components/ProgressRing'
import { ReviewedMarkButton } from '@/components/ReviewedMarkButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isBuiltInCardEdited, rememberStudyCursor, shuffleConfigPatch } from '@/lib/userData'
import { recordStudyDay, studyStreak } from '@/lib/studyStreak'
import { cn } from '@/lib/utils'
import { useGlossary } from '@/context/GlossaryContext'

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
  const [finished, setFinished] = useState(false)
  /** A temporary pass over the cards marked Repasar; never saved as the study order. */
  const [reviewRound, setReviewRound] = useState(false)
  const [flash, setFlash] = useState<{ kind: 'known' | 'reviewed' | 'unknown'; n: number } | null>(null)

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
    setReviewRound(false)
    setFinished(false)
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
    setReviewRound(false)
    setFinished(false)
    setSkipFlipMotion(true)
    setFlipped(false)
    // Adopt Mezclar / other-book cursor written from the filter bar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedOrderKey, userDoc?.config.studySessionIndex])

  useEffect(() => {
    if (!userDoc || !order.length || reviewRound) return
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
  }, [order, index, patchConfig, reviewRound])

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
      if (finished) {
        // From the summary, Anterior returns to the last card.
        if (next < index) setFinished(false)
        return
      }
      if (next >= order.length && index === order.length - 1) {
        setFinished(true)
        return
      }
      showQuestionInstantly()
      setIndex((next + order.length) % order.length)
    },
    [order.length, index, finished, showQuestionInstantly],
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

  const noteMark = (kind: 'known' | 'reviewed' | 'unknown') => {
    setSessionMarked((n) => n + 1)
    setFlash((f) => ({ kind, n: (f?.n ?? 0) + 1 }))
    if (userDoc) recordStudyDay(userDoc.userId)
  }

  const markKnown = () => {
    if (!current || finished) return
    setCardStatus(current.id, status === 'known' ? null : 'known')
    noteMark('known')
  }

  const markReviewed = () => {
    if (!current || finished) return
    recordCardReview(current.id)
    noteMark('reviewed')
  }

  const markRepasar = () => {
    if (!current || finished) return
    setCardStatus(current.id, status === 'unknown' ? null : 'unknown')
    noteMark('unknown')
  }

  const startReviewRound = (ids: string[]) => {
    if (!ids.length) return
    setReviewRound(true)
    setOrder(ids)
    setIndex(0)
    setFinished(false)
    showQuestionInstantly()
  }

  const leaveReviewRound = () => {
    if (!userDoc) return
    const next = restoreStudyCursor({
      poolIds,
      defaultOrder,
      savedOrder: userDoc.config.studySessionOrder,
      savedIndex: userDoc.config.studySessionIndex,
    })
    setReviewRound(false)
    setOrder(next.order)
    setIndex(next.index)
    setFinished(false)
    showQuestionInstantly()
  }

  const shuffleAndRestart = () => {
    if (!userDoc) return
    const ids = shuffleIdsFresh(canonicalIds(studyPool), userDoc.config.studySessionOrder)
    setReviewRound(false)
    setFinished(false)
    setOrder(ids)
    setIndex(0)
    showQuestionInstantly()
    patchConfig(shuffleConfigPatch(userDoc.config, ids, 0))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === ' ' || e.key === 'Enter') {
        if (finished) return
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
  }, [applyShuffle, current, go, index, finished])

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

  const streak = studyStreak(userDoc)
  const position = finished ? order.length : index + 1
  const tally = { known: 0, reviewed: 0, unknown: 0, none: 0 }
  const markedIds: string[] = []
  for (const id of order) {
    const st = getCardStatus(userDoc, id)
    if (st === 'known') tally.known++
    else if (st === 'unknown') {
      tally.unknown++
      markedIds.push(id)
    } else if (st === 'reviewed' || getReviewHistory(userDoc, id).length > 0) tally.reviewed++
    else tally.none++
  }

  const flashIcon = (kind: 'known' | 'reviewed' | 'unknown', icon: React.ReactNode) => (
    <span
      key={flash?.kind === kind ? `${kind}-${flash.n}` : kind}
      className={cn('inline-flex', flash?.kind === kind && 'animate-bounce-in')}
      aria-hidden
    >
      {icon}
    </span>
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-10">
      <header className="flex flex-wrap items-center gap-4">
        <ProgressRing
          value={order.length ? position / order.length : 0}
          size={68}
          label={`Tarjeta ${position} de ${order.length}`}
          color={finished ? 'var(--gold)' : 'var(--primary)'}
        >
          <span className="font-display text-lg font-semibold tabular-nums">{position}</span>
          <span className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">de {order.length}</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 font-display text-2xl font-semibold tracking-tight">
            Modo estudio
            {reviewRound && (
              <Badge variant="review-again" className="font-sans">
                Repaso de marcadas
              </Badge>
            )}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="study-card-number" className="sr-only">
              Ir a la tarjeta número
            </label>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card py-0.5 pr-1 pl-3 text-xs shadow-xs">
              Ir a
              <Input
                id="study-card-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                enterKeyHint="go"
                autoComplete="off"
                className="h-8 w-14 rounded-full border-0 bg-muted px-2 text-center text-sm tabular-nums shadow-none focus-visible:ring-2"
                value={indexDraft}
                onFocus={(e) => {
                  setIndexFocused(true)
                  e.currentTarget.select()
                }}
                onChange={(e) => setIndexDraft(e.target.value.replace(/[^\d]/g, ''))}
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
            </span>
            {streak.days > 0 && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                  streak.studiedToday
                    ? 'bg-review-again/12 text-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
                title={streak.studiedToday ? 'Racha de estudio' : 'Estudia hoy para mantener la racha'}
              >
                <Flame
                  className={cn('size-3.5', streak.studiedToday ? 'text-review-again' : '')}
                  aria-hidden
                />
                {streak.days} {streak.days === 1 ? 'día' : 'días'}
              </span>
            )}
            {sessionMarked > 0 && (
              <span className="text-xs">{sessionMarked} marcadas esta sesión</span>
            )}
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => setEditorOpen(true)} disabled={finished}>
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
      </header>

      {!reviewRound && (
        <DeckFilterBar cards={cards} config={userDoc.config} onPatch={patchConfig} />
      )}

      {finished ? (
        <section
          className="animate-pop-in relative overflow-hidden rounded-3xl border bg-card px-6 py-10 text-center shadow-raised sm:px-10"
          aria-live="polite"
        >
          <Confetti />
          <span className="animate-bounce-in mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-[color-mix(in_oklch,var(--gold)_55%,var(--primary))] text-gold-foreground shadow-card">
            <Trophy className="size-8" aria-hidden />
          </span>
          <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {reviewRound ? '¡Repaso terminado!' : '¡Terminaste el mazo!'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.length} {order.length === 1 ? 'tarjeta' : 'tarjetas'}
            {sessionMarked > 0 && ` · ${sessionMarked} marcadas en esta sesión`}
          </p>
          <dl className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'La sé', value: tally.known, color: 'var(--known)' },
              { label: 'Revisadas', value: tally.reviewed, color: 'var(--reviewed)' },
              { label: 'Repasar', value: tally.unknown, color: 'var(--review-again)' },
              { label: 'Sin marcar', value: tally.none, color: 'var(--muted-foreground)' },
            ].map((t) => (
              <div key={t.label} className="rounded-2xl bg-muted/60 px-2 py-3">
                <dd className="font-display text-2xl font-semibold tabular-nums" style={{ color: t.color }}>
                  {t.value}
                </dd>
                <dt className="text-xs text-muted-foreground">{t.label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              size="lg"
              className="bg-review-again text-review-again-foreground hover:bg-review-again/90"
              disabled={markedIds.length === 0}
              onClick={() => startReviewRound(markedIds)}
            >
              <RotateCcw />
              Repasar las marcadas ({markedIds.length})
            </Button>
            <Button size="lg" variant="outline" onClick={shuffleAndRestart}>
              <Shuffle />
              Mezclar y otra vez
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {reviewRound && (
              <Button variant="ghost" onClick={leaveReviewRound}>
                <Layers />
                Volver al mazo completo
              </Button>
            )}
            <Button variant="ghost" onClick={() => setFinished(false)}>
              <RefreshCw />
              Volver a la última tarjeta
            </Button>
          </div>
        </section>
      ) : (
        <>
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
            onSwipe={(dir) => go(dir === 'next' ? index + 1 : index - 1)}
            originalNumber={current.originalNumber}
            bookId={current.bookId}
            chapterTitle={current.chapterTitle}
          />

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:mx-auto sm:flex sm:gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => go(index - 1)}>
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button className="rounded-full px-6" onClick={() => setFlipped((f) => !f)}>
              <RefreshCw className={cn('size-4 transition-transform duration-500', flipped && 'rotate-180')} />
              Voltear
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => go(index + 1)}>
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Button
              type="button"
              onClick={markKnown}
              aria-pressed={status === 'known'}
              className={cn(
                markPill,
                status === 'known'
                  ? 'border-known bg-known text-known-foreground hover:bg-known/90'
                  : 'border-known/35 bg-known/10 text-foreground hover:bg-known/20',
              )}
            >
              {flashIcon('known', <ThumbsUp className="size-5" />)}
              La sé
              <kbd className={kbdHint}>K</kbd>
            </Button>
            <ReviewedMarkButton
              timestamps={reviewHistory}
              onMark={markReviewed}
              shortcutHint="R"
              icon={flashIcon('reviewed', <CheckCircle2 className="size-5" />)}
              className={cn(
                markPill,
                reviewHistory.length > 0 || status === 'reviewed'
                  ? 'border-reviewed bg-reviewed text-reviewed-foreground hover:bg-reviewed/90'
                  : 'border-reviewed/35 bg-reviewed/10 text-foreground hover:bg-reviewed/20',
              )}
            />
            <Button
              type="button"
              onClick={markRepasar}
              aria-pressed={status === 'unknown'}
              className={cn(
                markPill,
                status === 'unknown'
                  ? 'border-review-again bg-review-again text-review-again-foreground hover:bg-review-again/90'
                  : 'border-review-again/35 bg-review-again/10 text-foreground hover:bg-review-again/20',
              )}
            >
              {flashIcon('unknown', <ThumbsDown className="size-5" />)}
              Repasar
              <kbd className={kbdHint}>U</kbd>
            </Button>
          </div>

          <p className="hidden text-center text-xs text-muted-foreground sm:block">
            Atajos: ← → navegar · Espacio voltear · S mezclar · K la sé · R revisada · U repasar
          </p>
        </>
      )}

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

const markPill =
  'h-auto min-h-16 w-full flex-col gap-1 rounded-2xl border-2 px-2 py-2.5 text-sm font-semibold shadow-card active:scale-95 sm:flex-row sm:gap-2 sm:px-5 sm:text-base'

const kbdHint =
  'hidden rounded border border-current/25 px-1 font-sans text-[10px] font-medium opacity-70 sm:inline'
