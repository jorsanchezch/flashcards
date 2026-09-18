export function normalizeForNameSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

export function matchesNameSearch(displayName: string, query: string): boolean {
  const q = normalizeForNameSearch(query.trim())
  if (!q) return true
  return normalizeForNameSearch(displayName).includes(q)
}
