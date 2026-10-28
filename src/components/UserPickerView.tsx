import { useMemo, useState } from 'react'
import { ChevronLeft, KeyRound, Users } from 'lucide-react'
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
import { initials } from '@/lib/initials'
import { cn } from '@/lib/utils'

type UserPickerViewProps = {
  users: RosterUser[]
  suggestedUserId?: string | null
  onSelect: (user: RosterUser) => void
  title?: string
  description?: string
  /** Shows a Volver button at the top of the picker. */
  onBack?: () => void
}

export function UserPickerView({
  users,
  suggestedUserId,
  onSelect,
  title = '¿Quién estudia hoy?',
  description = 'Elige tu nombre en la lista.',
  onBack,
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
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10 sm:py-14">
        <div className="text-center">
          <span className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_60%,var(--gold))] text-lg font-bold text-primary-foreground shadow-raised">
            {initials(adminUser.displayName)}
            <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-gold text-gold-foreground">
              <KeyRound className="size-3.5" aria-hidden />
            </span>
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:py-12">
      {onBack && (
        <Button type="button" variant="ghost" size="sm" className="-ml-2 self-start" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Volver
        </Button>
      )}
      <div className="animate-fade-in text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users className="size-7" />
        </span>
        <h2 className="font-display text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((user) => {
            const isSuggested = user.id === suggestedUserId
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => void pick(user)}
                  className={cn(
                    'group flex h-full w-full flex-col items-center gap-2 rounded-2xl border bg-card px-3 py-4 text-center shadow-card transition-all',
                    'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-raised focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98]',
                    isSuggested && 'border-primary/50 ring-2 ring-primary/25',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-14 items-center justify-center rounded-full text-base font-bold transition-transform group-hover:scale-105',
                      isSuggested
                        ? 'bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_60%,var(--gold))] text-primary-foreground shadow-card'
                        : 'bg-muted text-foreground',
                    )}
                    aria-hidden
                  >
                    {initials(user.displayName)}
                  </span>
                  <span className="text-sm leading-tight font-semibold">{user.displayName}</span>
                  {isSuggested && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Última sesión
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
