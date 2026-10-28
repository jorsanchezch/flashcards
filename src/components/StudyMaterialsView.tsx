import { useState } from 'react'
import { ExternalLink, FileText, Map } from 'lucide-react'
import { CitationLinks } from '@/components/CitedText'
import { CoursePacePanel } from '@/components/CoursePacePanel'
import { KingsTimelinePanel } from '@/components/kings'
import { MaterialRow } from '@/components/MaterialRow'
import {
  GlossaryMaterialRow,
  GlossaryPanel,
} from '@/components/GlossaryPanel'
import type { Flashcard } from '@/lib/parseFlashcard'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const GROUP_DOC_URL =
  'https://docs.google.com/document/d/1Q4EsUCusmKX9_Bzk3XND_AyfW7cP14P12jn0lhQTBn4/edit?usp=sharing'

const ARK_MAP_SRC = `${import.meta.env.BASE_URL}viaje-del-arca.png`

const ARK_CONTEXT =
  'Después de la derrota en Eben-ezer, los filisteos se llevaron el arca a Asdod y la pusieron en el templo de Dagón; allí Dagón cayó y la ciudad sufrió tumores. La enviaron a Gat y luego a Ecrón, y el mismo azote las siguió. A los siete meses la devolvieron en una carreta nueva, con ofrendas, y las vacas fueron derecho a Bet-semes. Algunos de Bet-semes miraron dentro del arca y murieron; entonces la llevaron a Quiriat-jearim, a la casa de Abinadab, donde permaneció unos veinte años mientras Israel se volvía al Señor. (1 Samuel 4:11; 5:1-12; 6:1-16; 6:19-21; 7:1-2, NTV)'

export type MaterialRow = 'doc' | 'ark' | 'pace' | 'glossary' | 'kings' | null

type StudyMaterialsViewProps = {
  cards: Flashcard[]
  openRow: MaterialRow
  onOpenRow: (row: MaterialRow) => void
  glossaryTermId: string | null
  onSelectGlossaryTerm: (id: string | null) => void
  autoOpenDetails?: boolean
  onAutoOpenDetailsConsumed?: () => void
  onOpenCardInStudy: (cardId: string) => void
  onStudyWithFilter?: () => void
  suggestedUserId?: string | null
}

export function StudyMaterialsView({
  cards,
  openRow,
  onOpenRow,
  glossaryTermId,
  onSelectGlossaryTerm,
  autoOpenDetails,
  onAutoOpenDetailsConsumed,
  onOpenCardInStudy,
  onStudyWithFilter,
  suggestedUserId,
}: StudyMaterialsViewProps) {
  const [mapOpen, setMapOpen] = useState(false)

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
    <div
      className={`mx-auto w-full px-4 py-8 sm:py-10 ${
        openRow === 'kings' ? 'max-w-none' : 'max-w-3xl'
      }`}
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Material de estudio
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Documentos, mapa, línea de reyes, glosario y ritmo del curso para 1–2 Samuel y 1–2 Reyes.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
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
                autoOpenDetails={autoOpenDetails}
                onAutoOpenDetailsConsumed={onAutoOpenDetailsConsumed}
                onOpenCardInStudy={onOpenCardInStudy}
                onStudyWithFilter={onStudyWithFilter}
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
          <MaterialRow
            icon={FileText}
            title="Inventario del grupo"
            subtitle="Documento compartido del equipo"
            open={openRow === 'doc'}
            onToggle={() => toggle('doc')}
          />
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
          <MaterialRow
            icon={Map}
            title="Viaje del arca"
            subtitle="De las ciudades filisteas hasta Quiriat-jearim"
            open={openRow === 'ark'}
            onToggle={() => toggle('ark')}
          />
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

        <KingsTimelinePanel
          cards={cards}
          open={openRow === 'kings'}
          onToggle={() => toggle('kings')}
          onOpenCardInStudy={onOpenCardInStudy}
        />

        <CoursePacePanel
          cards={cards}
          open={openRow === 'pace'}
          onToggle={() => toggle('pace')}
        />
      </ul>

      <Sheet open={mapOpen} onOpenChange={setMapOpen}>
        <SheetContent
          side="bottom"
          className="inset-0 flex max-h-none items-center justify-center rounded-none border-0 bg-transparent p-3 shadow-none [&>[aria-hidden]]:hidden"
          onClick={() => setMapOpen(false)}
        >
          <SheetTitle className="sr-only">Mapa ampliado del viaje del arca</SheetTitle>
          <img
            src={ARK_MAP_SRC}
            alt="Mapa ampliado del viaje del arca"
            className="max-h-[96svh] max-w-full rounded-lg object-contain shadow-raised"
            onClick={(e) => e.stopPropagation()}
          />
          <SheetClose asChild>
            <Button type="button" variant="secondary" className="absolute top-4 right-4">
              Cerrar
            </Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </div>
  )
}
