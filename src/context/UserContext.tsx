import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearLastUserId,
  downloadUserDocument,
  guestRosterUser,
  isGuestDocument,
  isGuestSessionId,
  loadGroupDocument,
  loadLastUserId,
  loadUserDocument,
  parseImportedUserDocument,
  saveGuestSession,
  saveLastUserId,
  saveUserDocument,
  resetDocumentAll,
  resetDocumentConfig,
  resetDocumentDeck,
  resetDocumentProgress,
  addCardToDeck,
  hideCardFromDeck,
  setCardContentOverride,
  revertCardContentOverride,
  saveGlossaryEntry as saveGlossaryEntryInDoc,
  hideGlossaryEntry as hideGlossaryEntryInDoc,
  updateUserConfig,
  markCardsReviewed,
  setStudyGroup as setStudyGroupInDoc,
  clearStudyGroup as clearStudyGroupInDoc,
  type CardContentOverride,
  type GlossaryEntry,
  type RosterUser,
  type UserConfig,
  type UserDeckState,
  type UserDocument,
} from '@/lib/userData'
import { createUserAddedCard, emptyDeckState } from '@/lib/deckCustomize'
import { BIBLE_BOOKS } from '@/lib/biblical'
import { applyCardReview, applyCardStatus, type CardStatus } from '@/lib/progress'
import {
  loadPublishedTeamProgress,
  mergeGroupDocWithPublished,
} from '@/lib/teamProgress'
import {
  adminNeedsPasswordSetup,
  isAdminUserId,
  loadAdminRecords,
  setupAdminSecretIfMissing,
  verifyAdminSecret,
  type AdminRecord,
} from '@/lib/adminAuth'
import {
  clearAuthorDeckOverlay,
  collectPendingDeckChanges,
  loadLocalSharedDeck,
  loadPublishedSharedDeck,
  mergeDeckIntoShared,
  mergeSharedLayers,
  mutateSharedDeck,
  saveLocalSharedDeck,
  type PendingDeckChange,
} from '@/lib/sharedDeck'

type UserContextValue = {
  roster: RosterUser[]
  currentUser: RosterUser | null
  userDoc: UserDocument | null
  groupDoc: UserDocument
  isGuest: boolean
  isAdmin: boolean
  hasSession: boolean
  continueAsGuest: () => void
  selectUser: (user: RosterUser) => void
  unlockAdmin: (
    user: RosterUser,
    secret: string,
  ) => Promise<{ ok: true } | { ok: false; message: string; needsSetup?: boolean }>
  isAdminAccount: (userId: string) => boolean
  signOut: () => void
  setCardStatus: (cardId: string, status: CardStatus | null) => void
  recordCardReview: (cardId: string) => void
  markManyReviewed: (cardIds: string[]) => void
  setStudyGroup: (cardIds: string[], label: string | null) => void
  clearStudyGroup: () => void
  patchConfig: (patch: Partial<UserConfig>) => void
  replaceDocument: (doc: UserDocument) => void
  exportDocument: () => void
  importDocument: (
    file: File,
  ) => Promise<{ ok: true } | { ok: false; message: string }>
  resetProgress: () => void
  resetConfig: () => void
  resetAllLocalData: () => void
  resetDeckToOriginal: () => void
  saveCardContent: (
    cardId: string,
    question: string,
    answer: string,
    original?: CardContentOverride,
  ) => void
  revertCardContent: (cardId: string) => void
  addCustomCard: (
    question: string,
    answer: string,
    bookId: string,
    chapter: number,
    originalNumber?: number,
  ) => string | null
  removeCardFromDeck: (cardId: string) => void
  saveGlossaryEntry: (entry: GlossaryEntry) => void
  deleteGlossaryEntry: (entryId: string) => void
  sharedDeckHasChanges: boolean
  listPendingChanges: () => PendingDeckChange[]
  persistPendingChange: (userId: string) => void
  sharedDeck: UserDeckState
}

const UserContext = createContext<UserContextValue | null>(null)

