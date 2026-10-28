import { Monitor, Moon, Sun } from 'lucide-react'
import { usePreferences } from '@/context/PreferencesContext'
import type { ThemePreference } from '@/lib/theme'
import { cn } from '@/lib/utils'

const OPTIONS: { id: ThemePreference; icon: typeof Sun }[] = [
  { id: 'system', icon: Monitor },
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
]

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, t } = usePreferences()
  return (
    <div className={className}>
      <p id="theme-label" className="mb-2 text-sm font-medium">
        {t.theme.label}
      </p>
      <div
        className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
        role="radiogroup"
        aria-labelledby="theme-label"
      >
        {OPTIONS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={theme === id}
            onClick={() => setTheme(id)}
            className={cn(
              'flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition-all',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              theme === id
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {t.theme[id]}
          </button>
        ))}
      </div>
    </div>
  )
}
