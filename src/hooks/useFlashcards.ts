import { useCallback, useEffect, useState } from 'react'
import { compareFlashcardsByCanon } from '@/lib/biblical'
import { parseFlashcardMarkdown, type Flashcard } from '@/lib/parseFlashcard'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; cards: Flashcard[] }

type Manifest = {
  files: string[]
  count: number
}

export function useFlashcards() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  const reload = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const base = import.meta.env.BASE_URL
      const manifestRes = await fetch(`${base}flashcards/manifest.json`)
      if (!manifestRes.ok) {
        throw new Error(
          `No se pudo cargar el índice de tarjetas (${manifestRes.status})`,
        )
      }
      const manifest = (await manifestRes.json()) as Manifest
      if (!manifest.files?.length) {
        throw new Error('El índice de tarjetas está vacío')
      }

      const cards: Flashcard[] = []
      const errors: string[] = []

      await Promise.all(
        manifest.files.map(async (file) => {
          try {
            const res = await fetch(`${base}flashcards/${file}`)
            if (!res.ok) {
              errors.push(`${file}: HTTP ${res.status}`)
              return
            }
            const text = await res.text()
            cards.push(parseFlashcardMarkdown(text, file))
          } catch (e) {
            errors.push(
              `${file}: ${e instanceof Error ? e.message : 'error desconocido'}`,
            )
          }
        }),
      )

      if (!cards.length) {
        throw new Error(
          errors[0] ?? 'No se pudieron cargar las tarjetas',
        )
      }

      cards.sort(compareFlashcardsByCanon)

      setState({ status: 'ready', cards })
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Error al cargar tarjetas',
      })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { state, reload }
}
