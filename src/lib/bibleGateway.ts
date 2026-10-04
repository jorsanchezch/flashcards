/** Bible Gateway NTV links for verse citations shown on cards. */

const GATEWAY_BOOKS: { id: string; label: string; query: string; pattern: RegExp }[] =
  [
    { id: '1-samuel', label: '1 Samuel', query: '1 Samuel', pattern: /^1\s*samuel/i },
    { id: '2-samuel', label: '2 Samuel', query: '2 Samuel', pattern: /^2\s*samuel/i },
    { id: '1-reyes', label: '1 Reyes', query: '1 Kings', pattern: /^1\s*reyes/i },
    { id: '2-reyes', label: '2 Reyes', query: '2 Kings', pattern: /^2\s*reyes/i },
    { id: '1-cronicas', label: '1 Crónicas', query: '1 Chronicles', pattern: /^1\s*cr[oó]nicas/i },
    { id: '2-cronicas', label: '2 Crónicas', query: '2 Chronicles', pattern: /^2\s*cr[oó]nicas/i },
    { id: 'genesis', label: 'Génesis', query: 'Genesis', pattern: /^g[eé]nesis/i },
    { id: 'exodo', label: 'Éxodo', query: 'Exodus', pattern: /^[eé]xodo/i },
    { id: 'levitico', label: 'Levítico', query: 'Leviticus', pattern: /^lev[ií]tico/i },
    { id: 'numeros', label: 'Números', query: 'Numbers', pattern: /^n[uú]meros/i },
    { id: 'deuteronomio', label: 'Deuteronomio', query: 'Deuteronomy', pattern: /^deuteronomio/i },
    { id: 'josue', label: 'Josué', query: 'Joshua', pattern: /^josu[eé]/i },
    { id: 'jueces', label: 'Jueces', query: 'Judges', pattern: /^jueces/i },
    { id: 'rut', label: 'Rut', query: 'Ruth', pattern: /^rut\b/i },
    { id: 'esdras', label: 'Esdras', query: 'Ezra', pattern: /^esdras/i },
    { id: 'nehemias', label: 'Nehemías', query: 'Nehemiah', pattern: /^nehem[ií]as/i },
    { id: 'ester', label: 'Ester', query: 'Esther', pattern: /^ester\b/i },
    { id: 'job', label: 'Job', query: 'Job', pattern: /^job\b/i },
    { id: 'salmos', label: 'Salmos', query: 'Psalm', pattern: /^salmos?|^salmo/i },
    { id: 'proverbios', label: 'Proverbios', query: 'Proverbs', pattern: /^proverbios/i },
    { id: 'eclesiastes', label: 'Eclesiastés', query: 'Ecclesiastes', pattern: /^eclesiast[eé]s/i },
    { id: 'isaias', label: 'Isaías', query: 'Isaiah', pattern: /^isa[ií]as/i },
    { id: 'jeremias', label: 'Jeremías', query: 'Jeremiah', pattern: /^jerem[ií]as/i },
    { id: 'lamentaciones', label: 'Lamentaciones', query: 'Lamentations', pattern: /^lamentaciones/i },
    { id: 'ezequiel', label: 'Ezequiel', query: 'Ezekiel', pattern: /^ezequiel/i },
    { id: 'daniel', label: 'Daniel', query: 'Daniel', pattern: /^daniel/i },
    { id: 'mateo', label: 'Mateo', query: 'Matthew', pattern: /^mateo/i },
    { id: 'marcos', label: 'Marcos', query: 'Mark', pattern: /^marcos/i },
    { id: 'lucas', label: 'Lucas', query: 'Luke', pattern: /^lucas/i },
    { id: 'juan', label: 'Juan', query: 'John', pattern: /^juan\b/i },
    { id: 'hechos', label: 'Hechos', query: 'Acts', pattern: /^hechos/i },
    { id: 'romanos', label: 'Romanos', query: 'Romans', pattern: /^romanos/i },
  ]

