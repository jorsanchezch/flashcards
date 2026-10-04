import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useUser } from '@/context/UserContext'
import { usePublishedGlossary } from '@/hooks/usePublishedGlossary'
import {
  compileGlossaryMatchers,
  mergeGlossary,
  type CompiledGlossaryForm,
  type GlossaryEntry,
} from '@/lib/glossary'

type GlossaryContextValue = {
  status: 'loading' | 'error' | 'ready'
  message: string | null
  published: GlossaryEntry[]
  entries: GlossaryEntry[]
  matchers: CompiledGlossaryForm[]
  reload: () => void
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null)

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const { userDoc } = useUser()
  const published = usePublishedGlossary()

  const publishedEntries =
    published.state.status === 'ready' ? published.state.entries : []

  const entries = useMemo(
    () => mergeGlossary(publishedEntries, userDoc?.glossary),
    [publishedEntries, userDoc?.glossary],
  )

  const matchers = useMemo(
    () => compileGlossaryMatchers(entries),
    [entries],
  )

  const value = useMemo<GlossaryContextValue>(
    () => ({
      status: published.state.status,
      message:
        published.state.status === 'error' ? published.state.message : null,
      published: publishedEntries,
      entries,
      matchers,
      reload: published.reload,
    }),
    [
      published.state,
      published.reload,
      publishedEntries,
      entries,
      matchers,
    ],
  )

  return (
    <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>
  )
}

export function useGlossary() {
  const ctx = useContext(GlossaryContext)
  if (!ctx) {
    throw new Error('useGlossary debe usarse dentro de GlossaryProvider')
  }
  return ctx
}
