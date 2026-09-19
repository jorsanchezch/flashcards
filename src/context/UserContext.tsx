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
  loadGuestDocument,
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
  updateUserConfig,
  type RosterUser,
  type UserConfig,
  type UserDocument,
} from '@/lib/userData'
import { createUserAddedCard } from '@/lib/deckCustomize'
import { BIBLE_BOOKS } from '@/lib/biblical'
import { applyCardStatus, type CardStatus } from '@/lib/progress'

type UserContextValue = {
  roster: RosterUser[]
  currentUser: RosterUser | null
  userDoc: UserDocument | null
  isGuest: boolean
  hasSession: boolean
  continueAsGuest: () => void
  selectUser: (user: RosterUser) => void
  signOut: () => void
  setCardStatus: (cardId: string, status: CardStatus | null) => void
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
  ) => void
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

  const rosterById = useMemo(
    () => new Map(roster.map((u) => [u.id, u])),
    [roster],
  )

  useEffect(() => {
    if (!roster.length) return
    const lastId = loadLastUserId()
    if (!lastId) return
    if (isGuestSessionId(lastId)) {
      setCurrentUser(null)
      setUserDoc(loadGuestDocument())
      return
    }
    const user = rosterById.get(lastId)
    if (!user) return
    setCurrentUser(user)
    setUserDoc(loadUserDocument(user))
  }, [roster.length, rosterById])

  const continueAsGuest = useCallback(() => {
    saveGuestSession()
    setCurrentUser(null)
    setUserDoc(loadGuestDocument())
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
        return applyCardStatus(doc, cardId, status)
      })
    },
    [],
  )

  const patchConfig = useCallback((patch: Partial<UserConfig>) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = updateUserConfig(doc, patch)
      saveUserDocument(next)
      return next
    })
  }, [])

  const replaceDocument = useCallback((doc: UserDocument) => {
    saveUserDocument(doc)
    setUserDoc(doc)
  }, [])

  const exportDocument = useCallback(() => {
    if (!userDoc) return
    downloadUserDocument(userDoc)
  }, [userDoc])

  const applyReset = useCallback((fn: (doc: UserDocument) => UserDocument) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = fn(doc)
      saveUserDocument(next)
      return next
    })
  }, [])

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
    (cardId: string, question: string, answer: string) => {
      setUserDoc((doc) => {
        if (!doc) return doc
        const next = setCardContentOverride(doc, cardId, question, answer)
        saveUserDocument(next)
        return next
      })
    },
    [],
  )

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
        saveUserDocument(next)
        return next
      })
      return card.id
    },
    [],
  )

  const removeCardFromDeck = useCallback((cardId: string) => {
    setUserDoc((doc) => {
      if (!doc) return doc
      const next = hideCardFromDeck(doc, cardId)
      saveUserDocument(next)
      return next
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
      isGuest,
      hasSession,
      continueAsGuest,
      selectUser,
      signOut,
      setCardStatus,
      patchConfig,
      replaceDocument,
      exportDocument,
      importDocument,
      resetProgress,
      resetConfig,
      resetAllLocalData,
      resetDeckToOriginal,
      saveCardContent,
      addCustomCard,
      removeCardFromDeck,
    }),
    [
      roster,
      currentUser,
      userDoc,
      isGuest,
      hasSession,
      continueAsGuest,
      selectUser,
      signOut,
      setCardStatus,
      patchConfig,
      replaceDocument,
      exportDocument,
      importDocument,
      resetProgress,
      resetConfig,
      resetAllLocalData,
      resetDeckToOriginal,
      saveCardContent,
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
