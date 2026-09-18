import { useState } from 'react'
import { BookOpen, Loader2, RefreshCw } from 'lucide-react'
import { BrowseView } from '@/components/BrowseView'
import { StudyView } from '@/components/StudyView'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFlashcards } from '@/hooks/useFlashcards'

type Tab = 'study' | 'browse'

function App() {
  const { state, reload } = useFlashcards()
  const [tab, setTab] = useState<Tab>('study')
  const [studyCardId, setStudyCardId] = useState<string | null>(null)

  const openCardInStudy = (id: string) => {
    setStudyCardId(id)
    setTab('study')
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3 text-left">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Flashcards — 1 Samuel
              </h1>
              <p className="text-xs text-muted-foreground">
                Tarjetas atómicas en Markdown · sin servidor
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        {state.status === 'loading' && (
          <div
            className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground"
            role="status"
          >
            <Loader2 className="size-8 animate-spin" />
            <p>Cargando tarjetas…</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <p className="mb-2 font-medium text-destructive">
              No se pudieron cargar las tarjetas
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {state.message}
            </p>
            <Button onClick={() => void reload()}>
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
          </div>
        )}

        {state.status === 'ready' && state.cards.length === 0 && (
          <p className="py-24 text-center text-muted-foreground">
            No hay tarjetas disponibles.
          </p>
        )}

        {state.status === 'ready' && state.cards.length > 0 && (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="mx-auto max-w-3xl"
          >
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="study">Estudiar</TabsTrigger>
                <TabsTrigger value="browse">Explorar</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="study">
              <StudyView
                key={studyCardId ?? 'deck'}
                cards={state.cards}
                initialCardId={studyCardId}
                onExitToBrowse={() => setTab('browse')}
              />
            </TabsContent>
            <TabsContent value="browse">
              <BrowseView
                cards={state.cards}
                onSelectCard={openCardInStudy}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

export default App
