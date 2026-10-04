import { useState } from 'react'
import { CalendarDays, ExternalLink, FileText, Map } from 'lucide-react'
import { CitationLinks } from '@/components/CitedText'
import {
  GlossaryMaterialRow,
  GlossaryPanel,
} from '@/components/GlossaryPanel'
import { coursePaceOn, formatChapterRange, formatLongDate } from '@/lib/coursePace'
import type { Flashcard } from '@/lib/parseFlashcard'
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

const GROUP_DOC_URL =
  'https://docs.google.com/document/d/1Q4EsUCusmKX9_Bzk3XND_AyfW7cP14P12jn0lhQTBn4/edit?usp=sharing'

const ARK_MAP_SRC = `${import.meta.env.BASE_URL}viaje-del-arca.png`

const ARK_CONTEXT =
  'Después de la derrota en Eben-ezer, los filisteos se llevaron el arca a Asdod y la pusieron en el templo de Dagón; allí Dagón cayó y la ciudad sufrió tumores. La enviaron a Gat y luego a Ecrón, y el mismo azote las siguió. A los siete meses la devolvieron en una carreta nueva, con ofrendas, y las vacas fueron derecho a Bet-semes. Algunos de Bet-semes miraron dentro del arca y murieron; entonces la llevaron a Quiriat-jearim, a la casa de Abinadab, donde permaneció unos veinte años mientras Israel se volvía al Señor. (1 Samuel 4:11; 5:1-12; 6:1-16; 6:19-21; 7:1-2, NTV)'

export type MaterialRow = 'doc' | 'ark' | 'pace' | 'glossary' | null

type StudyMaterialsViewProps = {
  cards: Flashcard[]
  openRow: MaterialRow
  onOpenRow: (row: MaterialRow) => void
  glossaryTermId: string | null
  onSelectGlossaryTerm: (id: string | null) => void
  onOpenCardInStudy: (cardId: string) => void
  suggestedUserId?: string | null
}

