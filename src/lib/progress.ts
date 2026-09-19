import type { UserDocument } from '@/lib/userData'
import {
  cardStatusFromDoc,
  getCardReviewTimestamps,
  recordCardReview,
  setCardProgress,
  saveUserDocument,
} from '@/lib/userData'

export type CardStatus = 'known' | 'unknown'

export type ProgressMap = Record<string, CardStatus>

export function progressMapFromDocument(doc: UserDocument): ProgressMap {
  const map: ProgressMap = {}
  for (const [id, entry] of Object.entries(doc.progress)) {
    if (entry.status === 'known' || entry.status === 'unknown') {
      map[id] = entry.status
    }
  }
  return map
}

export function applyCardStatus(
  doc: UserDocument,
  id: string,
  status: CardStatus | null,
): UserDocument {
  const next = setCardProgress(doc, id, status)
  saveUserDocument(next)
  return next
}

export function getCardStatus(
  doc: UserDocument,
  cardId: string,
): CardStatus | undefined {
  return cardStatusFromDoc(doc, cardId)
}

export function applyCardReview(
  doc: UserDocument,
  cardId: string,
): UserDocument {
  const next = recordCardReview(doc, cardId)
  saveUserDocument(next)
  return next
}

export function getReviewHistory(
  doc: UserDocument,
  cardId: string,
): string[] {
  return getCardReviewTimestamps(doc, cardId)
}
