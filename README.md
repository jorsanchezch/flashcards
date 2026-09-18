# Flashcards — 1 Samuel (GitHub Pages)

Aplicación web estática para estudiar **96 tarjetas** en Markdown sobre el libro de 1 Samuel. Los archivos `.md` en el repositorio son la fuente de verdad; la app solo los lee y parsea en el navegador.

## Contenido (Markdown)

| Ubicación | Descripción |
|-----------|-------------|
| [`public/flashcards/`](public/flashcards/) | Tarjetas servidas en producción (copia desplegable) |
| [`obsidian-vault/flashcards/`](obsidian-vault/flashcards/) | Mismo contenido, alineado con el vault de Obsidian |
| [`obsidian-vault/notes/`](obsidian-vault/notes/) | Notas de contexto (no son tarjetas) |

Antes de `dev` o `build`, el script [`scripts/generate-flashcard-manifest.mjs`](scripts/generate-flashcard-manifest.mjs) sincroniza desde `obsidian-vault/flashcards/` hacia `public/flashcards/` (si existe el vault) y genera `public/flashcards/manifest.json`.

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor de Vite escucha en **http://127.0.0.1:4321/** (puerto fijo).

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

La app usa `base` de Vite apuntando a `/<nombre-del-repo>/` en builds de producción (detectado vía `GITHUB_REPOSITORY` en CI, o con `VITE_BASE_PATH` manual).

### Opción recomendada: GitHub Actions

1. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Haz push a `main`: el workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) ejecuta `npm run build` y publica `dist`.

### Opción alternativa: rama `docs`

Si prefieres publicar sin Actions, puedes construir localmente y subir `dist` a una carpeta `docs/` en `main`, con **Pages → Deploy from branch → `/docs`**. La opción con Actions suele ser más fiable porque no hay que commitear artefactos de build.

## Funciones

- **Estudiar**: tarjetas grandes con volteo (clic / toque / Espacio), anterior/siguiente, mezclar, marcar conocida/repasar (`localStorage`).
- **Explorar**: búsqueda, filtro por capítulo, abrir una tarjeta en modo estudio.
- Atajos de teclado, barra de progreso de sesión, estados vacío/carga/error.

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn/ui.