export function StudyMaterialsView({
  cards,
  openRow,
  onOpenRow,
  glossaryTermId,
  onSelectGlossaryTerm,
  onOpenCardInStudy,
  suggestedUserId,
}: StudyMaterialsViewProps) {
  const [mapOpen, setMapOpen] = useState(false)
  const pace = coursePaceOn()

  const toggle = (row: Exclude<MaterialRow, null>) => {
    if (openRow === row) {
      onOpenRow(null)
      onSelectGlossaryTerm(null)
      return
    }
    onOpenRow(row)
    if (row !== 'glossary') onSelectGlossaryTerm(null)
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Material de estudio
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Documentos, mapa, glosario y ritmo del curso para 1–2 Samuel y 1–2 Reyes.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        <li>
          <GlossaryMaterialRow
            open={openRow === 'glossary'}
            onToggle={() => toggle('glossary')}
          />
          {openRow === 'glossary' && (
            <div className="mt-2">
              <GlossaryPanel
                cards={cards}
                selectedTermId={glossaryTermId}
                onSelectTerm={onSelectGlossaryTerm}
                onOpenCardInStudy={onOpenCardInStudy}
                onBackToMaterials={() => {
                  onSelectGlossaryTerm(null)
                  onOpenRow(null)
                }}
                suggestedUserId={suggestedUserId}
              />
            </div>
          )}
        </li>

        <li>
          <button
            type="button"
            onClick={() => toggle('doc')}
            className="flex w-full min-h-11 items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
          >
            <span className="flex items-center gap-3">
              <FileText className="size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">Inventario del grupo</span>
                <span className="block text-xs text-muted-foreground">
                  Documento compartido del equipo
                </span>
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {openRow === 'doc' ? 'Cerrar' : 'Abrir'}
            </span>
          </button>
          {openRow === 'doc' && (
            <Card className="mt-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Inventario y material del grupo
                </CardTitle>
                <CardDescription>
                  Lista y notas de estudio del equipo (se abre en otra pestaña).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="min-h-11 w-full sm:w-auto">
                  <a
                    href={GROUP_DOC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Abrir documento
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </li>

        <li>
          <button
            type="button"
            onClick={() => toggle('ark')}
            className="flex w-full min-h-11 items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
          >
            <span className="flex items-center gap-3">
              <Map className="size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">Viaje del arca</span>
                <span className="block text-xs text-muted-foreground">
                  De las ciudades filisteas hasta Quiriat-jearim
                </span>
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {openRow === 'ark' ? 'Cerrar' : 'Abrir'}
            </span>
          </button>
          {openRow === 'ark' && (
            <Card className="mt-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  El arca entre los filisteos y el regreso
                </CardTitle>
                <CardDescription>
                  Toca el mapa para verlo más grande.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-lg border"
                  onClick={() => setMapOpen(true)}
                  aria-label="Ampliar mapa del viaje del arca"
                >
                  <img
                    src={ARK_MAP_SRC}
                    alt="Mapa del viaje del arca: Eben-ezer, Asdod, Gat, Ecrón, Bet-semes y Quiriat-jearim"
                    className="h-auto w-full"
                  />
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {ARK_CONTEXT}
                </p>
                <CitationLinks text={ARK_CONTEXT} />
              </CardContent>
            </Card>
          )}
        </li>

        <li>
          <button
            type="button"
            onClick={() => toggle('pace')}
            className="flex w-full min-h-11 items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
          >
            <span className="flex items-center gap-3">
              <CalendarDays className="size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">Ritmo del curso</span>
                <span className="block text-xs text-muted-foreground">
                  Tres días por semana, 1 de septiembre al 31 de octubre
                </span>
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {openRow === 'pace' ? 'Cerrar' : 'Abrir'}
            </span>
          </button>
          {openRow === 'pace' && (
            <Card className="mt-2">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">Dónde deberíamos ir</CardTitle>
                  {pace.isStudyDay ? (
                    <Badge>Hoy hay sesión</Badge>
                  ) : (
                    <Badge variant="secondary">Hoy no hay sesión</Badge>
                  )}
                </div>
                <CardDescription>
                  1 Samuel, 2 Samuel, 1 Reyes y 2 Reyes · lunes, miércoles y
                  viernes · {pace.totalChapters} capítulos en{' '}
                  {pace.totalSessions} sesiones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {pace.coveredLabel}
                    </span>
                    <span className="font-medium tabular-nums">
                      {pace.percent}%
                    </span>
                  </div>
                  <Progress value={pace.percent} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {pace.sessionsDone} de {pace.totalSessions} sesiones del
                    calendario ya pasaron.
                  </p>
                </div>
                {pace.isStudyDay && pace.todaySession && (
                  <p className="text-sm">
                    <strong>Esta sesión:</strong>{' '}
                    {formatChapterRange(pace.todaySession.chapters)}
                  </p>
                )}
                {!pace.isStudyDay && pace.lastSession && (
                  <p className="text-sm">
                    <strong>Última sesión</strong> (
                    {formatLongDate(pace.lastSession.date)}):{' '}
                    {formatChapterRange(pace.lastSession.chapters)}
                  </p>
                )}
                {pace.nextSession && (
                  <p className="text-sm">
                    <strong>Próxima sesión</strong> (
                    {formatLongDate(pace.nextSession.date)}):{' '}
                    {formatChapterRange(pace.nextSession.chapters)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </li>
      </ul>

      {mapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3"
          role="dialog"
          aria-modal="true"
          aria-label="Mapa ampliado del viaje del arca"
          onClick={() => setMapOpen(false)}
        >
          <img
            src={ARK_MAP_SRC}
            alt="Mapa ampliado del viaje del arca"
            className="max-h-[96vh] max-w-full rounded-md object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            type="button"
            variant="secondary"
            className="absolute top-4 right-4 min-h-11"
            onClick={() => setMapOpen(false)}
          >
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )
}
