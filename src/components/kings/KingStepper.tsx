import { ChevronLeft, ChevronRight } from 'lucide-react'
import { kingdomMeta, type KingRecord } from '@/lib/kingsTimeline'
import { cn } from '@/lib/utils'
import { StandGlyph } from './StandGlyph'

type KingStepperProps = {
  king: KingRecord | null
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  /** Opens the king's detail; omitted where the detail is already on screen. */
  onOpen?: () => void
  className?: string
}

/** ‹ King › control for walking the chronology without a keyboard. */
export function KingStepper({
  king,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onOpen,
  className,
}: KingStepperProps) {
  const meta = king ? kingdomMeta(king.kingdom) : null
  const label = king ? (
    <>
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: meta?.color }}
        aria-hidden
      />
      <span className="truncate font-semibold">{king.name}</span>
      <StandGlyph stand={king.lordStand} className="size-3.5 text-[9px]" />
      <span className="hidden text-muted-foreground tabular-nums sm:inline">
        {king.startBc}
        {king.endBc !== king.startBc ? `–${king.endBc}` : ''}
      </span>
    </>
  ) : (
    <span className="text-muted-foreground">Elige un rey</span>
  )

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border bg-card p-1 shadow-card',
        className,
      )}
      role="group"
      aria-label="Recorrer los reyes en orden"
    >
      <StepButton direction="prev" disabled={!canPrev} onClick={onPrev} />
      {onOpen && king ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-sm transition-colors hover:bg-accent/50"
          aria-label={`Ver detalle de ${king.name}`}
        >
          {label}
        </button>
      ) : (
        <span
          className="flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1.5 px-2 text-sm"
          aria-live="polite"
        >
          {label}
        </span>
      )}
      <StepButton direction="next" disabled={!canNext} onClick={onNext} />
    </div>
  )
}

function StepButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Rey anterior en el tiempo' : 'Rey siguiente en el tiempo'}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-35"
    >
      <Icon className="size-4" />
    </button>
  )
}
