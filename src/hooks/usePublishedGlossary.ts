import { useCallback, useEffect, useState } from 'react'
import { parseGlossaryFile, type GlossaryEntry } from '@/lib/glossary'
import { resolveCatalogConnector } from '@/lib/connectors'

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
      const connector = await resolveCatalogConnector()
      const data = await connector.loadGlossary()
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
