import { useState } from 'react'
import {
  Crown,
  GraduationCap,
  Library,
  List,
  Loader2,
  RefreshCw,
  Settings2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { BrowseView } from '@/components/BrowseView'
import { StudyView } from '@/components/StudyView'
import { StudySessionGate } from '@/components/StudySessionGate'
import { StudyMaterialsView, type MaterialRow } from '@/components/StudyMaterialsView'
import { TeamSummaryView } from '@/components/TeamSummaryView'
import { LanguagePreferences } from '@/components/LanguagePreferences'
import { UserMenu } from '@/components/UserMenu'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlossaryProvider } from '@/context/GlossaryContext'
import {
  PreferencesProvider,
  useOptionalPreferences,
  usePreferences,
} from '@/context/PreferencesContext'
import { UserProvider, useUser } from '@/context/UserContext'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useEffectiveFlashcards } from '@/hooks/useEffectiveFlashcards'
import { useUsersRoster } from '@/hooks/useUsersRoster'
import { isGuestSessionId, loadLastUserId } from '@/lib/userData'
import { cn } from '@/lib/utils'

type Tab = 'study' | 'browse' | 'team' | 'material'

const NAV_TABS: { id: Tab; icon: LucideIcon }[] = [
  { id: 'study', icon: GraduationCap },
  { id: 'browse', icon: List },
  { id: 'team', icon: Users },
  { id: 'material', icon: Library },
]

function FlashcardsApp() {
  const { state, reload } = useFlashcards()
  const { t } = usePreferences()
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
  const [glossaryAutoDetails, setGlossaryAutoDetails] = useState(false)
  const [returnToGlossary, setReturnToGlossary] = useState(false)

  const openGlossaryTerm = (id: string) => {
    setTab('material')
    setMaterialRow('glossary')
    setGlossaryTermId(id)
    setGlossaryAutoDetails(true)
  }

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
  // The kings material needs room for the chart and its detail side by side.
  const shellWidth =
    tab === 'material' && materialRow === 'kings' ? 'max-w-[min(100%,1600px)]' : 'max-w-3xl'

  return (
    <GlossaryProvider onOpenTerm={openGlossaryTerm}>
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className={`mx-auto flex h-16 w-full items-center justify-between gap-3 px-4 ${shellWidth}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_55%,var(--gold))] text-primary-foreground shadow-card">
              <Crown className="size-5" aria-hidden />
            </span>
            <h1 className="truncate font-display text-lg leading-tight font-semibold tracking-tight sm:text-xl">
              {t.appTitle}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full data-[state=open]:bg-accent"
                  aria-label={t.settings}
                >
                  <Settings2 className="size-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <LanguagePreferences />
              </PopoverContent>
            </Popover>
            {hasSession && <UserMenu />}
          </div>
        </div>
      </header>

      <main className="pb-28 sm:pb-0">
        {state.status === 'error' && (
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <p className="mb-2 font-medium text-destructive">{t.cardsLoadError}</p>
            <p className="mb-6 text-sm text-muted-foreground">
              {state.message}
            </p>
            <Button onClick={() => void reload()}>
              <RefreshCw className="size-4" />
              {t.retry}
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
            className={`mx-auto w-full ${shellWidth}`}
          >
            <div className="sm:px-4 sm:pt-4">
              <TabsList
                aria-label="Secciones"
                className={cn(
                  // Phones: a fixed bottom bar. Wider screens: a segmented control at the top.
                  'fixed inset-x-0 bottom-0 z-40 grid h-auto w-full grid-cols-4 gap-0 rounded-none border-t bg-card/95 p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md',
                  'sm:static sm:gap-1 sm:rounded-xl sm:border-0 sm:bg-muted sm:p-1 sm:backdrop-blur-none',
                )}
              >
                {NAV_TABS.map(({ id, icon: Icon }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className={cn(
                      'group/nav min-h-14 flex-col gap-0.5 rounded-xl border-0 text-[11px] after:hidden',
                      'data-[state=active]:bg-transparent data-[state=active]:text-primary group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-primary',
                      'sm:min-h-10 sm:flex-row sm:gap-2 sm:rounded-lg sm:text-sm sm:data-[state=active]:bg-card sm:data-[state=active]:text-foreground sm:group-data-[variant=default]/tabs-list:data-[state=active]:shadow-card sm:dark:data-[state=active]:bg-card sm:dark:data-[state=active]:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-14 items-center justify-center rounded-full transition-colors',
                        'group-data-[state=active]/nav:animate-bounce-in group-data-[state=active]/nav:bg-primary/12',
                        'sm:h-auto sm:w-auto sm:bg-transparent sm:group-data-[state=active]/nav:animate-none sm:group-data-[state=active]/nav:bg-transparent',
                      )}
                    >
                      <Icon className="size-5 sm:size-4" aria-hidden />
                    </span>
                    {t.tabs[id]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="study">
              {state.status === 'loading' ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground"
                  role="status"
                >
                  <Loader2 className="size-8 animate-spin" />
                  <p>{t.loadingCards}</p>
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
                  <p>{t.loadingCards}</p>
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
                autoOpenDetails={glossaryAutoDetails}
                onAutoOpenDetailsConsumed={() => setGlossaryAutoDetails(false)}
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
    </GlossaryProvider>
  )
}

function App() {
  const rosterState = useUsersRoster()
  const { t } = useOptionalPreferences()

  if (rosterState.state.status === 'loading') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p>{t.loading}</p>
      </div>
    )
  }

  if (rosterState.state.status === 'error') {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="mb-2 font-medium text-destructive">{t.rosterLoadError}</p>
        <p className="mb-6 text-sm text-muted-foreground">
          {rosterState.state.message}
        </p>
        <Button onClick={() => void rosterState.reload()}>
          <RefreshCw className="size-4" />
          {t.retry}
        </Button>
      </div>
    )
  }

  return (
    <UserProvider roster={rosterState.state.users}>
      <PreferencesProvider>
        <FlashcardsApp />
      </PreferencesProvider>
    </UserProvider>
  )
}

export default App
