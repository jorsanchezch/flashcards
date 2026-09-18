import { User } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
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
}

export function UserPickerView({
  users,
  suggestedUserId,
  onSelect,
}: UserPickerViewProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <User className="size-7" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          ¿Quién estudia hoy?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Elige tu nombre para guardar tu progreso en este dispositivo. Cada
          persona tiene su propio archivo de avance.
        </p>
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

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Privacidad en este dispositivo</CardTitle>
          <CardDescription className="text-xs">
            No hay cuentas ni servidor: tu progreso vive en el navegador y puedes
            exportarlo como JSON cuando quieras.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
