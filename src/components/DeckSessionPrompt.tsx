import { User, UserCircle2 } from 'lucide-react'
import type { RosterUser } from '@/lib/userData'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChoiceCard } from '@/components/ChoiceCard'

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        <DialogTitle className="text-lg font-semibold">
          ¿Cómo quieres guardar los cambios?
        </DialogTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Para editar tarjetas necesitas una sesión personal. El resto del equipo
          no verá tus cambios.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <ChoiceCard
            icon={UserCircle2}
            title="Continuar sin ID"
            description="Tus tarjetas quedan solo para ti aquí."
            onClick={onContinueAsGuest}
            className="p-4"
          />
          <ChoiceCard
            icon={User}
            title="Identificarme"
            description="Elige tu nombre del equipo."
            onClick={onIdentify}
            primary
            className="p-4"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type DeckSessionPromptHandlers = {
  onContinueAsGuest: () => void
  onSelectUser: (user: RosterUser) => void
}
