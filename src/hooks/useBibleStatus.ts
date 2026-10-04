import { useEffect, useState } from 'react'
import {
  resolveCatalogConnector,
  type BibleStatus,
} from '@/lib/connectors'

const empty: BibleStatus = {
  enabled: false,
  source: 'json',
  verseCount: 0,
  versions: [],
}

export function useBibleStatus() {
  const [status, setStatus] = useState<BibleStatus>(empty)

  useEffect(() => {
    let cancelled = false
    void resolveCatalogConnector()
      .then((c) => c.bibleStatus())
      .then((next) => {
        if (!cancelled) setStatus(next)
      })
      .catch(() => {
        if (!cancelled) setStatus(empty)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return status
}
