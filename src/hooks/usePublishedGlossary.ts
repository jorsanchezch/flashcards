import { useCallback, useEffect, useState } from 'react'
import { parseGlossaryFile, type GlossaryEntry } from '@/lib/glossary'
import { glossaryCatalogUrl } from '@/lib/localCatalog'

type PublishedGlossaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; entries: GlossaryEntry[] }

export function usePublishedGlossary() {
  const [state, setState] = useState<PublishedGlossaryState>({
    status: 'loading',
  })

  const reload = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch(glossaryCatalogUrl())
      if (!res.ok) {
        throw new Error('No se pudo cargar el glosario')
      }
      const data: unknown = await res.json()
      setState({ status: 'ready', entries: parseGlossaryFile(data) })
    } catch (e) {
      setState({
        status: 'error',
        message:
          e instanceof Error ? e.message : 'No se pudo cargar el glosario',
      })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { state, reload }
}
