import { compareFlashcardsByCanon, type BiblicalLocation } from '@/lib/biblical'
import type { Flashcard } from '@/lib/parseFlashcard'
import type { UserAddedCard, UserDeckState } from '@/lib/userData'

export function emptyDeckState(): UserDeckState {
  return { edits: {}, hiddenIds: [], added: [] }
}

export function userAddedToFlashcard(card: UserAddedCard): Flashcard {
  const chapterSlug = `custom-${card.bookId}-ch${card.chapter}`
  const biblical: BiblicalLocation = {
    bookId: card.bookId,
    bookLabel: card.bookLabel,
    chapter: card.chapter,
    canonIndex: card.canonIndex,
  }
  return {
    id: card.id,
    path: card.id,
    chapterSlug,
    chapterTitle: `${card.bookLabel} ${card.chapter}`,
    bookId: biblical.bookId,
    bookLabel: biblical.bookLabel,
    chapter: biblical.chapter,
    canonIndex: biblical.canonIndex,
    question: card.question,
    answer: card.answer,
  }
}

export function mergeDeckWithUserState(
  baseCards: Flashcard[],
  deck: UserDeckState,
): Flashcard[] {
  const hidden = new Set(deck.hiddenIds)
  const merged: Flashcard[] = []

  for (const card of baseCards) {
    if (hidden.has(card.id)) continue
    const edit = deck.edits[card.id]
    if (edit) {
      merged.push({
        ...card,
        question: edit.question,
        answer: edit.answer,
      })
    } else {
      merged.push(card)
    }
  }

  for (const added of deck.added) {
    merged.push(userAddedToFlashcard(added))
  }

  merged.sort(compareFlashcardsByCanon)
  return merged
}

export function createUserAddedCard(
  question: string,
  answer: string,
  book: { id: string; label: string; canonIndex: number },
  chapter: number,
): UserAddedCard {
  return {
    id: `custom/${crypto.randomUUID()}`,
    question: question.trim(),
    answer: answer.trim(),
    bookId: book.id,
    bookLabel: book.label,
    chapter,
    canonIndex: book.canonIndex,
  }
}
