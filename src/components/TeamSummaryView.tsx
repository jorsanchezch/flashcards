import { useMemo, useState } from 'react'
import { matchesNameSearch } from '@/lib/nameSearch'
import { NameSearchField } from '@/components/NameSearchField'
import { Crown, Download, Loader2, RefreshCw, Users } from 'lucide-react'
import { ProgressRing } from '@/components/ProgressRing'
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
import { initials } from '@/lib/initials'
import { cn } from '@/lib/utils'

type TeamSummaryViewProps = {
  roster: RosterUser[]
  totalCards: number
  userDoc: UserDocument | null
  groupDoc: UserDocument | null
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
  groupDoc,
  isGuest = false,
  currentUserDisplayName,
}: TeamSummaryViewProps) {
  const { state, reload } = useTeamProgress()
  const [exportHint, setExportHint] = useState<string | null>(null)
  const [nameQuery, setNameQuery] = useState('')

  const rows = useMemo(() => {
    if (state.status !== 'ready') return []
    return buildTeamRows(state.data, roster, totalCards, userDoc)
  }, [state, roster, totalCards, userDoc])

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => matchesNameSearch(row.displayName, nameQuery)),
    [rows, nameQuery],
  )

  const teamTotals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.known += row.stats.known
        acc.reviewed += row.stats.reviewed
        acc.unknown += row.stats.unknown
        return acc
      },
      { known: 0, reviewed: 0, unknown: 0 },
    )
  }, [filteredRows])

  const progressList = filteredRows.map((row) => row.stats.known + row.stats.reviewed)
  const allTied = progressList.every((p) => p === progressList[0])

  const groupStats = groupDoc
    ? computeStatsFromUserDoc(groupDoc, totalCards)
    : null

  const handleExportTeam = () => {
    if (state.status !== 'ready') return
    const file = mergePublishedTeamExport(
      state.data,
      roster,
      totalCards,
      userDoc,
      groupDoc,
    )
    downloadTeamProgressFile(file)
    if (isGuest) {
      setExportHint(
        'Listo. Esta copia incluye el avance compartido del equipo (sesión sin ID). Pásala a quien actualice el resumen del grupo para que todos lo vean.',
      )
    } else if (userDoc && !isGuestDocument(userDoc)) {
      setExportHint(
        `Listo. Incluye tu avance (${currentUserDisplayName}) y el avance compartido del equipo. Pásala a quien actualice el resumen del grupo para que todos lo vean.`,
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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </span>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Resumen del equipo
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {roster.length} integrantes · {totalCards} tarjetas por persona
          </p>
          {isGuest && (
            <p className="mt-1 text-xs text-muted-foreground">
              Sin ID: las marcas La sé, Repasar y Revisada actualizan el avance
              compartido del equipo (abajo).
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
        <Card className="mb-8 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Siguiente paso</CardTitle>
            <CardDescription className="text-xs">{exportHint}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {groupStats && (
        <Card className="mb-8 border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Equipo (sin ID)</CardTitle>
              {isGuest && (
                <Badge variant="secondary" className="text-[10px]">
                  En vivo
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Marcas compartidas cuando se estudia sin elegir nombre. Las
              personas identificadas conservan su propio avance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StackedBar stats={groupStats} />
            <StatChips stats={groupStats} />
          </CardContent>
        </Card>
      )}

      <section className="mb-8" aria-labelledby="team-totals-title">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="team-totals-title" className="text-sm font-semibold">
            Totales del equipo
          </h3>
          <p className="text-xs text-muted-foreground">
            Ordenado por avance (La sé + Revisada) · {totalCards} tarjetas por persona
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Conocidas', value: teamTotals.known, color: 'var(--known)' },
            { label: 'Revisadas', value: teamTotals.reviewed, color: 'var(--reviewed)' },
            { label: 'Para repasar', value: teamTotals.unknown, color: 'var(--review-again)' },
            { label: 'Integrantes', value: filteredRows.length, color: 'var(--primary)' },
          ].map((tile) => (
            <div
              key={tile.label}
              className="relative overflow-hidden rounded-2xl border bg-card px-4 py-3 shadow-card"
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: tile.color }}
                aria-hidden
              />
              <dd className="font-display text-2xl font-semibold tabular-nums" style={{ color: tile.color }}>
                {tile.value}
              </dd>
              <dt className="text-xs text-muted-foreground">{tile.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="mb-6">
        <NameSearchField
          value={nameQuery}
          onChange={setNameQuery}
          placeholder="Buscar integrante…"
          ariaLabel="Buscar integrante del equipo"
        />
      </div>

      {filteredRows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sin coincidencias</CardTitle>
            <CardDescription>
              Ningún integrante coincide con «{nameQuery.trim()}». Prueba con
              otro nombre.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
      <ol className="flex flex-col gap-3">
        {filteredRows.map((row) => {
          const progress = row.stats.known + row.stats.reviewed
          const pct = percent(progress, row.stats.total)
          const isYou = userDoc?.userId === row.userId
          // Ties share a place; crowns only when someone is actually ahead.
          const rank = progressList.filter((p) => p > progress).length
          const medal = progress > 0 && !allTied ? MEDALS[rank] : undefined
          return (
            <li key={row.userId}>
              <article
                className={cn(
                  'flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card transition-shadow hover:shadow-raised',
                  isYou && 'border-primary/40 ring-1 ring-primary/20',
                )}
              >
                <div className="relative shrink-0">
                  <ProgressRing value={pct / 100} size={60} stroke={5} label={`Avance de ${row.displayName}: ${pct}%`}>
                    <span
                      className={cn(
                        'flex size-11 items-center justify-center rounded-full text-sm font-bold',
                        isYou
                          ? 'bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_60%,var(--gold))] text-primary-foreground'
                          : 'bg-muted text-foreground',
                      )}
                      aria-hidden
                    >
                      {initials(row.displayName)}
                    </span>
                  </ProgressRing>
                  {medal && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border-2 border-card shadow-card"
                      style={{ backgroundColor: medal.color }}
                      title={medal.label}
                    >
                      <Crown className="size-3.5 text-white" aria-label={medal.label} />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                      {rank + 1}º
                    </span>
                    <h3 className="truncate font-semibold">{row.displayName}</h3>
                    {isYou && (
                      <Badge variant="outline" className="text-[10px]">
                        Tú
                      </Badge>
                    )}
                    {row.isLive && (
                      <Badge variant="secondary" className="text-[10px]">
                        En vivo
                      </Badge>
                    )}
                    <span className="ml-auto font-display text-lg font-semibold tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <StackedBar stats={row.stats} />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatChips stats={row.stats} />
                    {row.updatedAt && (
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(row.updatedAt).toLocaleString('es', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ol>
      )}
    </div>
  )
}

const MEDALS = [
  { label: 'Primer lugar', color: 'var(--gold)' },
  { label: 'Segundo lugar', color: 'oklch(0.7 0.02 260)' },
  { label: 'Tercer lugar', color: 'oklch(0.6 0.09 55)' },
]

type Stats = { known: number; reviewed: number; unknown: number; unseen: number; total: number }

/** The four marks, always in this order. */
const SEGMENTS: { key: keyof Omit<Stats, 'total'>; label: string; color: string }[] = [
  { key: 'known', label: 'Conocidas', color: 'var(--known)' },
  { key: 'reviewed', label: 'Revisadas', color: 'var(--reviewed)' },
  { key: 'unknown', label: 'Repasar', color: 'var(--review-again)' },
  { key: 'unseen', label: 'Sin marcar', color: 'var(--muted)' },
]

function StackedBar({ stats }: { stats: Stats }) {
  const total = Math.max(stats.total, 1)
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
      {SEGMENTS.slice(0, 3).map((seg) => (
        <span
          key={seg.key}
          className="h-full transition-[width] duration-500"
          style={{ width: `${(stats[seg.key] / total) * 100}%`, backgroundColor: seg.color }}
        />
      ))}
    </div>
  )
}

function StatChips({ stats }: { stats: Stats }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {SEGMENTS.map((seg) => (
        <li key={seg.key} className="inline-flex items-center gap-1.5">
          <span
            className={cn('size-2 rounded-full', seg.key === 'unseen' && 'ring-1 ring-border')}
            style={{ backgroundColor: seg.color }}
            aria-hidden
          />
          {seg.label}
          <strong className="text-foreground tabular-nums">{stats[seg.key]}</strong>
        </li>
      ))}
    </ul>
  )
}
