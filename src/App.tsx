import { useState } from 'react'
import { BookOpen, Loader2, RefreshCw } from 'lucide-react'
import { BrowseView } from '@/components/BrowseView'
import { StudyView } from '@/components/StudyView'
import { TeamSummaryView } from '@/components/TeamSummaryView'
import { UserMenu } from '@/components/UserMenu'
import { UserPickerView } from '@/components/UserPickerView'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProvider, useUser } from '@/context/UserContext'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useUsersRoster } from '@/hooks/useUsersRoster'
import { loadLastUserId } from '@/lib/userData'
import type { RosterUser } from '@/lib/userData'

type Tab = 'study' | 'browse' | 'team'

function FlashcardsApp() {
  const { state, reload } = useFlashcards()
  const { roster, currentUser, userDoc, selectUser } = useUser()
  const [tab, setTab] = useState<Tab>('study')
  const [studyCardId, setStudyCardId] = useState<string | null>(null)

  const openCardInStudy = (id: string) => {
    setStudyCardId(id)
    setTab('study')
  }

  const cardsReady =
    state.status === 'ready' && state.cards.length > 0
  const totalCards = cardsReady ? state.cards.length : 0
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
          {currentUser && <UserMenu />}
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

        {cardsReady && (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="mx-auto max-w-3xl"
          >
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="study">Estudiar</TabsTrigger>
                <TabsTrigger value="browse">Explorar</TabsTrigger>
                <TabsTrigger value="team">Equipo</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="study">
              {!currentUser || !userDoc ? (
                <UserPickerGate users={roster} onSelect={selectUser} />
              ) : (
                <StudyView
                  key={`${currentUser.id}-${studyCardId ?? 'deck'}`}
                  cards={state.cards}
                  initialCardId={studyCardId}
                  onExitToBrowse={() => setTab('browse')}
                />
              )}
            </TabsContent>

            <TabsContent value="browse">
              {!currentUser || !userDoc ? (
                <UserPickerGate users={roster} onSelect={selectUser} />
              ) : (
                <BrowseView
                  cards={state.cards}
                  onSelectCard={openCardInStudy}
                />
              )}
            </TabsContent>

            <TabsContent value="team">
              <TeamSummaryView
                roster={roster}
                totalCards={totalCards}
                userDoc={userDoc}
                currentUserDisplayName={currentUser?.displayName ?? null}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

function UserPickerGate({
  users,
  onSelect,
}: {
  users: RosterUser[]
  onSelect: (user: RosterUser) => void
}) {
  const lastId = loadLastUserId()
  return (
    <UserPickerView
      users={users}
      suggestedUserId={lastId}
      onSelect={onSelect}
    />
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
      <FlashcardsApp />
    </UserProvider>
  )
}

export default App
