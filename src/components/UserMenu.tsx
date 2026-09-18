import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Download, LogOut, Upload, UserRound } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { UserDataPanel } from '@/components/UserDataPanel'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const { userDoc, isGuest, signOut, exportDocument, importDocument } = useUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [showDataPanel, setShowDataPanel] = useState(false)

  if (!userDoc) return null

  const label = userDoc.displayName

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    setImportMessage(null)
    const result = await importDocument(file)
    if (result.ok) {
      setImportMessage('Copia cargada correctamente.')
    } else {
      setImportMessage(result.message)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex w-full flex-col items-end gap-1 sm:w-auto">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {isGuest ? 'Modo' : 'Estudiando como'}
        </span>
        <Button variant="secondary" size="sm" className="max-w-[12rem] truncate">
          <UserRound className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportDocument()}
          title="Guardar copia de mi avance"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Guardar copia</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          title="Cargar copia de mi avance"
        >
          <Upload className="size-4" />
          <span className="hidden sm:inline">Cargar copia</span>
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => void handleImport(e.target.files?.[0])}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDataPanel((v) => !v)}
          aria-expanded={showDataPanel}
        >
          {showDataPanel ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
          <span className="hidden sm:inline">Mis datos</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="size-4" />
          Cambiar
        </Button>
      </div>
      {importMessage && (
        <p className="max-w-xs text-right text-xs text-muted-foreground">
          {importMessage}
        </p>
      )}
      {showDataPanel && <UserDataPanel />}
    </div>
  )
}
