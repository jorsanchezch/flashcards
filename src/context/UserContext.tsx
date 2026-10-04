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
  updateUserConfig,
  markCardsReviewed,
  setStudyGroup as setStudyGroupInDoc,
  clearStudyGroup as clearStudyGroupInDoc,
  type CardContentOverride,
  type RosterUser,
  type UserConfig,
  type UserDocument,
} from '@/lib/userData'
import { createUserAddedCard } from '@/lib/deckCustomize'
import { BIBLE_BOOKS } from '@/lib/biblical'
import { applyCardReview, applyCardStatus, type CardStatus } from '@/lib/progress'
import {
  loadPublishedTeamProgress,
  mergeGroupDocWithPublished,
} from '@/lib/teamProgress'

type UserContextValue = {
  roster: RosterUser[]
  currentUser: RosterUser | null
  userDoc: UserDocument | null
  groupDoc: UserDocument
  isGuest: boolean
  hasSession: boolean
  continueAsGuest: () => void
  selectUser: (user: RosterUser) => void
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
  ) => string | null
  removeCardFromDeck: (cardId: string) => void
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
      if (cancelled) return
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
    saveLastUserId(user.id)
    setCurrentUser(user)
    setUserDoc(loadUserDocument(user))
  }, [])

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
    [],
  )

  const revertCardContent = useCallback((cardId: string) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = revertCardContentOverride(doc, cardId)
      return commitDoc(next)
    })
  }, [])

  const addCustomCard = useCallback(
    (question: string, answer: string, bookId: string, chapter: number) => {
      const bookIndex = BIBLE_BOOKS.findIndex((b) => b.id === bookId)
      const book = BIBLE_BOOKS[bookIndex >= 0 ? bookIndex : 0]
      const card = createUserAddedCard(
        question,
        answer,
        { id: book.id, label: book.label, canonIndex: bookIndex >= 0 ? bookIndex : 0 },
        chapter,
      )
      setUserDoc((doc) => {
        if (!doc) return doc
        const next = addCardToDeck(doc, card)
        return commitDoc(next)
      })
      return card.id
    },
    [],
  )

  const removeCardFromDeck = useCallback((cardId: string) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = hideCardFromDeck(doc, cardId)
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

  const value = useMemo(
    () => ({
      roster,
      currentUser,
      userDoc,
      groupDoc,
      isGuest,
      hasSession,
      continueAsGuest,
      selectUser,
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
    }),
    [
      roster,
      currentUser,
      userDoc,
      groupDoc,
      isGuest,
      hasSession,
      continueAsGuest,
      selectUser,
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
