import { useState } from 'react'
import { BookOpen, Loader2, RefreshCw } from 'lucide-react'
import { BrowseView } from '@/components/BrowseView'
import { StudyView } from '@/components/StudyView'
import { StudySessionGate } from '@/components/StudySessionGate'
import { StudyMaterialsView, type MaterialRow } from '@/components/StudyMaterialsView'
import { TeamSummaryView } from '@/components/TeamSummaryView'
import { UserMenu } from '@/components/UserMenu'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlossaryProvider } from '@/context/GlossaryContext'
import { UserProvider, useUser } from '@/context/UserContext'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useEffectiveFlashcards } from '@/hooks/useEffectiveFlashcards'
import { useUsersRoster } from '@/hooks/useUsersRoster'
import { isGuestSessionId, loadLastUserId } from '@/lib/userData'

type Tab = 'study' | 'browse' | 'team' | 'material'

function FlashcardsApp() {
  const { state, reload } = useFlashcards()
  const {
    roster,
    userDoc,
    groupDoc,
    hasSession,
    isGuest,
    selectUser,
    continueAsGuest,
  } = useUser()
  const [tab, setTab] = useState<Tab>('study')
  const [studyCardId, setStudyCardId] = useState<string | null>(null)
  const [materialRow, setMaterialRow] = useState<MaterialRow>(null)
  const [glossaryTermId, setGlossaryTermId] = useState<string | null>(null)
  const [returnToGlossary, setReturnToGlossary] = useState(false)

  const openCardInStudy = (id: string, fromGlossary = false) => {
    setReturnToGlossary(fromGlossary)
    setStudyCardId(id)
    setTab('study')
  }

  const baseCards = state.status === 'ready' ? state.cards : []
  const effectiveCards = useEffectiveFlashcards(baseCards, userDoc)
  const cardsReady = state.status === 'ready' && baseCards.length > 0
  const totalCards = cardsReady ? effectiveCards.length : 0

  const lastId = loadLastUserId()
  const suggestedUserId = isGuestSessionId(lastId) ? null : lastId

  const sessionKey = userDoc?.userId ?? 'none'

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <h1 className="text-lg font-semibold leading-tight">
              Flashcards — Samuel y Reyes
            </h1>
          </div>
          {hasSession && (
            <div className="flex w-full justify-end sm:w-auto">
              <UserMenu />
            </div>
          )}
        </div>
      </header>

      <main>
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

        {state.status !== 'error' && (
          <Tabs
            value={tab}
            onValueChange={(v) => {
              const next = v as Tab
              if (next !== 'study') setStudyCardId(null)
              if (next !== 'material') setReturnToGlossary(false)
              setTab(next)
            }}
            className="mx-auto max-w-3xl"
          >
            <div className="px-4 pt-4">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                <TabsTrigger value="study">Estudiar</TabsTrigger>
                <TabsTrigger value="browse">Lista</TabsTrigger>
                <TabsTrigger value="team">Equipo</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="study">
              {state.status === 'loading' ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground"
                  role="status"
                >
                  <Loader2 className="size-8 animate-spin" />
                  <p>Cargando tarjetas…</p>
                </div>
              ) : !hasSession || !userDoc ? (
                <StudySessionGate
                  users={roster}
                  suggestedUserId={suggestedUserId}
                  onContinueAsGuest={continueAsGuest}
                  onSelectUser={selectUser}
                />
              ) : (
                <StudyView
                  key={sessionKey}
                  cards={effectiveCards}
                  baseCards={baseCards}
                  initialCardId={studyCardId}
                  onExitToBrowse={() => setTab('browse')}
                  onBackToGlossary={
                    returnToGlossary
                      ? () => {
                          setTab('material')
                          setMaterialRow('glossary')
                          setStudyCardId(null)
                        }
                      : undefined
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="browse">
              {state.status === 'loading' ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground"
                  role="status"
                >
                  <Loader2 className="size-8 animate-spin" />
                  <p>Cargando tarjetas…</p>
                </div>
              ) : (
                <BrowseView
                  key={userDoc ? sessionKey : 'browse-anon'}
                  cards={userDoc ? effectiveCards : baseCards}
                  baseCards={baseCards}
                  suggestedUserId={suggestedUserId}
                  onSelectCard={(id) => openCardInStudy(id, false)}
                  onStartStudyGroup={() => {
                    setStudyCardId(null)
                    setTab('study')
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="team">
              <TeamSummaryView
                roster={roster}
                totalCards={totalCards}
                userDoc={userDoc}
                groupDoc={groupDoc}
                isGuest={isGuest}
                currentUserDisplayName={userDoc?.displayName ?? null}
              />
            </TabsContent>

            <TabsContent value="material">
              <StudyMaterialsView
                cards={userDoc ? effectiveCards : baseCards}
                openRow={materialRow}
                onOpenRow={setMaterialRow}
                glossaryTermId={glossaryTermId}
                onSelectGlossaryTerm={setGlossaryTermId}
                onOpenCardInStudy={(id) => openCardInStudy(id, true)}
                onStudyWithFilter={() => {
                  setStudyCardId(null)
                  setReturnToGlossary(true)
                  setTab('study')
                }}
                suggestedUserId={suggestedUserId}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

function App() {
  const rosterState = useUsersRoster()

  if (rosterState.state.status === 'loading') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p>Cargando…</p>
      </div>
    )
  }

  if (rosterState.state.status === 'error') {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="mb-2 font-medium text-destructive">
          No se pudo cargar la lista de usuarios
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          {rosterState.state.message}
        </p>
        <Button onClick={() => void rosterState.reload()}>
          <RefreshCw className="size-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <UserProvider roster={rosterState.state.users}>
      <GlossaryProvider>
        <FlashcardsApp />
      </GlossaryProvider>
    </UserProvider>
  )
}

export default App
