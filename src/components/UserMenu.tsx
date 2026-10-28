import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ClipboardList,
  Database,
  Download,
  LogOut,
  Upload,
  UserRound,
} from 'lucide-react'
import { usePreferences } from '@/context/PreferencesContext'
import { readUseLocalDb, writeLocalDbPreference } from '@/lib/localDb'
import { useUser } from '@/context/UserContext'
import { UserDataPanel } from '@/components/UserDataPanel'
import { PendingChangesDialog } from '@/components/PendingChangesDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { initials } from '@/lib/initials'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { userDoc, isGuest, isAdmin, signOut, exportDocument, importDocument } =
    useUser()
  const { t } = usePreferences()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [showDataPanel, setShowDataPanel] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(false)
  const [useLocalDb, setUseLocalDb] = useState(() => readUseLocalDb())

  // The import result is a passing notice; let it fade on its own.
  useEffect(() => {
    if (!importMessage) return
    const timer = window.setTimeout(() => setImportMessage(null), 5000)
    return () => window.clearTimeout(timer)
  }, [importMessage])

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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex h-11 max-w-[14rem] items-center gap-2 rounded-full border bg-card py-1 pr-2.5 pl-1 shadow-card transition-all hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:border-primary/40"
            aria-label={`${isGuest ? t.mode : t.studyingAs} ${label}`}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                isGuest
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_60%,var(--gold))] text-primary-foreground',
              )}
              aria-hidden
            >
              {isGuest ? <UserRound className="size-4" /> : initials(label)}
            </span>
            <span className="hidden min-w-0 flex-col text-left leading-tight sm:flex">
              <span className="text-[10px] text-muted-foreground">
                {isGuest ? t.mode : t.studyingAs}
              </span>
              <span className="truncate text-sm font-semibold">{label}</span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-2xl p-1.5 shadow-raised">
          <DropdownMenuLabel className="font-normal">
            <span className="block text-xs text-muted-foreground">
              {isGuest ? t.mode : t.studyingAs}
            </span>
            <span className="block truncate font-semibold">{label}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="min-h-10" onSelect={() => setShowDataPanel(true)}>
            <UserRound />
            {t.myData}
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-10" onSelect={signOut}>
            <LogOut />
            {t.changeUser}
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Administración
              </DropdownMenuLabel>
              <DropdownMenuItem className="min-h-10" onSelect={() => exportDocument()}>
                <Download />
                Guardar copia
              </DropdownMenuItem>
              <DropdownMenuItem className="min-h-10" onSelect={() => fileRef.current?.click()}>
                <Upload />
                Cargar copia
              </DropdownMenuItem>
              <DropdownMenuItem className="min-h-10" onSelect={() => setPendingOpen(true)}>
                <ClipboardList />
                Cambios pendientes
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-h-10"
                onSelect={() => {
                  const next = !useLocalDb
                  writeLocalDbPreference(next ? 'sqlite' : 'json')
                  setUseLocalDb(next)
                  window.location.reload()
                }}
              >
                <Database />
                {useLocalDb
                  ? 'Base local activa — usar datos publicados'
                  : 'Usar base de datos local'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isAdmin && (
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => void handleImport(e.target.files?.[0])}
        />
      )}

      {importMessage && (
        <p
          className="animate-pop-in fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-xl border bg-card px-4 py-3 text-center text-sm shadow-raised sm:bottom-6"
          role="status"
        >
          {importMessage}
        </p>
      )}

      <Sheet open={showDataPanel} onOpenChange={setShowDataPanel}>
        <SheetContent side="responsive">
          <UserDataPanel />
        </SheetContent>
      </Sheet>

      {pendingOpen && <PendingChangesDialog onClose={() => setPendingOpen(false)} />}
    </>
  )
}
