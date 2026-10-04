import { useMemo } from 'react'
import { applySharedThenPersonal } from '@/lib/sharedDeck'
import type { Flashcard } from '@/lib/parseFlashcard'
import { emptyDeckState } from '@/lib/deckCustomize'
import type { UserDocument } from '@/lib/userData'
import { useUser } from '@/context/UserContext'

export function useEffectiveFlashcards(
  baseCards: Flashcard[],
  userDoc: UserDocument | null,
): Flashcard[] {
  const { sharedDeck, isAdmin } = useUser()
  return useMemo(() => {
    const personal = isAdmin ? emptyDeckState() : userDoc?.deck ?? emptyDeckState()
    return applySharedThenPersonal(baseCards, sharedDeck, personal)
  }, [baseCards, userDoc, sharedDeck, isAdmin])
}
