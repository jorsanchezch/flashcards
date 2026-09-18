import { useCallback, useEffect, useState } from 'react'
import type { TeamProgressFile } from '@/lib/teamProgress'

type TeamProgressState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: TeamProgressFile }

export function useTeamProgress() {
  const [state, setState] = useState<TeamProgressState>({ status: 'loading' })

  const reload = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const base = import.meta.env.BASE_URL
      const res = await fetch(`${base}data/team-progress.json`)
      if (!res.ok) {
        throw new Error(
          `No se pudo cargar el resumen del equipo (${res.status})`,
        )
      }
      const data = (await res.json()) as TeamProgressFile
      if (!data.members || typeof data.members !== 'object') {
        throw new Error('El resumen del equipo no tiene el formato esperado')
      }
      setState({ status: 'ready', data })
    } catch (e) {
      setState({
        status: 'error',
        message:
          e instanceof Error ? e.message : 'Error al cargar resumen del equipo',
      })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { state, reload }
}
