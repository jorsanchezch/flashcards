import { useEffect, useState } from 'react'
import { BIBLE_BOOKS } from '@/lib/biblical'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type CardEditorDefaults = {
  bookId: string
  chapter: number
}

type CardEditorDialogProps = {
  mode: 'edit' | 'add'
  open: boolean
  initialQuestion?: string
  initialAnswer?: string
  originalQuestion?: string
  originalAnswer?: string
  canRevertToOriginal?: boolean
  defaults: CardEditorDefaults
  onClose: () => void
  onSave: (payload: {
    question: string
    answer: string
    bookId: string
    chapter: number
  }) => void
  onRevertToOriginal?: () => void
}

export function CardEditorDialog({
  mode,
  open,
  initialQuestion = '',
  initialAnswer = '',
  originalQuestion,
  originalAnswer: _originalAnswer,
  canRevertToOriginal = false,
  defaults,
  onClose,
  onSave,
  onRevertToOriginal,
}: CardEditorDialogProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState(initialAnswer)
  const [bookId, setBookId] = useState(defaults.bookId)
  const [chapter, setChapter] = useState(String(defaults.chapter))
  const [discardConfirm, setDiscardConfirm] = useState(false)
  const [revertConfirm, setRevertConfirm] = useState(false)

  useEffect(() => {
    if (!open) return
    setQuestion(initialQuestion)
    setAnswer(initialAnswer)
    setBookId(defaults.bookId)
    setChapter(String(defaults.chapter))
    setDiscardConfirm(false)
    setRevertConfirm(false)
  }, [open, initialQuestion, initialAnswer, defaults.bookId, defaults.chapter])

  if (!open) return null

  const title = mode === 'add' ? 'Nueva tarjeta' : 'Editar tarjeta'
  const canSave =
    question.trim().length > 0 &&
    answer.trim().length > 0 &&
    Number.parseInt(chapter, 10) > 0

  const isDirty =
    question.trim() !== initialQuestion.trim() ||
    answer.trim() !== initialAnswer.trim()

  const requestClose = () => {
    if (isDirty) {
      setDiscardConfirm(true)
      return
    }
    onClose()
  }

  const submit = () => {
    if (!canSave) return
    onSave({
      question: question.trim(),
      answer: answer.trim(),
      bookId,
      chapter: Number.parseInt(chapter, 10),
    })
    onClose()
  }

  const confirmRevert = () => {
    onRevertToOriginal?.()
    setRevertConfirm(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-editor-title"
      onClick={requestClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="card-editor-title" className="text-lg font-semibold">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'add'
            ? 'Se añadirá solo a tu mazo personal.'
            : 'Los cambios son solo para ti; el texto del curso no se modifica.'}
        </p>

        {discardConfirm && (
          <div
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            role="alertdialog"
          >
            <p className="text-sm font-medium">¿Descartar los cambios?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Lo que escribiste en esta ventana no se guardará.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  setDiscardConfirm(false)
                  onClose()
                }}
              >
                Sí, descartar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDiscardConfirm(false)}
              >
                Seguir editando
              </Button>
            </div>
          </div>
        )}

        {revertConfirm && (
          <div
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            role="alertdialog"
          >
            <p className="text-sm font-medium">¿Volver al texto del curso?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Se restaurará la pregunta y la respuesta originales de esta tarjeta.
            </p>
            {originalQuestion && (
              <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground">
                «{originalQuestion}»
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={confirmRevert}
              >
                Sí, restaurar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setRevertConfirm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <Label htmlFor="card-q">Pregunta</Label>
            <Input
              id="card-q"
              className="mt-1"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="card-a">Respuesta</Label>
            <textarea
              id="card-a"
              className="mt-1 flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
          {mode === 'add' && (
            <>
              <div>
                <Label htmlFor="card-book">Libro</Label>
                <select
                  id="card-book"
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                >
                  {BIBLE_BOOKS.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="card-ch">Capítulo</Label>
                <Input
                  id="card-ch"
                  type="number"
                  min={1}
                  className="mt-1"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {mode === 'edit' && canRevertToOriginal && onRevertToOriginal && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setRevertConfirm(true)}
            >
              Volver al texto del curso
            </Button>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={requestClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={submit} disabled={!canSave}>
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
