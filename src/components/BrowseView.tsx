import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Flashcard } from '@/lib/parseFlashcard'
import { bookSortKey } from '@/lib/biblical'
import { useUser } from '@/context/UserContext'
import { getCardStatus } from '@/lib/progress'
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

type BookGroup = {
  bookId: string
  bookLabel: string
  canonIndex: number
  chapters: { chapter: number; cards: Flashcard[] }[]
}

function buildBookGroups(list: Flashcard[]): BookGroup[] {
  const byBook = new Map<string, BookGroup>()

  for (const card of list) {
    let group = byBook.get(card.bookId)
    if (!group) {
      group = {
        bookId: card.bookId,
        bookLabel: card.bookLabel,
        canonIndex: card.canonIndex,
        chapters: [],
      }
      byBook.set(card.bookId, group)
    }
    let chapterGroup = group.chapters.find((c) => c.chapter === card.chapter)
    if (!chapterGroup) {
      chapterGroup = { chapter: card.chapter, cards: [] }
      group.chapters.push(chapterGroup)
    }
    chapterGroup.cards.push(card)
  }

  const books = [...byBook.values()].sort(
    (a, b) =>
      bookSortKey(a.bookId, a.canonIndex) -
      bookSortKey(b.bookId, b.canonIndex),
  )

  for (const book of books) {
    book.chapters.sort((a, b) => a.chapter - b.chapter)
    for (const ch of book.chapters) {
      ch.cards.sort((a, b) => a.question.localeCompare(b.question, 'es'))
    }
  }

  return books
}

function bookIdFromLabel(cards: Flashcard[], label: string | null): string {
  if (!label) return 'all'
  const match = cards.find((c) => c.bookLabel === label)
  return match?.bookId ?? 'all'
}

export function BrowseView({ cards, onSelectCard }: BrowseViewProps) {
  const { userDoc, patchConfig } = useUser()
  const [query, setQuery] = useState('')
  const [bookFilter, setBookFilter] = useState<string>('all')
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>('all')
  const [filtersReady, setFiltersReady] = useState(false)

  useEffect(() => {
    if (!userDoc || filtersReady) return
    const bookId = bookIdFromLabel(cards, userDoc.config.lastBook)
    setBookFilter(bookId)
    const ch = userDoc.config.lastChapter
    setChapterFilter(
      bookId !== 'all' && ch != null ? ch : 'all',
    )
    setFiltersReady(true)
  }, [userDoc, cards, filtersReady])

  useEffect(() => {
    setFiltersReady(false)
  }, [userDoc?.userId])

  const booksInDeck = useMemo(() => {
    const map = new Map<string, { label: string; canonIndex: number }>()
    for (const c of cards) {
      map.set(c.bookId, { label: c.bookLabel, canonIndex: c.canonIndex })
    }
    return [...map.entries()]
      .map(([id, meta]) => ({ id, ...meta }))
      .sort(
        (a, b) =>
          bookSortKey(a.id, a.canonIndex) - bookSortKey(b.id, b.canonIndex),
      )
  }, [cards])

  const chaptersForBook = useMemo(() => {
    if (bookFilter === 'all') return []
    const set = new Set<number>()
    for (const c of cards) {
      if (c.bookId === bookFilter) set.add(c.chapter)
    }
    return [...set].sort((a, b) => a - b)
  }, [cards, bookFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter((c) => {
      if (bookFilter !== 'all' && c.bookId !== bookFilter) return false
      if (chapterFilter !== 'all' && c.chapter !== chapterFilter) return false
      if (!q) return true
      return (
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q) ||
        c.bookLabel.toLowerCase().includes(q) ||
        c.chapterTitle.toLowerCase().includes(q) ||
        String(c.chapter).includes(q)
      )
    })
  }, [cards, query, bookFilter, chapterFilter])

  const grouped = useMemo(() => buildBookGroups(filtered), [filtered])

  const knownCount = userDoc
    ? cards.filter((c) => getCardStatus(userDoc, c.id) === 'known').length
    : 0

  const persistBrowseFilters = (bookId: string, chapter: number | 'all') => {
    if (!userDoc) return
    if (bookId === 'all') {
      patchConfig({ lastBook: null, lastChapter: null })
      return
    }
    const label = booksInDeck.find((b) => b.id === bookId)?.label ?? null
    patchConfig({
      lastBook: label,
      lastChapter: chapter === 'all' ? null : chapter,
    })
  }

  const selectBook = (bookId: string) => {
    setBookFilter(bookId)
    setChapterFilter('all')
    persistBrowseFilters(bookId, 'all')
  }

  const selectChapter = (ch: number | 'all') => {
    setChapterFilter(ch)
    persistBrowseFilters(bookFilter, ch)
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Explorar tarjetas
        </h2>
        <p className="text-sm text-muted-foreground">
          {cards.length} tarjetas
          {userDoc && (
            <>
              {' '}
              · {knownCount} conocidas para {userDoc.displayName}
            </>
          )}
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-9"
            placeholder="Buscar pregunta, respuesta, libro o capítulo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar tarjetas"
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Libro</p>
        <div className="flex flex-wrap gap-2">
          <Badge
            asChild
            variant={bookFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button type="button" onClick={() => selectBook('all')}>
              Todos
            </button>
          </Badge>
          {booksInDeck.map((book) => (
            <Badge
              key={book.id}
              asChild
              variant={bookFilter === book.id ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              <button type="button" onClick={() => selectBook(book.id)}>
                {book.label}
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {bookFilter !== 'all' && chaptersForBook.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Capítulo
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge
              asChild
              variant={chapterFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              <button type="button" onClick={() => selectChapter('all')}>
                Todos
              </button>
            </Badge>
            {chaptersForBook.map((ch) => (
              <Badge
                key={ch}
                asChild
                variant={chapterFilter === ch ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                <button type="button" onClick={() => selectChapter(ch)}>
                  {ch}
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {bookFilter === 'all' && <div className="mb-6" />}

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin resultados</CardTitle>
            <CardDescription>
              No hay tarjetas con estos filtros. Prueba otra búsqueda o elige
              otro libro o capítulo.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((book) => (
            <section key={book.bookId}>
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold tracking-tight">
                {book.bookLabel}
              </h3>
              <div className="flex flex-col gap-6">
                {book.chapters.map((ch) => (
                  <div key={`${book.bookId}-${ch.chapter}`}>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      Capítulo {ch.chapter}
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {ch.cards.map((card) => {
                        const st = userDoc
                          ? getCardStatus(userDoc, card.id)
                          : undefined
                        return (
                          <li key={card.id}>
                            <button
                              type="button"
                              onClick={() => onSelectCard(card.id)}
                              className="w-full rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
                            >
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {card.bookLabel} {card.chapter}
                                </span>
                                {st === 'known' && (
                                  <Badge className="bg-emerald-600 text-white text-[10px]">
                                    Conocida
                                  </Badge>
                                )}
                                {st === 'unknown' && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px]"
                                  >
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
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
