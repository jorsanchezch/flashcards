import { User } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { Button } from '@/components/ui/button'

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
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <User className="size-7" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {users.map((user) => {
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
                  <span className="ml-2 text-xs opacity-80">(última sesión)</span>
                )}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
