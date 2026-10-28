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
import {
  PreferencesProvider,
  useOptionalPreferences,
  usePreferences,
} from '@/context/PreferencesContext'
import { UserProvider, useUser } from '@/context/UserContext'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useEffectiveFlashcards } from '@/hooks/useEffectiveFlashcards'
import { useUsersRoster } from '@/hooks/useUsersRoster'
import { UI_LOCALES } from '@/lib/i18n'
import { isGuestSessionId, loadLastUserId } from '@/lib/userData'

type Tab = 'study' | 'browse' | 'team' | 'material'

function FlashcardsApp() {
  const { state, reload } = useFlashcards()
  const {
    t,
    uiLocale,
    setUiLocale,
    bibleVersionId,
    setBibleVersionId,
    bibleVersions,
  } = usePreferences()
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
      <header className="border-b bg-card/60 backdrop-blur">
        <div
          className={`mx-auto flex w-full flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between ${shellWidth}`}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <h1 className="text-lg font-semibold leading-tight">{t.appTitle}</h1>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="sr-only" htmlFor="header-ui-locale">
                {t.language}
              </label>
              <select
                id="header-ui-locale"
                className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                value={uiLocale}
                onChange={(e) => setUiLocale(e.target.value as 'es' | 'en')}
                aria-label={t.language}
              >
                {UI_LOCALES.map((locale) => (
                  <option key={locale.id} value={locale.id}>
                    {locale.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="header-bible-version">
                {t.bibleVersion}
              </label>
              <select
                id="header-bible-version"
                className="h-9 min-w-[7.5rem] rounded-md border border-input bg-background px-2 text-xs"
                value={bibleVersionId}
                onChange={(e) => setBibleVersionId(e.target.value)}
                aria-label={t.bibleVersion}
              >
                {bibleVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.gatewayParam} · {version.language === 'es' ? 'ES' : 'EN'}
                  </option>
                ))}
              </select>
            </div>
            {hasSession && <UserMenu />}
          </div>
        </div>
      </header>

      <main>
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
            <div className="px-4 pt-4">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                <TabsTrigger value="study">{t.tabs.study}</TabsTrigger>
                <TabsTrigger value="browse">{t.tabs.browse}</TabsTrigger>
                <TabsTrigger value="team">{t.tabs.team}</TabsTrigger>
                <TabsTrigger value="material">{t.tabs.material}</TabsTrigger>
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
