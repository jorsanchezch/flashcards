import { useState } from 'react'
import { ChevronLeft, User, UserCircle2 } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { UserPickerView } from '@/components/UserPickerView'
import { Button } from '@/components/ui/button'

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
          description="Elige tu nombre en la lista del equipo."
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
          Elige cómo quieres entrar al modo estudio.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto flex-col items-start gap-0.5 px-4 py-3 text-left"
          onClick={onContinueAsGuest}
        >
          <span className="flex items-center gap-2 text-base font-semibold">
            <UserCircle2 className="size-5 shrink-0" />
            Continuar sin ID
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Practica sin nombre; tu mazo y marcas quedan solo para ti aquí.
          </span>
        </Button>

        <Button
          type="button"
          className="h-auto flex-col items-start gap-0.5 px-4 py-3 text-left"
          onClick={() => setStep('identify')}
        >
          <span className="flex items-center gap-2 text-base font-semibold">
            <User className="size-5 shrink-0" />
            Identifícate
          </span>
          <span className="text-sm font-normal opacity-90">
            Elige tu nombre y guarda tu progreso en el equipo.
          </span>
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Puedes cambiar más tarde con <strong className="font-medium">Cambiar</strong>{' '}
        en la cabecera.
      </p>
    </div>
  )
}
