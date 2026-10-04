import {
  emptyGlossaryOverlay,
  isCustomGlossaryId,
  normalizeGlossaryEntry,
  normalizeGlossaryOverlay,
  type GlossaryEntry,
  type GlossaryOverlay,
} from '@/lib/glossary'
import {
  parseDeckGroupings,
  setBookRangeGrouping,
  setCardIdsGrouping,
  type DeckGrouping,
} from '@/lib/deckFilter'

export type { GlossaryEntry, GlossaryOverlay }

export type CardProgressStatus =
  | 'known'
  | 'unknown'
  | 'reviewed'
  | 'unseen'

export type CardProgressEntry = {
  status: CardProgressStatus
  seen: number
  /** ISO timestamps, oldest first; each “Revisada” appends one. */
  reviewedAt: string[]
}

export type UserConfig = {
  /** Active grouping clauses (book range, glossary words, …). AND between kinds. */
  groupings: DeckGrouping[]
  /** Temporary shuffle of the current filtered pool. */
  shuffle: boolean
  lastBook: string | null
  lastChapter: number | null
  /** Saved study-queue order (card ids) for this session. */
  studySessionOrder: string[] | null
  /** 0-based index in studySessionOrder. */
  studySessionIndex: number
  /** @deprecated migrated into groupings */
  shuffleByChapter?: boolean
  studyChapterFrom?: number | null
  studyChapterTo?: number | null
  studyGroupCardIds?: string[] | null
  studyGroupLabel?: string | null
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
  originalNumber?: number
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
  glossary: GlossaryOverlay
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

/** Legacy guest silo (migrated to the shared Equipo document). */
export const GUEST_DOCUMENT_USER_ID = 'guest-anonymous'

export const GUEST_DISPLAY_NAME = 'Invitado (sin ID)'

/** Shared group deck status used when no named user is selected. */
export const GROUP_DOCUMENT_USER_ID = 'equipo'
export const GROUP_DISPLAY_NAME = 'Equipo'

export const guestRosterUser: RosterUser = {
  id: GROUP_DOCUMENT_USER_ID,
  displayName: GROUP_DISPLAY_NAME,
}

export const groupRosterUser: RosterUser = guestRosterUser

export function isGuestSessionId(sessionId: string | null): boolean {
  return sessionId === GUEST_SESSION_ID
}

export function isGroupDocument(doc: UserDocument | null): boolean {
  return (
    doc?.userId === GROUP_DOCUMENT_USER_ID ||
    doc?.userId === GUEST_DOCUMENT_USER_ID
  )
}

export function isGuestDocument(doc: UserDocument | null): boolean {
  return isGroupDocument(doc)
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
    groupings: [],
    shuffle: false,
    lastBook: null,
    lastChapter: null,
    studySessionOrder: null,
    studySessionIndex: 0,
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
    glossary: emptyGlossaryOverlay(),
  }
}

function touch(doc: UserDocument): UserDocument {
  return { ...doc, updatedAt: new Date().toISOString() }
}

export function loadGuestDocument(): UserDocument {
  return loadGroupDocument()
}

