import { useCallback, useEffect, useState } from 'react'
import type { RosterUser } from '@/lib/userData'

type RosterState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; users: RosterUser[] }

function sortUsers(users: RosterUser[]): RosterUser[] {
  return [...users].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, 'es', { sensitivity: 'base' }),
  )
}

export function useUsersRoster() {
  const [state, setState] = useState<RosterState>({ status: 'loading' })

  const reload = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const base = import.meta.env.BASE_URL
      const res = await fetch(`${base}data/users.json`)
      if (!res.ok) {
        throw new Error(`No se pudo cargar la lista de usuarios (${res.status})`)
      }
      const data = (await res.json()) as { users?: RosterUser[] }
      if (!data.users?.length) {
        throw new Error('La lista de usuarios está vacía')
      }
      const users = sortUsers(
        data.users.filter((u) => u.id && u.displayName),
      )
      if (!users.length) {
        throw new Error('No hay usuarios válidos en el archivo')
      }
      setState({ status: 'ready', users })
    } catch (e) {
      setState({
        status: 'error',
        message:
          e instanceof Error ? e.message : 'Error al cargar usuarios',
      })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { state, reload }
}
