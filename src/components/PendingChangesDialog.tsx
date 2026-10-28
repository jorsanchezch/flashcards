import { useMemo, useState } from 'react'
import { useUser } from '@/context/UserContext'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PendingChangesDialog({ onClose }: { onClose: () => void }) {
  const { listPendingChanges, persistPendingChange } = useUser()
  const [tick, setTick] = useState(0)
  const rows = useMemo(() => listPendingChanges(), [listPendingChanges, tick])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        <DialogTitle className="font-medium">
          Cambios pendientes
        </DialogTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Ediciones de otras personas en este dispositivo. Al aceptarlas, pasan
          al mazo del curso para todos.
        </p>
        {rows.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
            No hay cambios pendientes.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {rows.map((row) => (
              <li
                key={row.userId}
                className="rounded-lg border px-3 py-3 text-sm"
              >
                <p className="font-medium">{row.displayName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.editCount} editadas · {row.addedCount} nuevas ·{' '}
                  {row.hiddenCount} ocultas
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-2 min-h-11"
                  onClick={() => {
                    persistPendingChange(row.userId)
                    setTick((n) => n + 1)
                  }}
                >
                  Pasar al mazo del curso
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