type UserProviderProps = {
  roster: RosterUser[]
  children: ReactNode
}

export function UserProvider({ roster, children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<RosterUser | null>(null)
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null)
  const [groupDoc, setGroupDoc] = useState<UserDocument>(() =>
    loadGroupDocument(),
  )
  const [admins, setAdmins] = useState<AdminRecord[]>([])
  const [sharedDeck, setSharedDeck] = useState(emptyDeckState)

  const rosterById = useMemo(
    () => new Map(roster.map((u) => [u.id, u])),
    [roster],
  )

  const commitDoc = useCallback((next: UserDocument) => {
    saveUserDocument(next)
    if (isGuestDocument(next)) {
      const normalized: UserDocument = {
        ...next,
        userId: next.userId,
        displayName: next.displayName,
      }
      setGroupDoc(normalized)
    }
    return next
  }, [])

  useEffect(() => {
    if (!roster.length) return
    let cancelled = false
    const boot = async () => {
      let group = loadGroupDocument()
      const published = await loadPublishedTeamProgress()
      if (published) {
        const merged = mergeGroupDocWithPublished(group, published)
        if (merged !== group) {
          saveUserDocument(merged)
          group = merged
        }
      }
      const publishedShared = await loadPublishedSharedDeck()
      const localShared = loadLocalSharedDeck()
      const records = await loadAdminRecords()
      if (cancelled) return
      setAdmins(records)
      setSharedDeck(mergeSharedLayers(publishedShared, localShared))
      setGroupDoc(group)
      const lastId = loadLastUserId()
      if (!lastId) return
      if (isGuestSessionId(lastId)) {
        setCurrentUser(null)
        setUserDoc(group)
        return
      }
      const user = rosterById.get(lastId)
      if (!user) return
      if (isAdminUserId(user.id, records)) {
        return
      }
      setCurrentUser(user)
      setUserDoc(loadUserDocument(user))
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [roster.length, rosterById])

  const continueAsGuest = useCallback(() => {
    saveGuestSession()
    const latest = loadGroupDocument()
    setCurrentUser(null)
    setGroupDoc(latest)
    setUserDoc(latest)
  }, [])

  const selectUser = useCallback((user: RosterUser) => {
    if (isAdminUserId(user.id, admins)) return
    saveLastUserId(user.id)
    setCurrentUser(user)
    setUserDoc(loadUserDocument(user))
  }, [admins])

  const unlockAdmin = useCallback(
    async (user: RosterUser, secret: string) => {
      if (!isAdminUserId(user.id, admins)) {
        return { ok: false as const, message: 'Esa cuenta no es de administración.' }
      }
      if (adminNeedsPasswordSetup(user.id, admins)) {
        const setup = await setupAdminSecretIfMissing(user.id, secret, admins)
        if (!setup.ok) return setup
      } else {
        const ok = await verifyAdminSecret(user.id, secret, admins)
        if (!ok) {
          return { ok: false as const, message: 'La clave no es correcta.' }
        }
      }
      saveLastUserId(user.id)
      setCurrentUser(user)
      setUserDoc(loadUserDocument(user))
      return { ok: true as const }
    },
    [admins],
  )

  const isAdminAccount = useCallback(
    (userId: string) => isAdminUserId(userId, admins),
    [admins],
  )

  const isAdmin = Boolean(
    currentUser && isAdminUserId(currentUser.id, admins),
  )

  const signOut = useCallback(() => {
    clearLastUserId()
    setCurrentUser(null)
    setUserDoc(null)
  }, [])

  const setCardStatus = useCallback(
    (cardId: string, status: CardStatus | null) => {
      setUserDoc((doc) => {
        if (!doc) return doc
        const next = applyCardStatus(doc, cardId, status)
        return commitDoc(next)
      })
    },
    [commitDoc],
  )

  const recordCardReview = useCallback((cardId: string) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = applyCardReview(doc, cardId)
      return commitDoc(next)
    })
  }, [commitDoc])

  const markManyReviewed = useCallback((cardIds: string[]) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = markCardsReviewed(doc, cardIds)
      return commitDoc(next)
    })
  }, [])

  const setStudyGroup = useCallback((cardIds: string[], label: string | null) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = setStudyGroupInDoc(doc, cardIds, label)
      return commitDoc(next)
    })
  }, [])

  const clearStudyGroup = useCallback(() => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = clearStudyGroupInDoc(doc)
      return commitDoc(next)
    })
  }, [])

  const patchConfig = useCallback((patch: Partial<UserConfig>) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = updateUserConfig(doc, patch)
      return commitDoc(next)
    })
  }, [])

  const replaceDocument = useCallback((doc: UserDocument) => {
    commitDoc(doc)
    setUserDoc(doc)
  }, [commitDoc])

  const exportDocument = useCallback(() => {
    if (!userDoc) return
    downloadUserDocument(userDoc)
  }, [userDoc])

  const applyReset = useCallback((fn: (doc: UserDocument) => UserDocument) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      return commitDoc(fn(doc))
    })
  }, [commitDoc])

  const resetProgress = useCallback(() => {
    applyReset(resetDocumentProgress)
  }, [applyReset])

  const resetConfig = useCallback(() => {
    applyReset(resetDocumentConfig)
  }, [applyReset])

  const resetAllLocalData = useCallback(() => {
    applyReset(resetDocumentAll)
  }, [applyReset])

  const resetDeckToOriginal = useCallback(() => {
    applyReset(resetDocumentDeck)
  }, [applyReset])

  const saveCardContent = useCallback(
    (
      cardId: string,
      question: string,
      answer: string,
      original?: CardContentOverride,
    ) => {
      if (isAdmin) {
        setSharedDeck((deck) => {
          const next = mutateSharedDeck(deck, (doc) =>
            setCardContentOverride(doc, cardId, question, answer, original),
          )
          saveLocalSharedDeck(next)
          return next
        })
        return
      }
      setUserDoc((doc) => {
        if (!doc) return doc
        const next = setCardContentOverride(
          doc,
          cardId,
          question,
          answer,
          original,
        )
        return commitDoc(next)
      })
    },
    [commitDoc, isAdmin],
  )

  const revertCardContent = useCallback((cardId: string) => {
    if (isAdmin) {
      setSharedDeck((deck) => {
        const next = mutateSharedDeck(deck, (doc) =>
          revertCardContentOverride(doc, cardId),
        )
        saveLocalSharedDeck(next)
        return next
      })
      return
    }
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = revertCardContentOverride(doc, cardId)
      return commitDoc(next)
    })
  }, [commitDoc, isAdmin])

  const addCustomCard = useCallback(
    (
      question: string,
      answer: string,
      bookId: string,
      chapter: number,
      originalNumber?: number,
    ) => {
      const bookIndex = BIBLE_BOOKS.findIndex((b) => b.id === bookId)
      const book = BIBLE_BOOKS[bookIndex >= 0 ? bookIndex : 0]
      const assigned = originalNumber && originalNumber > 0 ? originalNumber : 0
      const created = createUserAddedCard(
        question,
        answer,
        {
          id: book.id,
          label: book.label,
          canonIndex: bookIndex >= 0 ? bookIndex : 0,
        },
        chapter,
        assigned || Date.now() % 1_000_000,
      )
      if (isAdmin) {
        setSharedDeck((deck) => {
          const next = mutateSharedDeck(deck, (doc) => addCardToDeck(doc, created))
          saveLocalSharedDeck(next)
          return next
        })
        return created.id
      }
      setUserDoc((doc) => {
        if (!doc) return doc
        return commitDoc(addCardToDeck(doc, created))
      })
      return created.id
    },
    [commitDoc, isAdmin],
  )

  const removeCardFromDeck = useCallback((cardId: string) => {
    if (isAdmin) {
      setSharedDeck((deck) => {
        const next = mutateSharedDeck(deck, (doc) => hideCardFromDeck(doc, cardId))
        saveLocalSharedDeck(next)
        return next
      })
      return
    }
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = hideCardFromDeck(doc, cardId)
      return commitDoc(next)
    })
  }, [commitDoc, isAdmin])

  const saveGlossaryEntry = useCallback((entry: GlossaryEntry) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = saveGlossaryEntryInDoc(doc, entry)
      return commitDoc(next)
    })
  }, [])

  const deleteGlossaryEntry = useCallback((entryId: string) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = hideGlossaryEntryInDoc(doc, entryId)
      return commitDoc(next)
    })
  }, [])

  const importDocument = useCallback(
    async (file: File) => {
      if (!userDoc) {
        return {
          ok: false as const,
          message: 'Elige continuar sin ID o identifícate primero.',
        }
      }
      const expected = currentUser ?? guestRosterUser
      const text = await file.text()
      const result = parseImportedUserDocument(text, expected)
      if (!result.ok) return result
      replaceDocument(result.doc)
      return { ok: true as const }
    },
    [currentUser, userDoc, replaceDocument],
  )

  const isGuest = isGuestDocument(userDoc)
  const hasSession = userDoc !== null

  const listPendingChanges = useCallback(() => {
    if (!currentUser) return []
    return collectPendingDeckChanges(currentUser.id)
  }, [currentUser, sharedDeck])

  const persistPendingChange = useCallback(
    (userId: string) => {
      const pending = collectPendingDeckChanges(currentUser?.id ?? '').find(
        (row) => row.userId === userId,
      )
      if (!pending) return
      setSharedDeck((deck) => {
        const next = mergeDeckIntoShared(deck, pending.deck)
        saveLocalSharedDeck(next)
        return next
      })
      clearAuthorDeckOverlay(userId)
      if (userDoc?.userId === userId) {
        setUserDoc((doc) =>
          doc ? commitDoc({ ...doc, deck: emptyDeckState() }) : doc,
        )
      }
    },
    [commitDoc, currentUser, userDoc],
  )

  const sharedDeckHasChanges =
    Object.keys(sharedDeck.edits).length > 0 ||
    sharedDeck.hiddenIds.length > 0 ||
    sharedDeck.added.length > 0

  const value = useMemo(
    () => ({
      roster,
      currentUser,
      userDoc,
      groupDoc,
      isGuest,
      isAdmin,
      hasSession,
      continueAsGuest,
      selectUser,
      unlockAdmin,
      isAdminAccount,
      signOut,
      setCardStatus,
      recordCardReview,
      markManyReviewed,
      setStudyGroup,
      clearStudyGroup,
      patchConfig,
      replaceDocument,
      exportDocument,
      importDocument,
      resetProgress,
      resetConfig,
      resetAllLocalData,
      resetDeckToOriginal,
      saveCardContent,
      revertCardContent,
      addCustomCard,
      removeCardFromDeck,
      saveGlossaryEntry,
      deleteGlossaryEntry,
      sharedDeckHasChanges,
      listPendingChanges,
      persistPendingChange,
      sharedDeck,
    }),
    [
      roster,
      currentUser,
      userDoc,
      groupDoc,
      isGuest,
      isAdmin,
      hasSession,
      continueAsGuest,
      selectUser,
      unlockAdmin,
      isAdminAccount,
      signOut,
      setCardStatus,
      recordCardReview,
      markManyReviewed,
      setStudyGroup,
      clearStudyGroup,
      patchConfig,
      replaceDocument,
      exportDocument,
      importDocument,
      resetProgress,
      resetConfig,
      resetAllLocalData,
      resetDeckToOriginal,
      saveCardContent,
      revertCardContent,
      addCustomCard,
      removeCardFromDeck,
      saveGlossaryEntry,
      deleteGlossaryEntry,
      sharedDeckHasChanges,
      listPendingChanges,
      persistPendingChange,
      sharedDeck,
    ],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser debe usarse dentro de UserProvider')
  }
  return ctx
}