function readStoredDocument(userId: string, user: RosterUser): UserDocument | null {
  try {
    const raw = localStorage.getItem(userDocStorageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserDocument
    return normalizeUserDocument(parsed, user)
  } catch {
    return null
  }
}

export function loadGroupDocument(): UserDocument {
  const grupo = readStoredDocument(GROUP_DOCUMENT_USER_ID, groupRosterUser)
  if (grupo && Object.keys(grupo.progress).length > 0) {
    return grupo
  }
  const legacy = readStoredDocument(GUEST_DOCUMENT_USER_ID, groupRosterUser)
  if (legacy && Object.keys(legacy.progress).length > 0) {
    const migrated: UserDocument = {
      ...legacy,
      userId: GROUP_DOCUMENT_USER_ID,
      displayName: GROUP_DISPLAY_NAME,
    }
    saveUserDocument(migrated)
    return migrated
  }
  return grupo ?? createEmptyUserDocument(groupRosterUser)
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

function migrateLegacyGroupings(raw: Partial<UserConfig>): DeckGrouping[] {
  let groupings: DeckGrouping[] = []
  const groupIds = Array.isArray(raw.studyGroupCardIds)
    ? raw.studyGroupCardIds.filter(
        (id): id is string => typeof id === 'string' && id.length > 0,
      )
    : []
  if (groupIds.length) {
    groupings = setCardIdsGrouping(
      groupings,
      groupIds,
      typeof raw.studyGroupLabel === 'string' ? raw.studyGroupLabel : null,
    )
  }
  const bookLabel =
    typeof raw.lastBook === 'string' && raw.lastBook.trim()
      ? raw.lastBook.trim()
      : null
  const bookId = bookIdFromLegacyLabel(bookLabel)
  const from =
    typeof raw.studyChapterFrom === 'number' && raw.studyChapterFrom > 0
      ? Math.floor(raw.studyChapterFrom)
      : null
  const to =
    typeof raw.studyChapterTo === 'number' && raw.studyChapterTo > 0
      ? Math.floor(raw.studyChapterTo)
      : null
  if (bookId && (from != null || to != null)) {
    groupings = setBookRangeGrouping(groupings, bookId, from, to)
  }
  return groupings
}

function bookIdFromLegacyLabel(label: string | null): string | null {
  if (!label) return null
  const map: Record<string, string> = {
    '1 Samuel': '1-samuel',
    '2 Samuel': '2-samuel',
    '1 Reyes': '1-reyes',
    '2 Reyes': '2-reyes',
  }
  return map[label] ?? null
}

function normalizeUserDocument(
  parsed: Partial<UserDocument>,
  user: RosterUser,
): UserDocument {
  const base = createEmptyUserDocument(user)
  const rawConfig = (parsed.config ?? {}) as Partial<UserConfig>
  const sessionOrder = Array.isArray(rawConfig.studySessionOrder)
    ? rawConfig.studySessionOrder.filter(
        (id): id is string => typeof id === 'string' && id.length > 0,
      )
    : null
  const rawIndex = rawConfig.studySessionIndex
  const sessionIndex =
    typeof rawIndex === 'number' && Number.isFinite(rawIndex)
      ? Math.max(0, Math.floor(rawIndex))
      : 0

  let groupings = parseDeckGroupings(rawConfig.groupings)
  if (!groupings.length) {
    groupings = migrateLegacyGroupings(rawConfig)
  }

  const config: UserConfig = {
    ...base.config,
    lastBook:
      typeof rawConfig.lastBook === 'string' && rawConfig.lastBook.trim()
        ? rawConfig.lastBook.trim()
        : null,
    lastChapter:
      typeof rawConfig.lastChapter === 'number' && rawConfig.lastChapter > 0
        ? Math.floor(rawConfig.lastChapter)
        : null,
    groupings,
    shuffle: Boolean(rawConfig.shuffle),
    studySessionOrder: sessionOrder?.length ? sessionOrder : null,
    studySessionIndex: sessionIndex,
  }
  const progress: Record<string, CardProgressEntry> = {}
  if (parsed.progress && typeof parsed.progress === 'object') {
    for (const [id, entry] of Object.entries(parsed.progress)) {
      if (!entry || typeof entry !== 'object') continue
      let status = entry.status
      if (
        status !== 'known' &&
        status !== 'unknown' &&
        status !== 'reviewed' &&
        status !== 'unseen'
      ) {
        continue
      }
      const reviewedAt: string[] = []
      if (Array.isArray((entry as CardProgressEntry).reviewedAt)) {
        for (const ts of (entry as CardProgressEntry).reviewedAt) {
          if (typeof ts === 'string' && ts) reviewedAt.push(ts)
        }
      }
      if (status === 'known' && reviewedAt.length > 0) {
        status = 'reviewed'
      }
      progress[id] = {
        status,
        seen: typeof entry.seen === 'number' ? entry.seen : 0,
        reviewedAt,
      }
    }
  }
  const deck = normalizeDeckState(parsed.deck)
  const glossary = normalizeGlossaryOverlay(
    (parsed as Partial<UserDocument>).glossary,
  )

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
    glossary,
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
          originalNumber:
            typeof card.originalNumber === 'number' &&
            Number.isFinite(card.originalNumber)
              ? Math.floor(card.originalNumber)
              : undefined,
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
  const stored: UserDocument = isGroupDocument(doc)
    ? {
        ...doc,
        userId: GROUP_DOCUMENT_USER_ID,
        displayName: GROUP_DISPLAY_NAME,
      }
    : doc
  localStorage.setItem(
    userDocStorageKey(stored.userId),
    JSON.stringify(touch(stored)),
  )
}

export function setCardProgress(
  doc: UserDocument,
  cardId: string,
  status: 'known' | 'unknown' | 'reviewed' | null,
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
    status: 'reviewed',
    seen: (prev?.seen ?? 0) + 1,
    reviewedAt,
  }
  return touch(next)
}

export function markCardsReviewed(
  doc: UserDocument,
  cardIds: string[],
): UserDocument {
  if (!cardIds.length) return doc
  const now = new Date().toISOString()
  const progress = { ...doc.progress }
  for (const cardId of cardIds) {
    const prev = progress[cardId]
    progress[cardId] = {
      status: 'reviewed',
      seen: (prev?.seen ?? 0) + 1,
      reviewedAt: [...(prev?.reviewedAt ?? []), now],
    }
  }
  return touch({ ...doc, progress })
}

export function setStudyGroup(
  doc: UserDocument,
  cardIds: string[],
  label: string | null,
): UserDocument {
  return updateUserConfig(doc, {
    groupings: setCardIdsGrouping(doc.config.groupings, cardIds, label),
    studySessionOrder: null,
    studySessionIndex: 0,
  })
}

export function clearStudyGroup(doc: UserDocument): UserDocument {
  return updateUserConfig(doc, {
    groupings: setCardIdsGrouping(doc.config.groupings, [], null),
    studySessionOrder: null,
    studySessionIndex: 0,
  })
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
): 'known' | 'unknown' | 'reviewed' | undefined {
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
      const expectedIsGroup =
        expectedUser.id === GROUP_DOCUMENT_USER_ID
      const incomingIsGroup =
        parsed.userId === GROUP_DOCUMENT_USER_ID ||
        parsed.userId === GUEST_DOCUMENT_USER_ID
      if (!(expectedIsGroup && incomingIsGroup)) {
        return {
          ok: false,
          message: 'Esa copia es de otra persona del equipo.',
        }
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
    glossary: emptyGlossaryOverlay(),
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

export function saveGlossaryEntry(
  doc: UserDocument,
  entry: GlossaryEntry,
): UserDocument {
  const normalized = normalizeGlossaryEntry(entry, entry.id)
  if (!normalized) return doc
  const glossary = {
    added: [...doc.glossary.added],
    updates: { ...doc.glossary.updates },
    hiddenIds: doc.glossary.hiddenIds.filter((id) => id !== normalized.id),
  }

  if (isCustomGlossaryId(normalized.id)) {
    const index = glossary.added.findIndex((item) => item.id === normalized.id)
    if (index >= 0) glossary.added[index] = normalized
    else glossary.added.push(normalized)
    return touch({ ...doc, glossary })
  }

  glossary.updates[normalized.id] = {
    term: normalized.term,
    aliases: normalized.aliases,
    kind: normalized.kind,
    note: normalized.note,
    properName: normalized.properName,
  }
  return touch({ ...doc, glossary })
}

export function hideGlossaryEntry(
  doc: UserDocument,
  entryId: string,
): UserDocument {
  if (isCustomGlossaryId(entryId)) {
    return touch({
      ...doc,
      glossary: {
        ...doc.glossary,
        added: doc.glossary.added.filter((item) => item.id !== entryId),
      },
    })
  }
  if (doc.glossary.hiddenIds.includes(entryId)) return doc
  const updates = { ...doc.glossary.updates }
  delete updates[entryId]
  return touch({
    ...doc,
    glossary: {
      ...doc.glossary,
      updates,
      hiddenIds: [...doc.glossary.hiddenIds, entryId],
    },
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
