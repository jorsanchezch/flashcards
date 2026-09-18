import { assignBiblicalLocation } from '@/lib/biblical'
import { chapterSlugFromPath, chapterTitle } from '@/lib/chapters'

export type Flashcard = {
  id: string
  path: string
  chapterSlug: string
  chapterTitle: string
  bookId: string
  bookLabel: string
  chapter: number
  canonIndex: number
  question: string
  answer: string
  noteLink?: string
}

export function parseFlashcardMarkdown(
  raw: string,
  filePath: string,
): Flashcard {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const chapterSlug = chapterSlugFromPath(filePath)

  let question = ''
  let answer = ''
  let footerLabel: string | undefined
  let noteLink: string | undefined
  let phase: 'meta' | 'question' | 'answer' = 'meta'

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '#flashcard') continue

    if (trimmed === '?') {
      phase = 'answer'
      continue
    }

    if (phase === 'meta') {
      if (trimmed.startsWith('# ')) {
        question = trimmed.slice(2).trim()
        phase = 'question'
      } else if (trimmed.startsWith('#')) {
        question = trimmed.replace(/^#+\s*/, '').trim()
        phase = 'question'
      }
      continue
    }

    if (phase === 'question') {
      if (trimmed === '---') break
      if (trimmed.startsWith('[[')) {
        const m = trimmed.match(/\[\[([^|\]]+)\|([^\]]+)\]\]/)
        if (m) {
          noteLink = m[1]
          footerLabel = m[2]
        }
        break
      }
      if (trimmed && trimmed !== '?') {
        question = question ? `${question} ${trimmed}` : trimmed
      }
      continue
    }

    if (phase === 'answer') {
      if (trimmed === '---') {
        continue
      }
      if (trimmed.startsWith('[[')) {
        const m = trimmed.match(/\[\[([^|\]]+)\|([^\]]+)\]\]/)
        if (m) {
          noteLink = m[1]
          footerLabel = m[2]
        }
        break
      }
      if (trimmed) {
        answer = answer ? `${answer}\n${trimmed}` : trimmed
      }
    }
  }

  if (!question) {
    throw new Error(`No se encontró la pregunta en ${filePath}`)
  }
  if (!answer) {
    throw new Error(`No se encontró la respuesta en ${filePath}`)
  }

  const id = filePath.replace(/\.md$/, '')
  const resolvedChapterTitle = chapterTitle(chapterSlug, footerLabel)
  const biblical = assignBiblicalLocation(answer, chapterSlug, footerLabel)

  return {
    id,
    path: filePath,
    chapterSlug,
    chapterTitle: resolvedChapterTitle,
    bookId: biblical.bookId,
    bookLabel: biblical.bookLabel,
    chapter: biblical.chapter,
    canonIndex: biblical.canonIndex,
    question,
    answer,
    noteLink,
  }
}
