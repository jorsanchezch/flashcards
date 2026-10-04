import { useMemo, useState } from 'react'
import { User } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { matchesNameSearch } from '@/lib/nameSearch'
import { NameSearchField } from '@/components/NameSearchField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/UserContext'

type UserPickerViewProps = {
  users: RosterUser[]
  suggestedUserId?: string | null
  onSelect: (user: RosterUser) => void
  title?: string
  description?: string
}

export function UserPickerView({
  users,
  suggestedUserId,
  onSelect,
  title = '¿Quién estudia hoy?',
  description = 'Elige tu nombre en la lista.',
}: UserPickerViewProps) {
  const { isAdminAccount, unlockAdmin } = useUser()
  const [query, setQuery] = useState('')
  const [adminUser, setAdminUser] = useState<RosterUser | null>(null)
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(
    () => users.filter((u) => matchesNameSearch(u.displayName, query)),
    [users, query],
  )

  const pick = async (user: RosterUser) => {
    if (!isAdminAccount(user.id)) {
      onSelect(user)
      return
    }
    setAdminUser(user)
    setSecret('')
    setError(null)
  }

  const submitAdmin = async () => {
    if (!adminUser) return
    setBusy(true)
    setError(null)
    const result = await unlockAdmin(adminUser, secret)
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setAdminUser(null)
    setSecret('')
  }

  if (adminUser) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Clave de {adminUser.displayName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta cuenta pide una clave para entrar.
          </p>
        </div>
        <div>
          <Label htmlFor="admin-secret">Clave</Label>
          <Input
            id="admin-secret"
            type="password"
            autoComplete="current-password"
            className="mt-1 h-11"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submitAdmin()
            }}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="min-h-11"
            disabled={busy || !secret.trim()}
            onClick={() => void submitAdmin()}
          >
            Entrar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setAdminUser(null)
              setSecret('')
              setError(null)
            }}
          >
            Volver a la lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <User className="size-7" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <NameSearchField value={query} onChange={setQuery} />

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sin coincidencias</CardTitle>
            <CardDescription>
              Nadie en la lista coincide con «{query.trim()}». Prueba con menos
              letras u otro nombre.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((user) => {
            const isSuggested = user.id === suggestedUserId
            return (
              <li key={user.id}>
                <Button
                  type="button"
                  variant={isSuggested ? 'default' : 'outline'}
                  className="h-auto w-full justify-start px-4 py-3 text-left text-base"
                  onClick={() => void pick(user)}
                >
                  <span className="font-medium">{user.displayName}</span>
                  {isSuggested && (
                    <span className="ml-2 text-xs opacity-80">
                      (última sesión)
                    </span>
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
