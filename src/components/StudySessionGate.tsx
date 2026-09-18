import { useState } from 'react'
import { ChevronLeft, User, UserCircle2 } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { UserPickerView } from '@/components/UserPickerView'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type StudySessionGateProps = {
  users: RosterUser[]
  suggestedUserId?: string | null
  onContinueAsGuest: () => void
  onSelectUser: (user: RosterUser) => void
}

export function StudySessionGate({
  users,
  suggestedUserId,
  onContinueAsGuest,
  onSelectUser,
}: StudySessionGateProps) {
  const [step, setStep] = useState<'choose' | 'identify'>('choose')

  if (step === 'identify') {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep('choose')}
          >
            <ChevronLeft className="size-4" />
            Volver
          </Button>
        </div>
        <UserPickerView
          users={users}
          suggestedUserId={suggestedUserId}
          onSelect={onSelectUser}
          title="Identifícate"
          description="Elige tu nombre en la lista del equipo. Tu progreso se guardará solo en este dispositivo y podrá sumarse al resumen del equipo."
        />
      </div>
    )
  }

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
          Puedes practicar sin identificarte o elegir tu nombre del equipo.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto flex-col items-start gap-1 px-4 py-4 text-left"
          onClick={onContinueAsGuest}
        >
          <span className="flex items-center gap-2 text-base font-semibold">
            <UserCircle2 className="size-5 shrink-0" />
            Continuar sin ID
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Progreso anónimo en este navegador. No se mezcla con los 13 nombres
            del equipo ni con el JSON publicado.
          </span>
        </Button>

        <Button
          type="button"
          className="h-auto flex-col items-start gap-1 px-4 py-4 text-left"
          onClick={() => setStep('identify')}
        >
          <span className="flex items-center gap-2 text-base font-semibold">
            <User className="size-5 shrink-0" />
            Identifícate
          </span>
          <span className="text-sm font-normal opacity-90">
            Elige tu nombre para guardar tu avance y poder actualizar el resumen
            del equipo.
          </span>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sin cuentas ni contraseñas</CardTitle>
          <CardDescription className="text-xs">
            Todo se guarda en este dispositivo. Puedes cambiar de modo con el
            botón Cambiar en la cabecera.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
