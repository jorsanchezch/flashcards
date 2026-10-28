import { useState } from 'react'
import { User, UserCircle2 } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { ChoiceCard } from '@/components/ChoiceCard'
import { UserPickerView } from '@/components/UserPickerView'
import { WelcomeEmblem } from '@/components/WelcomeEmblem'

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
      <UserPickerView
        users={users}
        suggestedUserId={suggestedUserId}
        onSelect={onSelectUser}
        onBack={() => setStep('choose')}
        title="Identifícate"
        description="Elige tu nombre en la lista del equipo."
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:py-14">
      <div className="animate-fade-in text-center">
        <WelcomeEmblem className="mb-6" />
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          ¿Quién estudia hoy?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Elige cómo quieres entrar al modo estudio.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <ChoiceCard
          icon={UserCircle2}
          title="Continuar sin ID"
          description="Practica sin nombre. Las marcas La sé, Repasar y Revisada son del equipo y se ven en Equipo."
          onClick={onContinueAsGuest}
        />
        <ChoiceCard
          icon={User}
          title="Identifícate"
          description="Elige tu nombre y guarda tu progreso en el equipo."
          onClick={() => setStep('identify')}
          primary
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Puedes cambiar más tarde: toca tu nombre arriba a la derecha y elige{' '}
        <strong className="font-medium">Cambiar</strong>.
      </p>
    </div>
  )
}
