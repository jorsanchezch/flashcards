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
  defaults: CardEditorDefaults
  onClose: () => void
  onSave: (payload: {
    question: string
    answer: string
    bookId: string
    chapter: number
  }) => void
}

export function CardEditorDialog({
  mode,
  open,
  initialQuestion = '',
  initialAnswer = '',
  defaults,
  onClose,
  onSave,
}: CardEditorDialogProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState(initialAnswer)
  const [bookId, setBookId] = useState(defaults.bookId)
  const [chapter, setChapter] = useState(String(defaults.chapter))

  useEffect(() => {
    if (!open) return
    setQuestion(initialQuestion)
    setAnswer(initialAnswer)
    setBookId(defaults.bookId)
    setChapter(String(defaults.chapter))
  }, [open, initialQuestion, initialAnswer, defaults.bookId, defaults.chapter])

  if (!open) return null

  const title = mode === 'add' ? 'Nueva tarjeta' : 'Editar tarjeta'
  const canSave =
    question.trim().length > 0 &&
    answer.trim().length > 0 &&
    Number.parseInt(chapter, 10) > 0

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-editor-title"
      onClick={onClose}
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
            ? 'La tarjeta se guardará solo en tu mazo en este dispositivo.'
            : 'Los cambios se guardan solo para ti en este dispositivo.'}
        </p>

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

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={!canSave}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}
