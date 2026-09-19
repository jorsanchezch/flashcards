export type CardProgressStatus = 'known' | 'unknown' | 'unseen'

export type CardProgressEntry = {
  status: CardProgressStatus
  seen: number
  /** ISO timestamps, oldest first; each “Revisada” appends one. */
  reviewedAt: string[]
}

export type UserConfig = {
  shuffle: boolean
  shuffleByChapter: boolean
  studyChapterFrom: number | null
  studyChapterTo: number | null
  lastBook: string | null
  lastChapter: number | null
}

export type CardContentOverride = {
  question: string
  answer: string
}

export type UserAddedCard = {
  id: string
  question: string
  answer: string
  bookId: string
  bookLabel: string
  chapter: number
  canonIndex: number
}

export type UserDeckState = {
  edits: Record<string, CardContentOverride>
  hiddenIds: string[]
  added: UserAddedCard[]
}

export type UserDocument = {
  userId: string
  displayName: string
  updatedAt: string
  config: UserConfig
  progress: Record<string, CardProgressEntry>
  deck: UserDeckState
}

export type RosterUser = {
  id: string
  displayName: string
}

const LAST_USER_KEY = 'flashcards-last-user-id-v1'
const USER_DOC_PREFIX = 'flashcards-user-doc-v1:'
const LEGACY_PROGRESS_KEY = 'olympics-flashcards-progress-v1'

/** Stored in LAST_USER_KEY when the user chose “Continuar sin ID”. */
export const GUEST_SESSION_ID = '__guest__'

/** userId inside the guest JSON document (not a roster member). */
export const GUEST_DOCUMENT_USER_ID = 'guest-anonymous'

export const GUEST_DISPLAY_NAME = 'Invitado (sin ID)'

export const guestRosterUser: RosterUser = {
  id: GUEST_DOCUMENT_USER_ID,
  displayName: GUEST_DISPLAY_NAME,
}

export function isGuestSessionId(sessionId: string | null): boolean {
  return sessionId === GUEST_SESSION_ID
}

export function isGuestDocument(doc: UserDocument | null): boolean {
  return doc?.userId === GUEST_DOCUMENT_USER_ID
}

export function userDocStorageKey(userId: string) {
  return `${USER_DOC_PREFIX}${userId}`
}

export function loadLastUserId(): string | null {
  try {
    return localStorage.getItem(LAST_USER_KEY)
  } catch {
    return null
  }
}

export function saveLastUserId(userId: string) {
  localStorage.setItem(LAST_USER_KEY, userId)
}

export function clearLastUserId() {
  localStorage.removeItem(LAST_USER_KEY)
}

export function defaultUserConfig(): UserConfig {
  return {
    shuffle: false,
    shuffleByChapter: false,
    studyChapterFrom: null,
    studyChapterTo: null,
    lastBook: '1 Samuel',
    lastChapter: 1,
  }
}

export function createEmptyUserDocument(user: RosterUser): UserDocument {
  return {
    userId: user.id,
    displayName: user.displayName,
    updatedAt: new Date().toISOString(),
    config: defaultUserConfig(),
    progress: {},
    deck: { edits: {}, hiddenIds: [], added: [] },
  }
}

function touch(doc: UserDocument): UserDocument {
  return { ...doc, updatedAt: new Date().toISOString() }
}

export function loadGuestDocument(): UserDocument {
  try {
    const raw = localStorage.getItem(userDocStorageKey(GUEST_DOCUMENT_USER_ID))
    if (!raw) return createEmptyUserDocument(guestRosterUser)
    const parsed = JSON.parse(raw) as UserDocument
    return normalizeUserDocument(parsed, guestRosterUser)
  } catch {
    return createEmptyUserDocument(guestRosterUser)
  }
}

export function saveGuestSession() {
  saveLastUserId(GUEST_SESSION_ID)
}

export function loadUserDocument(user: RosterUser): UserDocument {
  try {
    const raw = localStorage.getItem(userDocStorageKey(user.id))
    if (!raw) {
      const migrated = migrateLegacyProgress(user)
      if (migrated) return migrated
      return createEmptyUserDocument(user)
    }
    const parsed = JSON.parse(raw) as UserDocument
    return normalizeUserDocument(parsed, user)
  } catch {
    return createEmptyUserDocument(user)
  }
}

