import { cn } from '@/lib/utils'

type FlipCardProps = {
  front: React.ReactNode
  back: React.ReactNode
  flipped: boolean
  onFlip: () => void
  className?: string
  originalNumber?: number
  /** Skip the 3D flip when jumping to another card. */
  instant?: boolean
}

export function FlipCard({
  front,
  back,
  flipped,
  onFlip,
  className,
  originalNumber,
  instant = false,
}: FlipCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFlip()
        }
      }}
      className={cn(
        'group relative mx-auto h-[min(52vh,420px)] w-full max-w-2xl cursor-pointer perspective-[1200px] text-left',
        className,
      )}
      aria-pressed={flipped}
      aria-label={flipped ? 'Mostrar pregunta' : 'Mostrar respuesta'}
    >
      <div
        className={cn(
          'relative h-full w-full [transform-style:preserve-3d]',
          !instant && 'transition-transform duration-500',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border bg-card p-6 shadow-lg [backface-visibility:hidden] sm:p-10"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pregunta
            </p>
            {originalNumber != null && originalNumber > 0 && (
              <span
                className="shrink-0 text-xs tabular-nums text-muted-foreground"
                aria-label={`Tarjeta original ${originalNumber}`}
              >
                {originalNumber}
              </span>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
            <div className="text-lg leading-relaxed text-card-foreground sm:text-2xl">
              {front}
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Toca, haz clic o pulsa Espacio para voltear
          </p>
        </div>
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-10"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Respuesta
            </p>
            {originalNumber != null && originalNumber > 0 && (
              <span
                className="shrink-0 text-xs tabular-nums text-muted-foreground"
                aria-label={`Tarjeta original ${originalNumber}`}
              >
                {originalNumber}
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-card-foreground sm:text-xl">
              {back}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
