import type { Flashcard } from '@/lib/parseFlashcard'
import type { UserConfig } from '@/lib/userData'
import { filterCardsByChapterRange } from '@/lib/studyOrder'

export function filterCardsByIds(
  cards: Flashcard[],
  ids: string[] | null | undefined,
): Flashcard[] {
  if (!ids?.length) return cards
  const set = new Set(ids)
  return cards.filter((c) => set.has(c.id))
}

export function resolveStudyPool(
  cards: Flashcard[],
  config: UserConfig,
): Flashcard[] {
  const fromGroup = filterCardsByIds(cards, config.studyGroupCardIds)
  if (config.studyGroupCardIds?.length) {
    return fromGroup
  }
  return filterCardsByChapterRange(
    cards,
    config.studyChapterFrom,
    config.studyChapterTo,
  )
}

export function cardsInBookChapterRange(
  cards: Flashcard[],
  bookId: string,
  from: number,
  to: number,
): Flashcard[] {
  return cards.filter(
    (c) =>
      c.bookId === bookId && c.chapter >= from && c.chapter <= to,
  )
}