function normalizeUserDocument(
  parsed: Partial<UserDocument>,
  user: RosterUser,
): UserDocument {
  const base = createEmptyUserDocument(user)
  const config = {
    ...base.config,
    ...(parsed.config ?? {}),
  }
  const progress: Record<string, CardProgressEntry> = {}
  if (parsed.progress && typeof parsed.progress === 'object') {
    for (const [id, entry] of Object.entries(parsed.progress)) {
      if (!entry || typeof entry !== 'object') continue
      const status = entry.status
      if (status !== 'known' && status !== 'unknown' && status !== 'unseen') {
        continue
      }
      const reviewedAt: string[] = []
      if (Array.isArray((entry as CardProgressEntry).reviewedAt)) {
        for (const ts of (entry as CardProgressEntry).reviewedAt) {
          if (typeof ts === 'string' && ts) reviewedAt.push(ts)
        }
      }
      progress[id] = {
        status,
        seen: typeof entry.seen === 'number' ? entry.seen : 0,
        reviewedAt,
      }
    }
  }
  const deck = normalizeDeckState(parsed.deck)

  return {
    userId: user.id,
    displayName: user.displayName,
    updatedAt:
      typeof parsed.updatedAt === 'string'
        ? parsed.updatedAt
        : new Date().toISOString(),
    config,
    progress,
    deck,
  }
}

function normalizeDeckState(raw: unknown): UserDeckState {
  const empty = { edits: {}, hiddenIds: [], added: [] } satisfies UserDeckState
  if (!raw || typeof raw !== 'object') return empty

  const edits: Record<string, CardContentOverride> = {}
  const sourceEdits = (raw as UserDeckState).edits
  if (sourceEdits && typeof sourceEdits === 'object') {
    for (const [id, entry] of Object.entries(sourceEdits)) {
      if (!entry || typeof entry !== 'object') continue
      const q = (entry as CardContentOverride).question
      const a = (entry as CardContentOverride).answer
      if (typeof q === 'string' && typeof a === 'string' && q.trim() && a.trim()) {
        edits[id] = { question: q.trim(), answer: a.trim() }
      }
    }
  }

  const hiddenIds: string[] = []
  const sourceHidden = (raw as UserDeckState).hiddenIds
  if (Array.isArray(sourceHidden)) {
    for (const id of sourceHidden) {
      if (typeof id === 'string' && id) hiddenIds.push(id)
    }
  }

  const added: UserAddedCard[] = []
  const sourceAdded = (raw as UserDeckState).added
  if (Array.isArray(sourceAdded)) {
    for (const item of sourceAdded) {
      if (!item || typeof item !== 'object') continue
      const card = item as UserAddedCard
      if (
        typeof card.id === 'string' &&
        typeof card.question === 'string' &&
        typeof card.answer === 'string' &&
        typeof card.bookId === 'string' &&
        typeof card.bookLabel === 'string' &&
        typeof card.chapter === 'number' &&
        typeof card.canonIndex === 'number'
      ) {
        added.push({
          id: card.id,
          question: card.question.trim(),
          answer: card.answer.trim(),
          bookId: card.bookId,
          bookLabel: card.bookLabel,
          chapter: card.chapter,
          canonIndex: card.canonIndex,
        })
      }
    }
  }

  return { edits, hiddenIds, added }
}

function migrateLegacyProgress(user: RosterUser): UserDocument | null {
  try {
    const raw = localStorage.getItem(LEGACY_PROGRESS_KEY)
    if (!raw) return null
    const legacy = JSON.parse(raw) as Record<string, 'known' | 'unknown'>
    const doc = createEmptyUserDocument(user)
    for (const [id, status] of Object.entries(legacy)) {
      if (status === 'known' || status === 'unknown') {
        doc.progress[id] = { status, seen: 1, reviewedAt: [] }
      }
    }
    saveUserDocument(doc)
    localStorage.removeItem(LEGACY_PROGRESS_KEY)
    return doc
  } catch {
    return null
  }
}

export function saveUserDocument(doc: UserDocument) {
  localStorage.setItem(
    userDocStorageKey(doc.userId),
    JSON.stringify(touch(doc)),
  )
}

export function setCardProgress(
  doc: UserDocument,
  cardId: string,
  status: 'known' | 'unknown' | null,
): UserDocument {
  const next = { ...doc, progress: { ...doc.progress } }
  if (status === null) {
    delete next.progress[cardId]
  } else {
    const prev = next.progress[cardId]
    next.progress[cardId] = {
      status,
      seen: (prev?.seen ?? 0) + 1,
      reviewedAt: prev?.reviewedAt ?? [],
    }
  }
  return touch(next)
}

export function recordCardReview(
  doc: UserDocument,
  cardId: string,
): UserDocument {
  const prev = doc.progress[cardId]
  const reviewedAt = [...(prev?.reviewedAt ?? []), new Date().toISOString()]
  const next = { ...doc, progress: { ...doc.progress } }
  next.progress[cardId] = {
    status: 'known',
    seen: (prev?.seen ?? 0) + 1,
    reviewedAt,
  }
  return touch(next)
}

