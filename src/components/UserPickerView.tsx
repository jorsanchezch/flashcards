import { useMemo, useState } from 'react'
import { User } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { matchesNameSearch } from '@/lib/nameSearch'
import { NameSearchField } from '@/components/NameSearchField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => users.filter((u) => matchesNameSearch(u.displayName, query)),
    [users, query],
  )

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
                  onClick={() => onSelect(user)}
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
