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

## Arranque local (otra máquina)

```bash
git clone git@github.com:jorsanchezch/flashcards.git
cd flashcards
./scripts/run-local.sh
```

Equivale a `npm install && npm start` (mismo servidor que `npm run dev`). Abre **http://127.0.0.1:18480/**. Si Safari no conecta a loopback, usa la URL de red que imprime Vite (`http://<lan>:18480/`).

El `.db` y los dumps KJV/ASV van en el clone: [`data/flashcards.db`](data/flashcards.db), [`data/bible-dumps/`](data/bible-dumps/). DBeaver: `jdbc:sqlite:` + ruta absoluta a `data/flashcards.db` en el clone.

`npm run db:import-bible` solo hace falta si vuelves a cargar dumps. `npm run build` exporta JSON a `public/data/` para GitHub Pages (sin texto bíblico). NTV es la versión por defecto; aún no hay dump NTV con licencia en el `.db`.

## Desarrollo local (ya clonado)

```bash
npm install
npm start
```

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

- **Entrada al estudio**: continuar sin ID o identificarse. Jorge Sanchez pide clave. Sin ID, las marcas La sé, Repasar y Revisada son del equipo.
- **Estudiar**: volteo, salto al número de cola, filtros compartidos (libro/capítulo y glosario), mezclar, marcar sin avanzar de tarjeta; citas NTV en pregunta y respuesta; número original arriba a la derecha en las dos caras. Siguiente/Anterior desde la respuesta muestran al instante la pregunta siguiente, sin animación de volteo.
- **Lista**: misma barra de filtros; búsqueda; número original de cada tarjeta.
- **Equipo**: integrantes ordenados por avance (La sé + Revisada).
- **Material**: inventario, mapa del arca, ritmo del curso y glosario (palabras, referencias, filtro y edición).
- **Mazo**: quienes no administran editan solo su copia; la administración puede pasar esos cambios al mazo del curso.

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn/ui.
