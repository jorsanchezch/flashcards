import { useRef, useState } from 'react'
import { Download, LogOut, Upload, UserRound } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const {
    currentUser,
    signOut,
    exportDocument,
    importDocument,
  } = useUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  if (!currentUser) return null

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    setImportMessage(null)
    const result = await importDocument(file)
    if (result.ok) {
      setImportMessage('Progreso importado correctamente.')
    } else {
      setImportMessage(result.message)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Estudiando como
        </span>
        <Button variant="secondary" size="sm" className="max-w-[12rem] truncate">
          <UserRound className="size-4 shrink-0" />
          <span className="truncate">{currentUser.displayName}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportDocument()}
          title="Descargar JSON de progreso"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          title="Importar JSON de progreso"
        >
          <Upload className="size-4" />
          <span className="hidden sm:inline">Importar</span>
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void handleImport(e.target.files?.[0])}
        />
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
    </div>
  )
}
