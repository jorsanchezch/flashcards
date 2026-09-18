/** Fisher–Yates shuffle (returns a new array). */
export function shuffleIds(ids: string[]): string[] {
  const arr = [...ids]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Reshuffles the deck and picks an index whose card differs from `currentId`
 * when more than one card exists.
 */
export function reshuffleStudyOrder(
  order: string[],
  currentId: string | undefined,
): { order: string[]; index: number } {
  const shuffled = shuffleIds(order)
  if (shuffled.length <= 1) {
    return { order: shuffled, index: 0 }
  }
  if (!currentId) {
    return { order: shuffled, index: 0 }
  }
  const otherIndices = shuffled
    .map((id, i) => (id !== currentId ? i : -1))
    .filter((i) => i >= 0)
  const index =
    otherIndices[Math.floor(Math.random() * otherIndices.length)] ?? 0
  return { order: shuffled, index }
}
