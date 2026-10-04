# Flashcards — Samuel y Reyes (GitHub Pages)

Aplicación web estática para estudiar **974 tarjetas** en Markdown sobre **1 Samuel, 2 Samuel, 1 Reyes y 2 Reyes** (NTV). Los archivos `.md` en el repositorio son la fuente de verdad; la app solo los lee y parsea en el navegador.

## Contenido (Markdown)

| Ubicación | Descripción |
|-----------|-------------|
| [`public/flashcards/`](public/flashcards/) | Tarjetas servidas en producción (copia desplegable) |
| [`obsidian-vault/flashcards/`](obsidian-vault/flashcards/) | Mismo contenido, alineado con el vault de Obsidian |
| [`obsidian-vault/notes/`](obsidian-vault/notes/) | Notas de contexto (no son tarjetas) |
| [`public/viaje-del-arca.png`](public/viaje-del-arca.png) | Mapa del viaje del arca (1 Samuel 4–7) |

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

## Publicar en GitHub (`flashcards`)

Repositorio: **https://github.com/jorsanchezch/flashcards** (público).

Sitio en Pages: **https://jorsanchezch.github.io/flashcards/**

## GitHub Pages

La app usa `base` de Vite apuntando a `/<nombre-del-repo>/` en producción (por defecto `/flashcards/`, o el nombre que indique `GITHUB_REPOSITORY` en CI).

Haz push a `main`: el workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) ejecuta `npm run build` y publica `dist`.

## Funciones

- **Entrada al estudio**: continuar sin ID o identificarse con uno de los 13 nombres del equipo. Sin ID, las marcas La sé, Repasar y Revisada son del equipo y se ven en Equipo.
- **Estudiar**: volteo, navegación, salto a un número de tarjeta, mezclar, marcar; citas NTV enlazan a Bible Gateway.
- **Explorar**: búsqueda y filtros por libro y capítulo (orden bíblico: Samuel y luego Reyes).
- **Equipo**: resumen de las 13 personas y el avance compartido sin ID; **Actualizar resumen del equipo** incluye ese avance del grupo.
- **Material**: inventario del grupo, mapa del viaje del arca y ritmo del curso (lunes, miércoles y viernes, 1 sep–31 oct 2026).
- Atajos de teclado, barra de progreso de sesión, estados vacío/carga/error.

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn/ui.
