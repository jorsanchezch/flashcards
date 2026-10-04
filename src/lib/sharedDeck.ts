import {
  emptyDeckState,
  mergeDeckWithUserState,
} from '@/lib/deckCustomize'
import type { Flashcard } from '@/lib/parseFlashcard'
import {
  GROUP_DOCUMENT_USER_ID,
  defaultUserConfig,
  userDocStorageKey,
  type UserAddedCard,
  type UserDeckState,
  type UserDocument,
} from '@/lib/userData'
import { emptyGlossaryOverlay } from '@/lib/glossary'

const SHARED_DECK_KEY = 'flashcards-shared-deck-v1'

export type PendingDeckChange = {
  userId: string
  displayName: string
  editCount: number
  addedCount: number
  hiddenCount: number
  deck: UserDeckState
}

export function normalizeDeckStateLoose(raw: unknown): UserDeckState {
  const empty = emptyDeckState()
  if (!raw || typeof raw !== 'object') return empty
  const source = raw as UserDeckState
  const edits: UserDeckState['edits'] = {}
  if (source.edits && typeof source.edits === 'object') {
    for (const [id, entry] of Object.entries(source.edits)) {
      if (!entry || typeof entry !== 'object') continue
      const q = entry.question
      const a = entry.answer
      if (typeof q === 'string' && typeof a === 'string' && q.trim() && a.trim()) {
        edits[id] = { question: q.trim(), answer: a.trim() }
      }
    }
  }
  const hiddenIds: string[] = []
  if (Array.isArray(source.hiddenIds)) {
    for (const id of source.hiddenIds) {
      if (typeof id === 'string' && id) hiddenIds.push(id)
    }
  }
  const added: UserAddedCard[] = []
  if (Array.isArray(source.added)) {
    for (const item of source.added) {
      if (!item || typeof item !== 'object') continue
      if (
        typeof item.id === 'string' &&
        typeof item.question === 'string' &&
        typeof item.answer === 'string' &&
        typeof item.bookId === 'string' &&
        typeof item.bookLabel === 'string' &&
        typeof item.chapter === 'number'
      ) {
        added.push({
          id: item.id,
          question: item.question.trim(),
          answer: item.answer.trim(),
          bookId: item.bookId,
          bookLabel: item.bookLabel,
          chapter: item.chapter,
          canonIndex: typeof item.canonIndex === 'number' ? item.canonIndex : 0,
          originalNumber:
            typeof item.originalNumber === 'number'
              ? item.originalNumber
              : undefined,
        })
      }
    }
  }
  return { edits, hiddenIds, added }
}

export function loadLocalSharedDeck(): UserDeckState {
  try {
    const raw = localStorage.getItem(SHARED_DECK_KEY)
    if (!raw) return emptyDeckState()
    return normalizeDeckStateLoose(JSON.parse(raw))
  } catch {
    return emptyDeckState()
  }
}

export function saveLocalSharedDeck(deck: UserDeckState) {
  localStorage.setItem(SHARED_DECK_KEY, JSON.stringify(deck))
}

export async function loadPublishedSharedDeck(): Promise<UserDeckState> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/shared-deck.json`)
    if (!res.ok) return emptyDeckState()
    return normalizeDeckStateLoose(await res.json())
  } catch {
    return emptyDeckState()
  }
}

export function mergeSharedLayers(
  published: UserDeckState,
  local: UserDeckState,
): UserDeckState {
  const edits = { ...published.edits, ...local.edits }
  const hiddenIds = [...new Set([...published.hiddenIds, ...local.hiddenIds])]
  const addedById = new Map<string, UserAddedCard>()
  for (const card of published.added) addedById.set(card.id, card)
  for (const card of local.added) addedById.set(card.id, card)
  return { edits, hiddenIds, added: [...addedById.values()] }
}

export function applySharedThenPersonal(
  baseCards: Flashcard[],
  shared: UserDeckState,
  personal: UserDeckState | null,
): Flashcard[] {
  const withShared = mergeDeckWithUserState(baseCards, shared)
  if (!personal) return withShared
  return mergeDeckWithUserState(withShared, personal)
}

export function deckHasChanges(deck: UserDeckState): boolean {
  return (
    Object.keys(deck.edits).length > 0 ||
    deck.hiddenIds.length > 0 ||
    deck.added.length > 0
  )
}

export function collectPendingDeckChanges(
  adminUserId: string,
): PendingDeckChange[] {
  const pending: PendingDeckChange[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('flashcards-user-doc-v1:')) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as Partial<UserDocument>
      const userId = typeof parsed.userId === 'string' ? parsed.userId : ''
      if (!userId || userId === adminUserId) continue
      const deck = normalizeDeckStateLoose(parsed.deck)
      if (!deckHasChanges(deck)) continue
      pending.push({
        userId,
        displayName:
          typeof parsed.displayName === 'string' && parsed.displayName.trim()
            ? parsed.displayName
            : userId === GROUP_DOCUMENT_USER_ID
              ? 'Equipo'
              : userId,
        editCount: Object.keys(deck.edits).length,
        addedCount: deck.added.length,
        hiddenCount: deck.hiddenIds.length,
        deck,
      })
    }
  } catch {
    return pending
  }
  pending.sort((a, b) => a.displayName.localeCompare(b.displayName, 'es'))
  return pending
}

export function mutateSharedDeck(
  shared: UserDeckState,
  fn: (doc: UserDocument) => UserDocument,
): UserDeckState {
  const doc: UserDocument = {
    userId: 'shared-deck',
    displayName: 'Mazo del curso',
    updatedAt: new Date().toISOString(),
    config: defaultUserConfig(),
    progress: {},
    deck: shared,
    glossary: emptyGlossaryOverlay(),
  }
  return fn(doc).deck
}

export function mergeDeckIntoShared(
  shared: UserDeckState,
  incoming: UserDeckState,
): UserDeckState {
  return mergeSharedLayers(shared, incoming)
}

export function clearAuthorDeckOverlay(userId: string) {
  try {
    const key = userDocStorageKey(userId)
    const raw = localStorage.getItem(key)
    if (!raw) return
    const parsed = JSON.parse(raw) as UserDocument
    parsed.deck = emptyDeckState()
    parsed.updatedAt = new Date().toISOString()
    localStorage.setItem(key, JSON.stringify(parsed))
  } catch {
    /* ignore */
  }
}
