export type CardProgressStatus = 'known' | 'unknown' | 'unseen'

export type CardProgressEntry = {
  status: CardProgressStatus
  seen: number
}

export type UserConfig = {
  shuffle: boolean
  lastBook: string | null
  lastChapter: number | null
}

export type UserDocument = {
  userId: string
  displayName: string
  updatedAt: string
  config: UserConfig
  progress: Record<string, CardProgressEntry>
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
      progress[id] = {
        status,
        seen: typeof entry.seen === 'number' ? entry.seen : 0,
      }
    }
  }
  return {
    userId: user.id,
    displayName: user.displayName,
    updatedAt:
      typeof parsed.updatedAt === 'string'
        ? parsed.updatedAt
        : new Date().toISOString(),
    config,
    progress,
  }
}

function migrateLegacyProgress(user: RosterUser): UserDocument | null {
  try {
    const raw = localStorage.getItem(LEGACY_PROGRESS_KEY)
    if (!raw) return null
    const legacy = JSON.parse(raw) as Record<string, 'known' | 'unknown'>
    const doc = createEmptyUserDocument(user)
    for (const [id, status] of Object.entries(legacy)) {
      if (status === 'known' || status === 'unknown') {
        doc.progress[id] = { status, seen: 1 }
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
    }
  }
  return touch(next)
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
