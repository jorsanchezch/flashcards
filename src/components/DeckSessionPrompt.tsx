import { User, UserCircle2 } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { Button } from '@/components/ui/button'

type DeckSessionPromptProps = {
  open: boolean
  onContinueAsGuest: () => void
  onIdentify: () => void
  onClose: () => void
}

export function DeckSessionPrompt({
  open,
  onContinueAsGuest,
  onIdentify,
  onClose,
}: DeckSessionPromptProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-session-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="deck-session-title" className="text-lg font-semibold">
          ¿Cómo quieres guardar los cambios?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Para editar tarjetas necesitas una sesión personal. El resto del equipo
          no verá tus cambios.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start gap-2 px-4 py-3 text-left"
            onClick={onContinueAsGuest}
          >
            <UserCircle2 className="size-5 shrink-0" />
            <span>
              <span className="block font-semibold">Continuar sin ID</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Tus tarjetas quedan solo para ti aquí.
              </span>
            </span>
          </Button>
          <Button
            type="button"
            className="h-auto justify-start gap-2 px-4 py-3 text-left"
            onClick={onIdentify}
          >
            <User className="size-5 shrink-0" />
            <span>
              <span className="block font-semibold">Identificarme</span>
              <span className="block text-xs font-normal opacity-90">
                Elige tu nombre del equipo.
              </span>
            </span>
          </Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

export type DeckSessionPromptHandlers = {
  onContinueAsGuest: () => void
  onSelectUser: (user: RosterUser) => void
}
