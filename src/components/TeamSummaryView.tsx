import { useMemo, useState } from 'react'
import { Download, Loader2, RefreshCw, Users } from 'lucide-react'
import { useTeamProgress } from '@/hooks/useTeamProgress'
import { isGuestDocument, type UserDocument } from '@/lib/userData'
import {
  buildTeamRows,
  computeStatsFromUserDoc,
  downloadTeamProgressFile,
  mergePublishedTeamExport,
} from '@/lib/teamProgress'
import type { RosterUser } from '@/lib/userData'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type TeamSummaryViewProps = {
  roster: RosterUser[]
  totalCards: number
  userDoc: UserDocument | null
  isGuest?: boolean
  currentUserDisplayName?: string | null
}

function percent(known: number, total: number) {
  if (total <= 0) return 0
  return Math.round((known / total) * 100)
}

export function TeamSummaryView({
  roster,
  totalCards,
  userDoc,
  isGuest = false,
  currentUserDisplayName,
}: TeamSummaryViewProps) {
  const { state, reload } = useTeamProgress()
  const [exportHint, setExportHint] = useState<string | null>(null)

  const rows = useMemo(() => {
    if (state.status !== 'ready') return []
    return buildTeamRows(state.data, roster, totalCards, userDoc)
  }, [state, roster, totalCards, userDoc])

  const teamTotals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.known += row.stats.known
        acc.unknown += row.stats.unknown
        return acc
      },
      { known: 0, unknown: 0 },
    )
  }, [rows])

  const guestStats =
    isGuest && userDoc
      ? computeStatsFromUserDoc(userDoc, totalCards)
      : null

  const handleExportTeam = () => {
    if (state.status !== 'ready') return
    const file = mergePublishedTeamExport(
      state.data,
      roster,
      totalCards,
      userDoc,
    )
    downloadTeamProgressFile(file)
    if (isGuest) {
      setExportHint(
        'Listo. La copia del equipo no incluye sesiones sin ID. Pásala a quien actualice el resumen del grupo.',
      )
    } else if (userDoc && !isGuestDocument(userDoc)) {
      setExportHint(
        `Listo. Incluye tu avance (${currentUserDisplayName}). Pásala a quien actualice el resumen del grupo para que todos lo vean.`,
      )
    } else {
      setExportHint(
        'Listo. Pásala a quien actualice el resumen del grupo.',
      )
    }
  }

  if (state.status === 'loading') {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground"
        role="status"
      >
        <Loader2 className="size-8 animate-spin" />
        <p>Cargando resumen del equipo…</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-2 font-medium text-destructive">
          No se pudo cargar el resumen del equipo
        </p>
        <p className="mb-6 text-sm text-muted-foreground">{state.message}</p>
        <Button onClick={() => void reload()}>
          <RefreshCw className="size-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">
              Resumen del equipo
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {roster.length} integrantes · {totalCards} tarjetas por persona
          </p>
          {isGuest && userDoc && (
            <p className="mt-1 text-xs text-muted-foreground">
              Sin ID: tu avance abajo es solo tuyo y no cuenta en la lista del
              equipo.
            </p>
          )}
          {userDoc && !isGuest && (
            <p className="mt-1 text-xs text-muted-foreground">
              Tu fila se actualiza al instante aquí; las demás muestran el último
              resumen compartido del grupo.
            </p>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button onClick={handleExportTeam} className="shrink-0">
            <Download className="size-4" />
            Actualizar resumen del equipo
          </Button>
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            <RefreshCw className="size-4" />
            Actualizar lista
          </Button>
        </div>
      </div>

      {exportHint && (
        <Card className="mb-6 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Siguiente paso</CardTitle>
            <CardDescription className="text-xs">{exportHint}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {guestStats && (
        <Card className="mb-6 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tu sesión sin ID</CardTitle>
            <CardDescription className="text-xs">
              No aparece en la lista de las 13 personas del equipo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Conocidas:{' '}
                <strong className="text-foreground">{guestStats.known}</strong>
              </span>
              <span>
                Repasar:{' '}
                <strong className="text-foreground">{guestStats.unknown}</strong>
              </span>
              <span>
                Sin marcar:{' '}
                <strong className="text-foreground">{guestStats.unseen}</strong>
              </span>
            </div>
            <Progress
              value={percent(guestStats.known, guestStats.total)}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Totales del equipo</CardTitle>
          <CardDescription className="text-xs">
            Suma de las cifras mostradas abajo (cada persona sobre {totalCards}{' '}
            tarjetas).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <span>
            <strong className="text-emerald-700 dark:text-emerald-400">
              {teamTotals.known}
            </strong>{' '}
            conocidas (suma)
          </span>
          <span>
            <strong className="text-amber-700 dark:text-amber-400">
              {teamTotals.unknown}
            </strong>{' '}
            para repasar (suma)
          </span>
        </CardContent>
      </Card>

      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const pct = percent(row.stats.known, row.stats.total)
          return (
            <li key={row.userId}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{row.displayName}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {row.isLive && (
                        <Badge variant="secondary" className="text-[10px]">
                          En vivo
                        </Badge>
                      )}
                      {userDoc?.userId === row.userId && (
                        <Badge variant="outline" className="text-[10px]">
                          Tú
                        </Badge>
                      )}
                    </div>
                  </div>
                  {row.updatedAt && (
                    <CardDescription className="text-xs">
                      Actualizado:{' '}
                      {new Date(row.updatedAt).toLocaleString('es', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {pct}% conocidas
                    </span>
                    <span className="font-medium tabular-nums">
                      {row.stats.known}/{row.stats.total}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Conocidas:{' '}
                      <strong className="text-foreground">
                        {row.stats.known}
                      </strong>
                    </span>
                    <span>
                      Repasar:{' '}
                      <strong className="text-foreground">
                        {row.stats.unknown}
                      </strong>
                    </span>
                    <span>
                      Sin marcar:{' '}
                      <strong className="text-foreground">
                        {row.stats.unseen}
                      </strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
