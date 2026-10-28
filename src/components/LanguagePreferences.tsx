import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/select'
import { usePreferences } from '@/context/PreferencesContext'
import { UI_LOCALES } from '@/lib/i18n'

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
          <NativeSelect
            id="ui-locale"
            wrapperClassName="mt-1"
            value={uiLocale}
            onChange={(e) => setUiLocale(e.target.value as 'es' | 'en')}
          >
            {UI_LOCALES.map((locale) => (
              <option key={locale.id} value={locale.id}>
                {locale.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bible-version">{t.bibleVersion}</Label>
          <NativeSelect
            id="bible-version"
            wrapperClassName="mt-1"
            value={bibleVersionId}
            onChange={(e) => setBibleVersionId(e.target.value)}
          >
            {bibleVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label} ({version.language === 'es' ? 'ES' : 'EN'} ·{' '}
                {version.gatewayParam})
              </option>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">{t.bibleVersionHint}</p>
        </div>
      </div>
    </div>
  )
}
