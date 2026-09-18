import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Flashcard } from '@/lib/parseFlashcard'
import { loadProgress } from '@/lib/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type BrowseViewProps = {
  cards: Flashcard[]
  onSelectCard: (id: string) => void
}

export function BrowseView({ cards, onSelectCard }: BrowseViewProps) {
  const [query, setQuery] = useState('')
  const [chapter, setChapter] = useState<string>('all')
  const progress = loadProgress()

  const chapters = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of cards) {
      map.set(c.chapterSlug, c.chapterTitle)
    }
    return [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'es'),
    )
  }, [cards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter((c) => {
      if (chapter !== 'all' && c.chapterSlug !== chapter) return false
      if (!q) return true
      return (
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q) ||
        c.chapterTitle.toLowerCase().includes(q)
      )
    })
  }, [cards, query, chapter])

  const knownCount = cards.filter((c) => progress[c.id] === 'known').length

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Explorar tarjetas
        </h2>
        <p className="text-sm text-muted-foreground">
          {cards.length} tarjetas · {knownCount} marcadas como conocidas en este
          dispositivo
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-9"
            placeholder="Buscar pregunta, respuesta o capítulo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar tarjetas"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge
          asChild
          variant={chapter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          <button type="button" onClick={() => setChapter('all')}>
            Todos
          </button>
        </Badge>
        {chapters.map(([slug, title]) => (
          <Badge
            key={slug}
            asChild
            variant={chapter === slug ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button type="button" onClick={() => setChapter(slug)}>
              {title}
            </button>
          </Badge>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin resultados</CardTitle>
            <CardDescription>
              Prueba otra búsqueda o quita el filtro de capítulo.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((card) => {
            const st = progress[card.id]
            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => onSelectCard(card.id)}
                  className="w-full rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {card.chapterTitle}
                    </span>
                    {st === 'known' && (
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        Conocida
                      </Badge>
                    )}
                    {st === 'unknown' && (
                      <Badge variant="destructive" className="text-[10px]">
                        Repasar
                      </Badge>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm font-medium">
                    {card.question}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
