const STORAGE_KEY = 'olympics-flashcards-progress-v1'

export type CardStatus = 'known' | 'unknown'

export type ProgressMap = Record<string, CardStatus>

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ProgressMap
  } catch {
    return {}
  }
}

export function saveProgress(map: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function setCardStatus(id: string, status: CardStatus | null) {
  const map = loadProgress()
  if (status === null) {
    delete map[id]
  } else {
    map[id] = status
  }
  saveProgress(map)
  return map
}
