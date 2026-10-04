/** Fisher–Yates shuffle (returns a new array). */
export function shuffleIds(ids: string[]): string[] {
  const arr = [...ids]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** A new permutation of `ids`, different from `previous` when possible. */
export function shuffleIdsFresh(
  ids: string[],
  previous?: string[] | null,
): string[] {
  if (ids.length <= 1) return [...ids]
  let next = shuffleIds(ids)
  for (let attempt = 0; attempt < 12; attempt++) {
    if (
      !previous ||
      previous.length !== next.length ||
      next.some((id, i) => id !== previous[i])
    ) {
      return next
    }
    next = shuffleIds(ids)
  }
  return next
}

/**
 * Reshuffles the deck. Starts at the first card of the new order.
 */
export function reshuffleStudyOrder(
  order: string[],
  _currentId?: string,
): { order: string[]; index: number } {
  return { order: shuffleIdsFresh(order, order), index: 0 }
}
