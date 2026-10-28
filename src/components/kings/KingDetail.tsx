import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  cardsForKing,
  formatReignSpan,
  kingdomMeta,
  lordStandMeta,
  passageToNtvUrl,
  predecessorsOf,
  successorsOf,
  type KingRecord,
} from '@/lib/kingsTimeline'
import type { Flashcard } from '@/lib/parseFlashcard'
import { cn } from '@/lib/utils'
import { StandGlyph } from './StandGlyph'

type KingDetailProps = {
  king: KingRecord
  cards: Flashcard[]
  onSelect: (id: string) => void
  onPrev: () => void
  onNext: () => void
  onOpenCardInStudy?: (cardId: string) => void
  onClose?: () => void
  className?: string
}

const CARD_PREVIEW = 4

export function KingDetail({
  king,
  cards,
  onSelect,
  onPrev,
  onNext,
  onOpenCardInStudy,
  onClose,
  className,
}: KingDetailProps) {
  const meta = kingdomMeta(king.kingdom)
  const stand = lordStandMeta(king.lordStand)
  const before = predecessorsOf(king)
  const after = successorsOf(king)
  const kingCards = useMemo(() => cardsForKing(king, cards), [king, cards])
  const [showAllCards, setShowAllCards] = useState(false)
  const visibleCards = showAllCards ? kingCards : kingCards.slice(0, CARD_PREVIEW)

  const stats = [
    { label: 'Edad al reinar', value: king.ages?.accessionAge },
    {
      label: 'Años de reinado',
      value:
        king.ages?.reignYears === 0 ? 'Breve' : king.ages?.reignYears,
    },
    { label: 'Edad al morir', value: king.ages?.deathAge },
  ]

  return (
    <article
      key={king.id}
      className={cn(
        'animate-fade-in overflow-hidden rounded-2xl border bg-card shadow-raised',
        className,
      )}
      aria-label={`Detalle de ${king.name}`}
    >
      <header
        className="relative px-4 pt-4 pb-3"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklch, ${meta.color} 16%, transparent), transparent 70%)`,
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-card"
            style={{ backgroundColor: meta.color }}
            aria-hidden
          >
            <Crown className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {meta.label}
            </p>
            <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight">
              {king.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
              {formatReignSpan(king)}
            </p>
          </div>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-1 size-10"
              onClick={onClose}
              aria-label="Cerrar detalle"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 flex-1"
            onClick={onPrev}
            aria-label="Rey anterior en el tiempo"
          >
            <ChevronLeft /> Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 flex-1"
            onClick={onNext}
            aria-label="Rey siguiente en el tiempo"
          >
            Siguiente <ChevronRight />
          </Button>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-1 pb-4">
        {stand && king.lordVerdict && (
          <div
            className="rounded-xl border p-3"
            style={{
              borderColor: `color-mix(in oklch, ${stand.color} 40%, transparent)`,
              backgroundColor: `color-mix(in oklch, ${stand.color} 9%, transparent)`,
            }}
          >
            <div className="flex items-center gap-2">
              <StandGlyph stand={king.lordStand} />
              <span className="text-sm font-semibold">{stand.label}</span>
            </div>
            <blockquote className="mt-1.5 text-sm leading-relaxed text-foreground/85 italic">
              {king.lordVerdict}
            </blockquote>
          </div>
        )}

        {stats.some((s) => s.value != null) && (
          <dl className="grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-muted/60 px-2 py-2 text-center"
              >
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {s.value ?? '—'}
                </dd>
                <dt className="text-[11px] leading-tight text-muted-foreground">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        )}

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Sucesión</p>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {before.length ? (
              before.map((k) => (
                <KingChip key={k.id} king={k} onSelect={onSelect} />
              ))
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                {king.father ?? king.predecessor ?? '—'}
              </span>
            )}
            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
            <span className="rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-foreground">
              {king.name}
            </span>
            {after.length > 0 && (
              <>
                <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                {after.map((k) => (
                  <KingChip key={k.id} king={k} onSelect={onSelect} />
                ))}
              </>
            )}
          </div>
          {king.father && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Padre: <span className="font-medium text-foreground">{king.father}</span>
            </p>
          )}
        </div>

        <p className="text-sm leading-relaxed text-foreground/85">{king.events}</p>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Pasajes (NTV)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {king.passages.map((p) => (
              <a
                key={p}
                href={passageToNtvUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-8 items-center gap-1 rounded-full border bg-background px-2.5 text-xs font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {p}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {onOpenCardInStudy && kingCards.length > 0 && (
          <div className="rounded-xl border bg-background/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <BookOpenCheck className="size-4 text-primary" aria-hidden />
                Tarjetas de este rey
              </p>
              <Badge variant="secondary" className="tabular-nums">
                {kingCards.length}
              </Badge>
            </div>
            <ul className="mt-2 space-y-1">
              {visibleCards.map((card) => (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCardInStudy(card.id)}
                    className="flex w-full min-h-10 items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50"
                  >
                    <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                      {card.bookLabel.replace(' Reyes', ' R')} {card.chapter}
                    </span>
                    <span className="line-clamp-2">{card.question}</span>
                  </button>
                </li>
              ))}
            </ul>
            {kingCards.length > CARD_PREVIEW && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 w-full"
                onClick={() => setShowAllCards((v) => !v)}
              >
                {showAllCards ? 'Ver menos' : `Ver las ${kingCards.length} tarjetas`}
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function KingChip({
  king,
  onSelect,
}: {
  king: KingRecord
  onSelect: (id: string) => void
}) {
  const meta = kingdomMeta(king.kingdom)
  return (
    <button
      type="button"
      onClick={() => onSelect(king.id)}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 font-medium transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
      {king.name}
    </button>
  )
}
