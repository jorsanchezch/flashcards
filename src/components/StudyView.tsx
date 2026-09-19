import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Shuffle,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import type { Flashcard } from '@/lib/parseFlashcard'
import { useUser } from '@/context/UserContext'
import { getCardStatus, type CardStatus } from '@/lib/progress'
import { reshuffleStudyOrder, shuffleIds } from '@/lib/shuffle'
import { CardEditorDialog } from '@/components/CardEditorDialog'
import { FlipCard } from '@/components/FlipCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type StudyViewProps = {
  cards: Flashcard[]
  initialCardId?: string | null
  onExitToBrowse?: () => void
}

export function StudyView({
  cards,
  initialCardId,
  onExitToBrowse,
}: StudyViewProps) {
  const { userDoc, setCardStatus, saveCardContent } = useUser()
  const [editorOpen, setEditorOpen] = useState(false)
  const cardMap = useMemo(
    () => new Map(cards.map((c) => [c.id, c])),
    [cards],
  )
  const defaultOrder = useMemo(() => cards.map((c) => c.id), [cards])

  const [order, setOrder] = useState<string[]>(defaultOrder)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionMarked, setSessionMarked] = useState(0)

  const activeUserId = userDoc?.userId
  const shuffleOnLoad = userDoc?.config.shuffle ?? false

  useEffect(() => {
    if (!activeUserId) return
    const base = shuffleOnLoad ? shuffleIds(defaultOrder) : [...defaultOrder]
    setOrder(base)
    setIndex(0)
    setFlipped(false)
  }, [activeUserId, defaultOrder, shuffleOnLoad])

  useEffect(() => {
    if (!initialCardId) return
    const idx = order.indexOf(initialCardId)
    if (idx >= 0) setIndex(idx)
  }, [initialCardId, order])

  const current = cardMap.get(order[index])
  const status: CardStatus | undefined =
    userDoc && current ? getCardStatus(userDoc, current.id) : undefined

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
    const { order: nextOrder, index: nextIndex } = reshuffleStudyOrder(
      order,
      currentId,
    )
    setOrder(nextOrder)
    setIndex(nextIndex)
    setFlipped(false)
  }, [order, index])

  const handleShuffle = () => {
    applyShuffle()
  }

  const mark = (value: CardStatus) => {
    if (!current) return
    setCardStatus(current.id, value)
    setSessionMarked((n) => n + 1)
    go(index + 1)
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
        setCardStatus(current.id, 'known')
        setSessionMarked((n) => n + 1)
        go(index + 1)
      } else if (e.key === 'u') {
        if (!current) return
        setCardStatus(current.id, 'unknown')
        setSessionMarked((n) => n + 1)
        go(index + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [applyShuffle, current, go, index, setCardStatus])

  if (!userDoc) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Elige cómo quieres entrar al modo estudio.
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
            onClick={handleShuffle}
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

      <Progress value={sessionPercent} className="h-2" />

      <div className="flex justify-center">
        <Badge variant="secondary">{current.chapterTitle}</Badge>
        {status === 'known' && (
          <Badge className="ml-2 bg-emerald-600 text-white">Conocida</Badge>
        )}
        {status === 'unknown' && (
          <Badge className="ml-2" variant="destructive">Repasar</Badge>
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
        <Button variant="secondary" onClick={() => mark('known')}>
          <ThumbsUp className="size-4" />
          La sé (K)
        </Button>
        <Button variant="outline" onClick={() => mark('unknown')}>
          <ThumbsDown className="size-4" />
          Repasar (U)
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Atajos: ← → navegar · Espacio voltear · S mezclar · K/U marcar
      </p>

      <CardEditorDialog
        mode="edit"
        open={editorOpen}
        initialQuestion={current.question}
        initialAnswer={current.answer}
        defaults={{
          bookId: current.bookId,
          chapter: current.chapter,
        }}
        onClose={() => setEditorOpen(false)}
        onSave={({ question, answer }) => {
          saveCardContent(current.id, question, answer)
        }}
      />
    </div>
  )
}
