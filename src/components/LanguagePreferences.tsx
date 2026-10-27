import { Label } from '@/components/ui/label'
import { usePreferences } from '@/context/PreferencesContext'
import { UI_LOCALES } from '@/lib/i18n'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

export function LanguagePreferences({ className }: { className?: string }) {
  const {
    uiLocale,
    setUiLocale,
    bibleVersionId,
    setBibleVersionId,
    bibleVersions,
    t,
  } = usePreferences()

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium">{t.preferences}</p>
      <div className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ui-locale">{t.language}</Label>
          <select
            id="ui-locale"
            className={selectClass}
            value={uiLocale}
            onChange={(e) => setUiLocale(e.target.value as 'es' | 'en')}
          >
            {UI_LOCALES.map((locale) => (
              <option key={locale.id} value={locale.id}>
                {locale.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bible-version">{t.bibleVersion}</Label>
          <select
            id="bible-version"
            className={selectClass}
            value={bibleVersionId}
            onChange={(e) => setBibleVersionId(e.target.value)}
          >
            {bibleVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label} ({version.language === 'es' ? 'ES' : 'EN'} ·{' '}
                {version.gatewayParam})
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">{t.bibleVersionHint}</p>
        </div>
      </div>
    </div>
  )
}
