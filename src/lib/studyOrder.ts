import type { Flashcard } from '@/lib/parseFlashcard'
import { compareFlashcardsByCanon } from '@/lib/biblical'
import { shuffleIds } from '@/lib/shuffle'

export function filterCardsByChapterRange(
  cards: Flashcard[],
  from: number | null,
  to: number | null,
): Flashcard[] {
  if (from == null && to == null) return cards
  return cards.filter((c) => {
    if (from != null && c.chapter < from) return false
    if (to != null && c.chapter > to) return false
    return true
  })
}

export function buildStudyOrder(
  cards: Flashcard[],
  options: { shuffle: boolean; shuffleByChapter: boolean },
): string[] {
  const sorted = [...cards].sort(compareFlashcardsByCanon)
  const ids = sorted.map((c) => c.id)
  if (!options.shuffle) return ids
  if (!options.shuffleByChapter) return shuffleIds(ids)

  const byChapter = new Map<number, string[]>()
  for (const card of sorted) {
    const list = byChapter.get(card.chapter) ?? []
    list.push(card.id)
    byChapter.set(card.chapter, list)
  }
  const chapters = [...byChapter.keys()].sort((a, b) => a - b)
  const result: string[] = []
  for (const ch of chapters) {
    result.push(...shuffleIds(byChapter.get(ch)!))
  }
  return result
}

export function reshuffleWithinChapter(
  order: string[],
  cardMap: Map<string, Flashcard>,
  currentId: string,
): { order: string[]; index: number } {
  const current = cardMap.get(currentId)
  if (!current) {
    return { order: shuffleIds(order), index: 0 }
  }
  const chapter = current.chapter
  const shuffledChapter = shuffleIds(
    order.filter((id) => cardMap.get(id)?.chapter === chapter),
  )
  const nextOrder: string[] = []
  let replaced = false
  for (const id of order) {
    if (cardMap.get(id)?.chapter === chapter) {
      if (!replaced) {
        nextOrder.push(...shuffledChapter)
        replaced = true
      }
      continue
    }
    nextOrder.push(id)
  }
  const nextIndex = nextOrder.indexOf(currentId)
  return {
    order: nextOrder,
    index: nextIndex >= 0 ? nextIndex : 0,
  }
}
