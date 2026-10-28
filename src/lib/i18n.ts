export type UiLocale = 'es' | 'en'

export const UI_LOCALES: { id: UiLocale; label: string }[] = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
]

export const DEFAULT_UI_LOCALE: UiLocale = 'es'

const LOCALE_KEY = 'flashcards-ui-locale-v1'
const BIBLE_VERSION_KEY = 'flashcards-bible-version-v1'

export function isUiLocale(value: unknown): value is UiLocale {
  return value === 'es' || value === 'en'
}

export function loadUiLocale(): UiLocale {
  try {
    const raw = localStorage.getItem(LOCALE_KEY)
    if (isUiLocale(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_UI_LOCALE
}

export function saveUiLocale(locale: UiLocale) {
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export function loadGuestBibleVersionId(fallback = 'ntv'): string {
  try {
    const raw = localStorage.getItem(BIBLE_VERSION_KEY)
    if (typeof raw === 'string' && raw.trim()) return raw.trim()
  } catch {
    /* ignore */
  }
  return fallback
}

export function saveGuestBibleVersionId(id: string) {
  try {
    localStorage.setItem(BIBLE_VERSION_KEY, id)
  } catch {
    /* ignore */
  }
}

type MessageTree = {
  appTitle: string
  tabs: { study: string; browse: string; team: string; material: string }
  loading: string
  loadingCards: string
  retry: string
  cardsLoadError: string
  rosterLoadError: string
  language: string
  bibleVersion: string
  bibleVersionHint: string
  openCitation: string
  viewInBible: string
  noCitations: string
  studyingAs: string
  mode: string
  myData: string
  changeUser: string
  settings: string
  theme: { label: string; system: string; light: string; dark: string }
  preferences: string
}

const es: MessageTree = {
  appTitle: 'Flashcards — Samuel y Reyes',
  tabs: {
    study: 'Estudiar',
    browse: 'Lista',
    team: 'Equipo',
    material: 'Material',
  },
  loading: 'Cargando…',
  loadingCards: 'Cargando tarjetas…',
  retry: 'Reintentar',
  cardsLoadError: 'No se pudieron cargar las tarjetas',
  rosterLoadError: 'No se pudo cargar la lista de usuarios',
  language: 'Idioma de la interfaz',
  bibleVersion: 'Versión de la Biblia',
  bibleVersionHint:
    'Las citas abren en BibleGateway con esta versión. El mazo del curso sigue en NTV (español). Los dumps NTV/RVR1960 locales están aplazados.',
  openCitation: 'Abrir {label} en {version}',
  viewInBible: 'Ver en la Biblia ({version})',
  noCitations: 'No hay citas en las tarjetas de esta palabra.',
  studyingAs: 'Estudiando como',
  mode: 'Modo',
  myData: 'Mis datos',
  changeUser: 'Cambiar',
  settings: 'Ajustes',
  theme: { label: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Oscuro' },
  preferences: 'Preferencias de idioma',
}

const en: MessageTree = {
  appTitle: 'Flashcards — Samuel & Kings',
  tabs: {
    study: 'Study',
    browse: 'List',
    team: 'Team',
    material: 'Material',
  },
  loading: 'Loading…',
  loadingCards: 'Loading cards…',
  retry: 'Retry',
  cardsLoadError: 'Could not load flashcards',
  rosterLoadError: 'Could not load the user list',
  language: 'Interface language',
  bibleVersion: 'Bible version',
  bibleVersionHint:
    'Citations open on BibleGateway in this version. Course cards stay NTV (Spanish). Local NTV/RVR1960 dumps are postponed.',
  openCitation: 'Open {label} in {version}',
  viewInBible: 'View in Bible ({version})',
  noCitations: 'No citations on cards for this word.',
  studyingAs: 'Studying as',
  mode: 'Mode',
  myData: 'My data',
  changeUser: 'Switch',
  settings: 'Settings',
  theme: { label: 'Theme', system: 'System', light: 'Light', dark: 'Dark' },
  preferences: 'Language preferences',
}

const catalog: Record<UiLocale, MessageTree> = { es, en }

export function messages(locale: UiLocale): MessageTree {
  return catalog[locale] ?? catalog.es
}

export function formatMessage(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '')
}