export function getCardReviewTimestamps(
  doc: UserDocument,
  cardId: string,
): string[] {
  return doc.progress[cardId]?.reviewedAt ?? []
}

export function updateUserConfig(
  doc: UserDocument,
  patch: Partial<UserConfig>,
): UserDocument {
  return touch({
    ...doc,
    config: { ...doc.config, ...patch },
  })
}

export function cardStatusFromDoc(
  doc: UserDocument,
  cardId: string,
): 'known' | 'unknown' | undefined {
  const entry = doc.progress[cardId]
  if (!entry || entry.status === 'unseen') return undefined
  return entry.status
}

export function parseImportedUserDocument(
  raw: string,
  expectedUser: RosterUser,
): { ok: true; doc: UserDocument } | { ok: false; message: string } {
  try {
    const parsed = JSON.parse(raw) as Partial<UserDocument>
    if (parsed.userId && parsed.userId !== expectedUser.id) {
      return {
        ok: false,
        message: 'Esa copia es de otra persona del equipo.',
      }
    }
    const doc = normalizeUserDocument(parsed, expectedUser)
    return { ok: true, doc }
  } catch {
    return { ok: false, message: 'No se pudo leer la copia. Comprueba que sea la correcta.' }
  }
}

export function resetDocumentProgress(doc: UserDocument): UserDocument {
  return touch({ ...doc, progress: {} })
}

export function resetDocumentConfig(doc: UserDocument): UserDocument {
  return touch({ ...doc, config: defaultUserConfig() })
}

export function resetDocumentAll(doc: UserDocument): UserDocument {
  return touch({
    ...doc,
    progress: {},
    config: defaultUserConfig(),
    deck: { edits: {}, hiddenIds: [], added: [] },
  })
}

export function resetDocumentDeck(doc: UserDocument): UserDocument {
  const customIds = new Set(doc.deck.added.map((c) => c.id))
  const nextProgress = { ...doc.progress }
  for (const id of customIds) {
    delete nextProgress[id]
  }
  for (const id of doc.deck.hiddenIds) {
    delete nextProgress[id]
  }
  return touch({
    ...doc,
    deck: { edits: {}, hiddenIds: [], added: [] },
    progress: nextProgress,
  })
}

export function setCardContentOverride(
  doc: UserDocument,
  cardId: string,
  question: string,
  answer: string,
  original?: CardContentOverride,
): UserDocument {
  const q = question.trim()
  const a = answer.trim()
  const addedIndex = doc.deck.added.findIndex((c) => c.id === cardId)
  if (addedIndex >= 0) {
    const added = [...doc.deck.added]
    added[addedIndex] = { ...added[addedIndex], question: q, answer: a }
    return touch({ ...doc, deck: { ...doc.deck, added } })
  }
  const edits = { ...doc.deck.edits }
  const matchesOriginal =
    original &&
    q === original.question.trim() &&
    a === original.answer.trim()
  if (matchesOriginal) {
    delete edits[cardId]
  } else {
    edits[cardId] = { question: q, answer: a }
  }
  return touch({ ...doc, deck: { ...doc.deck, edits } })
}

export function revertCardContentOverride(
  doc: UserDocument,
  cardId: string,
): UserDocument {
  if (!doc.deck.edits[cardId]) return doc
  const edits = { ...doc.deck.edits }
  delete edits[cardId]
  return touch({ ...doc, deck: { ...doc.deck, edits } })
}

export function isBuiltInCardEdited(
  doc: UserDocument,
  cardId: string,
): boolean {
  return Boolean(doc.deck.edits[cardId])
}

export function hideCardFromDeck(doc: UserDocument, cardId: string): UserDocument {
  const nextProgress = { ...doc.progress }
  delete nextProgress[cardId]
  const edits = { ...doc.deck.edits }
  delete edits[cardId]

  const isCustom = doc.deck.added.some((c) => c.id === cardId)
  if (isCustom) {
    const added = doc.deck.added.filter((c) => c.id !== cardId)
    return touch({
      ...doc,
      deck: { ...doc.deck, added, edits },
      progress: nextProgress,
    })
  }

  const hiddenIds = doc.deck.hiddenIds.includes(cardId)
    ? doc.deck.hiddenIds
    : [...doc.deck.hiddenIds, cardId]
  return touch({
    ...doc,
    deck: { ...doc.deck, hiddenIds, edits },
    progress: nextProgress,
  })
}

export function addCardToDeck(
  doc: UserDocument,
  card: UserAddedCard,
): UserDocument {
  return touch({
    ...doc,
    deck: { ...doc.deck, added: [...doc.deck.added, card] },
  })
}

export function downloadUserDocument(doc: UserDocument) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.userId}.json`
  a.click()
  URL.revokeObjectURL(url)
}
