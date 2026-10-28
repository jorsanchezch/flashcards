import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useUser } from '@/context/UserContext'
import {
  BIBLE_VERSIONS,
  DEFAULT_BIBLE_VERSION_ID,
  bibleVersionMeta,
  type BibleVersionMeta,
} from '@/lib/bibleVersions'
import {
  formatMessage,
  isUiLocale,
  loadGuestBibleVersionId,
  loadUiLocale,
  messages,
  saveGuestBibleVersionId,
  saveUiLocale,
  type UiLocale,
} from '@/lib/i18n'
import { loadTheme, saveTheme, watchTheme, type ThemePreference } from '@/lib/theme'

type PreferencesContextValue = {
  uiLocale: UiLocale
  setUiLocale: (locale: UiLocale) => void
  bibleVersionId: string
  bibleVersion: BibleVersionMeta
  setBibleVersionId: (id: string) => void
  bibleVersions: BibleVersionMeta[]
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  t: ReturnType<typeof messages>
  format: (template: string, vars: Record<string, string>) => string
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { userDoc, patchConfig } = useUser()
  const [guestLocale, setGuestLocale] = useState<UiLocale>(() => loadUiLocale())
  const [guestBibleId, setGuestBibleId] = useState(() =>
    loadGuestBibleVersionId(DEFAULT_BIBLE_VERSION_ID),
  )
  const [theme, setThemeState] = useState<ThemePreference>(() => loadTheme())

  useEffect(() => watchTheme(theme), [theme])

  const setTheme = useCallback((next: ThemePreference) => {
    saveTheme(next)
    setThemeState(next)
  }, [])

  useEffect(() => {
    if (isUiLocale(userDoc?.config.uiLocale)) {
      setGuestLocale(userDoc.config.uiLocale)
      saveUiLocale(userDoc.config.uiLocale)
    }
    if (
      typeof userDoc?.config.bibleVersionId === 'string' &&
      userDoc.config.bibleVersionId.trim()
    ) {
      const id = bibleVersionMeta(userDoc.config.bibleVersionId).id
      setGuestBibleId(id)
      saveGuestBibleVersionId(id)
    }
  }, [userDoc?.config.uiLocale, userDoc?.config.bibleVersionId, userDoc?.userId])

  const uiLocale: UiLocale = isUiLocale(userDoc?.config.uiLocale)
    ? userDoc!.config.uiLocale!
    : guestLocale

  const bibleVersion = bibleVersionMeta(
    typeof userDoc?.config.bibleVersionId === 'string' &&
      userDoc.config.bibleVersionId.trim()
      ? userDoc.config.bibleVersionId
      : guestBibleId,
  )
  const bibleVersionId = bibleVersion.id

  useEffect(() => {
    document.documentElement.lang = uiLocale
  }, [uiLocale])

  const setUiLocale = useCallback(
    (locale: UiLocale) => {
      saveUiLocale(locale)
      setGuestLocale(locale)
      if (userDoc) patchConfig({ uiLocale: locale })
    },
    [patchConfig, userDoc],
  )

  const setBibleVersionId = useCallback(
    (id: string) => {
      const next = bibleVersionMeta(id).id
      saveGuestBibleVersionId(next)
      setGuestBibleId(next)
      if (userDoc) patchConfig({ bibleVersionId: next })
    },
    [patchConfig, userDoc],
  )

  const value = useMemo<PreferencesContextValue>(
    () => ({
      uiLocale,
      setUiLocale,
      bibleVersionId,
      bibleVersion,
      setBibleVersionId,
      bibleVersions: BIBLE_VERSIONS,
      theme,
      setTheme,
      t: messages(uiLocale),
      format: formatMessage,
    }),
    [uiLocale, setUiLocale, bibleVersionId, bibleVersion, setBibleVersionId, theme, setTheme],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return ctx
}

/** Safe defaults when preferences are not mounted yet (boot screens). */
export function useOptionalPreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (ctx) return ctx
  const uiLocale = loadUiLocale()
  const bibleVersion = bibleVersionMeta(
    loadGuestBibleVersionId(DEFAULT_BIBLE_VERSION_ID),
  )
  return {
    uiLocale,
    setUiLocale: saveUiLocale,
    bibleVersionId: bibleVersion.id,
    bibleVersion,
    setBibleVersionId: saveGuestBibleVersionId,
    bibleVersions: BIBLE_VERSIONS,
    theme: loadTheme(),
    setTheme: saveTheme,
    t: messages(uiLocale),
    format: formatMessage,
  }
}
