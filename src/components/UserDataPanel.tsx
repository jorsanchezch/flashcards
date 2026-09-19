import { useState } from 'react'
import { Eraser, Settings2, Trash2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PendingAction = 'progress' | 'config' | 'deck' | 'all' | null

export function UserDataPanel() {
  const {
    userDoc,
    isGuest,
    resetProgress,
    resetConfig,
    resetDeckToOriginal,
    resetAllLocalData,
  } = useUser()
  const [pending, setPending] = useState<PendingAction>(null)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  if (!userDoc) return null

  const subject = isGuest ? 'tu sesión sin ID' : `tu perfil (${userDoc.displayName})`

  const confirm = () => {
    if (pending === 'progress') resetProgress()
    else if (pending === 'config') resetConfig()
    else if (pending === 'deck') resetDeckToOriginal()
    else if (pending === 'all') resetAllLocalData()
    setPending(null)
    setDoneMessage('Listo. Solo se cambió tu sesión actual.')
  }

  const pendingCopy =
    pending === 'progress'
      ? {
          title: '¿Borrar todas las marcas de tarjetas?',
          body: `Se quitarán las marcas de revisada y repasar de ${subject}. No afecta a nadie más.`,
        }
      : pending === 'config'
        ? {
            title: '¿Restablecer preferencias?',
            body: `Volverán los valores por defecto de mezcla y filtros de ${subject}. Las marcas no cambian.`,
          }
        : pending === 'deck'
          ? {
              title: '¿Restaurar el mazo original?',
              body: `Volverás al mazo del curso: se quitarán tus ediciones, tarjetas añadidas y las que hayas ocultado. Las marcas de estudio no cambian.`,
            }
          : pending === 'all'
            ? {
                title: '¿Borrar todo tu avance guardado?',
                body: `Se eliminarán marcas, preferencias y cambios del mazo de ${subject}. No se puede deshacer.`,
              }
            : null

  return (
    <Card className="mt-3 w-full max-w-md border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Mis datos</CardTitle>
        <CardDescription className="text-xs">
          {isGuest
            ? 'Sesión sin ID: solo cuenta para ti en este teléfono o computadora.'
            : 'Solo puedes borrar o restablecer tu propio avance.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!pending && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                setDoneMessage(null)
                setPending('progress')
              }}
            >
              <Eraser className="size-4" />
              Borrar marcas de tarjetas
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                setDoneMessage(null)
                setPending('config')
              }}
            >
              <Settings2 className="size-4" />
              Restablecer preferencias
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                setDoneMessage(null)
                setPending('deck')
              }}
            >
              <Trash2 className="size-4" />
              Restaurar mazo original
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="justify-start"
              onClick={() => {
                setDoneMessage(null)
                setPending('all')
              }}
            >
              <Trash2 className="size-4" />
              Borrar todo (marcas y preferencias)
            </Button>
          </>
        )}

        {pendingCopy && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            role="alertdialog"
            aria-labelledby="reset-confirm-title"
          >
            <p id="reset-confirm-title" className="text-sm font-medium">
              {pendingCopy.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pendingCopy.body}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="destructive" onClick={confirm}>
                Sí, borrar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPending(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {doneMessage && !pending && (
          <p className="text-xs text-muted-foreground">{doneMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