/** Parenthetical NTV citations, e.g. `(1 Reyes 1:1, NTV)` or `(2 Samuel 11:2-4, NTV)`. */
export const NTV_CITATION_RE = /\(([^()\n]*\d+\s*:\s*\d+[^()\n]*,\s*NTV)\)/gi

export type CitedPart =
  | { type: 'text'; value: string }
  | { type: 'cite'; value: string; href: string }

export function bibleGatewayNtvUrl(search: string): string {
  const params = new URLSearchParams()
  params.set('search', search)
  params.set('version', 'NTV')
  return `https://www.biblegateway.com/passage/?${params.toString()}`
}

/** One NTV keyword search covering a word and its other spellings. */
export function bibleGatewayNtvKeywordUrl(terms: string[]): string {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const raw of terms) {
    const term = raw.trim()
    if (!term) continue
    const key = term.toLocaleLowerCase('es')
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(term)
  }
  const query =
    unique.length <= 1 ? unique[0] ?? '' : unique.map((t) => `"${t}"`).join(' OR ')
  const params = new URLSearchParams()
  params.set('search', query)
  params.set('version', 'NTV')
  params.set('searchtype', 'all')
  return `https://www.biblegateway.com/keyword/?${params.toString()}`
}

export function citationToGatewaySearch(innerWithNtv: string): string | null {
  const body = innerWithNtv.replace(/,?\s*NTV\s*$/i, '').trim()
  if (!body) return null

  const sorted = [...GATEWAY_BOOKS].sort(
    (a, b) => b.label.length - a.label.length,
  )
  for (const book of sorted) {
    if (!book.pattern.test(body)) continue
    const rest = body.replace(book.pattern, '').trim()
    const passage = rest.replace(/\s+/g, '')
    if (!/\d+:\d+/.test(passage)) return null
    return `${book.query} ${passage}`
  }
  return null
}

export function splitCitedText(text: string): CitedPart[] {
  const parts: CitedPart[] = []
  const re = new RegExp(NTV_CITATION_RE.source, 'gi')
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    if (match.index > last) {
      parts.push({ type: 'text', value: text.slice(last, match.index) })
    }
    const inner = match[1]
    const search = citationToGatewaySearch(inner)
    if (search) {
      parts.push({
        type: 'cite',
        value: match[0],
        href: bibleGatewayNtvUrl(search),
      })
    } else {
      parts.push({ type: 'text', value: match[0] })
    }
    last = match.index + match[0].length
  }
  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) })
  }
  return parts.length ? parts : [{ type: 'text', value: text }]
}

export function extractCitationSearches(text: string): string[] {
  const out: string[] = []
  const re = new RegExp(NTV_CITATION_RE.source, 'gi')
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    const search = citationToGatewaySearch(match[1])
    if (search) out.push(search)
  }
  return out
}

export function uniqueCitationSearches(texts: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const text of texts) {
    for (const search of extractCitationSearches(text)) {
      const key = search.toLocaleLowerCase('es').replace(/\s+/g, '')
      if (seen.has(key)) continue
      seen.add(key)
      out.push(search)
    }
  }
  return out
}

const MAX_PASSAGES_PER_LINK = 12

/** One or more passage URLs. BibleGateway accepts `;` between passages. */
export function bibleGatewayNtvPassagesUrls(searches: string[]): string[] {
  if (!searches.length) return []
  const urls: string[] = []
  for (let i = 0; i < searches.length; i += MAX_PASSAGES_PER_LINK) {
    const chunk = searches.slice(i, i + MAX_PASSAGES_PER_LINK)
    urls.push(bibleGatewayNtvUrl(chunk.join(';')))
  }
  return urls
}

export function extractCitationHrefs(text: string): { label: string; href: string }[] {
  return splitCitedText(text)
    .filter((p): p is Extract<CitedPart, { type: 'cite' }> => p.type === 'cite')
    .map((p) => ({ label: p.value, href: p.href }))
}
