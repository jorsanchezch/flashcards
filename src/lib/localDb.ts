const KEY = 'flashcards-use-local-db'

/** Stored admin choice. Unset means the dev server still auto-picks SQLite when it answers. */
export function readLocalDbPreference(): 'sqlite' | 'json' | null {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === '1') return 'sqlite'
    if (stored === '0') return 'json'
  } catch {
    /* private mode */
  }
  return null
}

export function writeLocalDbPreference(mode: 'sqlite' | 'json') {
  localStorage.setItem(KEY, mode === 'sqlite' ? '1' : '0')
}

export function readUseLocalDb(): boolean {
  const pref = readLocalDbPreference()
  if (pref === 'sqlite') return true
  if (pref === 'json') return false
  return import.meta.env.DEV
}
