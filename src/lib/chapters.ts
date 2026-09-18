/** Display titles keyed by flashcard folder slug (from Obsidian index). */
export const CHAPTER_TITLES: Record<string, string> = {
  'samuel-1-2-ana-samuel-y-eli': '1 Samuel 1–2 — Ana, Samuel y Elí',
  'samuel-3-4-llamado-y-arca': '1 Samuel 3–4 — Llamado de Samuel y el arca',
  'samuel-5-7-arca-y-regreso': '1 Samuel 5–7 — El arca y el regreso a Israel',
  'samuel-8-10-israel-pide-rey': '1 Samuel 8–10 — Israel pide un rey',
  'samuel-11-saul-libera-jabes': '1 Samuel 11 — Saúl libera a Jabes',
  'samuel-12-samuel-se-despide': '1 Samuel 12 — Samuel se despide como juez',
}

export function chapterSlugFromPath(filePath: string): string {
  const parts = filePath.split('/')
  return parts.length > 1 ? parts[0] : 'sin-capitulo'
}

export function chapterTitle(slug: string, footerLabel?: string): string {
  if (footerLabel) return footerLabel
  return CHAPTER_TITLES[slug] ?? slug.replace(/-/g, ' ')
}
