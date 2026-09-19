import { useMemo } from 'react'
import { mergeDeckWithUserState } from '@/lib/deckCustomize'
import type { Flashcard } from '@/lib/parseFlashcard'
import type { UserDocument } from '@/lib/userData'

export function useEffectiveFlashcards(
  baseCards: Flashcard[],
  userDoc: UserDocument | null,
): Flashcard[] {
  return useMemo(() => {
    if (!userDoc) return baseCards
    return mergeDeckWithUserState(baseCards, userDoc.deck)
  }, [baseCards, userDoc])
}
