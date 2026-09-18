import { cn } from '@/lib/utils'

type FlipCardProps = {
  front: React.ReactNode
  back: React.ReactNode
  flipped: boolean
  onFlip: () => void
  className?: string
}

export function FlipCard({
  front,
  back,
  flipped,
  onFlip,
  className,
}: FlipCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className={cn(
        'group relative mx-auto h-[min(52vh,420px)] w-full max-w-2xl cursor-pointer perspective-[1200px] text-left',
        className,
      )}
      aria-pressed={flipped}
      aria-label={flipped ? 'Mostrar pregunta' : 'Mostrar respuesta'}
    >
      <div
        className={cn(
          'relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <div
          className="absolute inset-0 flex flex-col justify-center rounded-2xl border bg-card p-6 shadow-lg [backface-visibility:hidden] sm:p-10"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pregunta
          </p>
          <div className="text-lg leading-relaxed text-card-foreground sm:text-2xl">
            {front}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Toca, haz clic o pulsa Espacio para voltear
          </p>
        </div>
        <div
          className="absolute inset-0 flex flex-col justify-center rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-10"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary">
            Respuesta
          </p>
          <div className="whitespace-pre-wrap text-lg leading-relaxed text-card-foreground sm:text-xl">
            {back}
          </div>
        </div>
      </div>
    </button>
  )
}
