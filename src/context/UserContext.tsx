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
  loadLastUserId,
  loadUserDocument,
  parseImportedUserDocument,
  saveLastUserId,
  saveUserDocument,
  updateUserConfig,
  type RosterUser,
  type UserConfig,
  type UserDocument,
} from '@/lib/userData'
import { applyCardStatus, type CardStatus } from '@/lib/progress'

type UserContextValue = {
  roster: RosterUser[]
  currentUser: RosterUser | null
  userDoc: UserDocument | null
  selectUser: (user: RosterUser) => void
  signOut: () => void
  setCardStatus: (cardId: string, status: CardStatus | null) => void
  patchConfig: (patch: Partial<UserConfig>) => void
  replaceDocument: (doc: UserDocument) => void
  exportDocument: () => void
  importDocument: (
    file: File,
  ) => Promise<{ ok: true } | { ok: false; message: string }>
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
    const user = rosterById.get(lastId)
    if (!user) return
    setCurrentUser(user)
    setUserDoc(loadUserDocument(user))
  }, [roster.length, rosterById])

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

  const importDocument = useCallback(
    async (file: File) => {
      if (!currentUser) {
        return { ok: false as const, message: 'Selecciona un usuario primero.' }
      }
      const text = await file.text()
      const result = parseImportedUserDocument(text, currentUser)
      if (!result.ok) return result
      replaceDocument(result.doc)
      return { ok: true as const }
    },
    [currentUser, replaceDocument],
  )

  const value = useMemo(
    () => ({
      roster,
      currentUser,
      userDoc,
      selectUser,
      signOut,
      setCardStatus,
      patchConfig,
      replaceDocument,
      exportDocument,
      importDocument,
    }),
    [
      roster,
      currentUser,
      userDoc,
      selectUser,
      signOut,
      setCardStatus,
      patchConfig,
      replaceDocument,
      exportDocument,
      importDocument,
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
