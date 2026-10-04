/** Dev reads SQLite via the Vite plugin; production reads exported JSON. */

function baseUrl() {
  return import.meta.env.BASE_URL
}

export function cardsCatalogUrl(): string {
  return import.meta.env.DEV
    ? `${baseUrl()}api/local/cards`
    : `${baseUrl()}data/cards.json`
}

export function glossaryCatalogUrl(): string {
  return import.meta.env.DEV
    ? `${baseUrl()}api/local/glossary`
    : `${baseUrl()}data/glossary.json`
}
