/** Light/dark preference. Kept per device, like the guest language. */
export type ThemePreference = 'system' | 'light' | 'dark'

/** Also read by the inline script in index.html; keep the two in sync. */
const THEME_KEY = 'flashcards-theme'

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function loadTheme(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (isThemePreference(saved)) return saved
  } catch {
    // Storage may be blocked; fall back to the system setting.
  }
  return 'system'
}

export function saveTheme(theme: ThemePreference) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Not saved; the choice still applies for this visit.
  }
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

export function applyTheme(theme: ThemePreference) {
  const dark = theme === 'dark' || (theme === 'system' && darkQuery().matches)
  const root = document.documentElement
  if (root.classList.contains('dark') === dark) return
  // Without this, elements with color transitions fade while others switch at once.
  const freeze = document.createElement('style')
  freeze.textContent = '*,*::before,*::after{transition:none!important}'
  document.head.appendChild(freeze)
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
  void root.offsetHeight
  requestAnimationFrame(() => freeze.remove())
}

/** Applies the theme now and, under "system", again whenever the OS setting changes. */
export function watchTheme(theme: ThemePreference): () => void {
  applyTheme(theme)
  if (theme !== 'system') return () => {}
  const query = darkQuery()
  const onChange = () => applyTheme('system')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
