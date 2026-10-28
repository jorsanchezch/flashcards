import { useState } from 'react'
import { Eraser, Settings2, Trash2, UserRound } from 'lucide-react'
import { SheetTitle } from '@/components/ui/sheet'
import { usePreferences } from '@/context/PreferencesContext'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'

type PendingAction = 'progress' | 'config' | 'deck' | 'all' | null

export function UserDataPanel() {
  const {
    userDoc,
    isGuest,
    isAdmin,
    resetProgress,
    resetConfig,
    resetDeckToOriginal,
    resetAllLocalData,
  } = useUser()
  const { t } = usePreferences()
  const [pending, setPending] = useState<PendingAction>(null)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  if (!userDoc) return null

  const subject = isGuest
    ? 'el avance compartido del equipo'
    : `tu perfil (${userDoc.displayName})`

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
          body: `Se quitarán las marcas de revisada y repasar de ${subject}. Las personas identificadas conservan las suyas.`,
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
    <div className="flex flex-col gap-5 p-5">
      <header className="flex items-center gap-3 pr-10">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </span>
        <div className="min-w-0">
          <SheetTitle className="font-display text-xl font-semibold tracking-tight">
            {t.myData}
          </SheetTitle>
          <p className="truncate text-sm text-muted-foreground">
            {isGuest ? `${t.mode} ${userDoc.displayName}` : userDoc.displayName}
          </p>
        </div>
      </header>
      <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
        {isGuest
          ? 'Sesión sin ID: las marcas La sé, Repasar y Revisada son del equipo y se ven en Equipo.'
          : 'Solo puedes borrar o restablecer tu propio avance.'}
      </p>
      <div className="flex flex-col gap-2">
        {!pending && (
          <>
            <Button
              type="button"
              variant="outline"
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
              className="justify-start"
              onClick={() => {
                setDoneMessage(null)
                setPending('config')
              }}
            >
              <Settings2 className="size-4" />
              Restablecer preferencias
            </Button>
            {isAdmin && (
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => {
                setDoneMessage(null)
                setPending('deck')
              }}
            >
              <Trash2 className="size-4" />
              Restaurar mazo original
            </Button>
            )}
            <Button
              type="button"
              variant="destructive"
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
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPending(null)}
              >
                Cancelar
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={confirm}>
                Sí, borrar
              </Button>
            </div>
          </div>
        )}

        {doneMessage && !pending && (
          <p className="text-sm text-muted-foreground" role="status">
            {doneMessage}
          </p>
        )}
      </div>
    </div>
  )
}
