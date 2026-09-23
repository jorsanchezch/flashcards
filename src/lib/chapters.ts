/** Display titles keyed by flashcard folder slug (from Obsidian index). */
export const CHAPTER_TITLES: Record<string, string> = {
  'samuel-1-2-ana-samuel-y-eli': '1 Samuel 1–2 — Ana, Samuel y Elí',
  'samuel-3-4-llamado-y-arca': '1 Samuel 3–4 — Llamado de Samuel y el arca',
  'samuel-5-7-arca-y-regreso': '1 Samuel 5–7 — El arca y el regreso a Israel',
  'samuel-8-10-israel-pide-rey': '1 Samuel 8–10 — Israel pide un rey',
  'samuel-11-saul-libera-jabes': '1 Samuel 11 — Saúl libera a Jabes',
  'samuel-12-samuel-se-despide': '1 Samuel 12 — Samuel se despide como juez',
  'samuel-13-sacrificio-de-saul': '1 Samuel 13 — El sacrificio de Saúl',
  'samuel-14-jonathan-y-los-filisteos': '1 Samuel 14 — Jonatán y los filisteos',
  'samuel-15-saul-y-los-amalecitas': '1 Samuel 15 — Saúl y los amalecitas',
  'samuel-16-david-ungeido': '1 Samuel 16 — David ungido',
  'samuel-17-david-y-goliat': '1 Samuel 17 — David y Goliat',
  'samuel-18-saul-y-david': '1 Samuel 18 — Saúl y David',
  'samuel-19-david-huye-de-saul': '1 Samuel 19 — David huye de Saúl',
  'samuel-20-jonathan-y-david': '1 Samuel 20 — Jonatán y David',
  'samuel-21-david-en-nob-y-gat': '1 Samuel 21 — David en Nob y Gat',
  'samuel-22-cueva-de-adulam': '1 Samuel 22 — Cueva de Adulam',
}

export function chapterSlugFromPath(filePath: string): string {
  const parts = filePath.split('/')
  return parts.length > 1 ? parts[0] : 'sin-capitulo'
}

export function chapterTitle(slug: string, footerLabel?: string): string {
  if (footerLabel) return footerLabel
  return CHAPTER_TITLES[slug] ?? slug.replace(/-/g, ' ')
}
