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
  '2-samuel-1-david-ante-la-muerte-de-saul': '2 Samuel 1 — David recibe la noticia de Saúl',
  '2-samuel-2-david-rey-de-juda': '2 Samuel 2 — David rey de Judá',
  '2-samuel-3-abner-y-joab': '2 Samuel 3 — Abner y Joab',
  '2-samuel-4-is-boset-y-el-reino-unido': '2 Samuel 4 — Is-boset y el reino unido',
  '2-samuel-5-david-toma-jerusalen': '2 Samuel 5 — David toma Jerusalén',
  '2-samuel-6-el-arca-en-jerusalen': '2 Samuel 6 — El arca en Jerusalén',
  '2-samuel-7-pacto-con-david': '2 Samuel 7 — Pacto con David',
  '2-samuel-8-victorias-de-david': '2 Samuel 8 — Victorias de David',
  '2-samuel-9-mefiboset': '2 Samuel 9 — Mefiboset',
  '2-samuel-10-guerra-con-los-amonitas': '2 Samuel 10 — Guerra con los amonitas',
  '2-samuel-11-david-y-betsabe': '2 Samuel 11 — David y Betsabé',
  '2-samuel-12-natan-confronta-a-david': '2 Samuel 12 — Natán confronta a David',
  '2-samuel-13-amnon-y-tamar': '2 Samuel 13 — Amnón y Tamar',
  '2-samuel-14-absalon-regresa': '2 Samuel 14 — Absalón regresa',
  '2-samuel-15-conspiracion-de-absalon': '2 Samuel 15 — Conspiración de Absalón',
  '2-samuel-16-david-huye-simei': '2 Samuel 16 — David huye; Simei',
  '2-samuel-17-ahitofel-y-husai': '2 Samuel 17 — Ahitofel y Husai',
  '2-samuel-18-muerte-de-absalon': '2 Samuel 18 — Muerte de Absalón',
  '2-samuel-19-david-regresa': '2 Samuel 19 — David regresa',
  '2-samuel-20-rebelion-de-seba': '2 Samuel 20 — Rebelión de Seba',
  '2-samuel-21-gabaonitas-y-gigantes': '2 Samuel 21 — Gabaonitas y gigantes',
  '2-samuel-22-cantico-de-david': '2 Samuel 22 — Cántico de David',
  '2-samuel-23-valientes-de-david': '2 Samuel 23 — Valientes de David',
  '2-samuel-24-censo-y-plaga': '2 Samuel 24 — Censo y plaga',
}

export function chapterSlugFromPath(filePath: string): string {
  const parts = filePath.split('/')
  return parts.length > 1 ? parts[0] : 'sin-capitulo'
}

export function chapterTitle(slug: string, footerLabel?: string): string {
  if (footerLabel) return footerLabel
  return CHAPTER_TITLES[slug] ?? slug.replace(/-/g, ' ')
}
