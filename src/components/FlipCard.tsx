import { useRef, useState } from 'react'
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
  /** Picks the spine color, e.g. "1-reyes". */
  bookId?: string
  /** Shown as a ribbon on both faces. */
  chapterTitle?: string
  /** Touch swipe: left goes to the next card, right to the previous one. */
  onSwipe?: (direction: 'prev' | 'next') => void
}

/** How far a finger must travel sideways before a swipe counts. */
const SWIPE_PX = 70

export function FlipCard({
  front,
  back,
  flipped,
  onFlip,
  className,
  originalNumber,
  instant = false,
  bookId,
  chapterTitle,
  onSwipe,
}: FlipCardProps) {
  const accent = bookId ? `var(--book-${bookId}, var(--primary))` : 'var(--primary)'
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  // The ref decides the swipe; the state only drives the drag animation.
  const dragRef = useRef(0)
  const [dragX, setDragX] = useState(0)

  const endDrag = () => {
    start.current = null
    dragRef.current = 0
    setDragX(0)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        // A swipe ends with a click on touch screens; don't flip on it.
        if (swiped.current) {
          swiped.current = false
          return
        }
        onFlip()
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFlip()
        }
      }}
      onPointerDown={(e) => {
        if (!onSwipe || e.pointerType === 'mouse') return
        start.current = { x: e.clientX, y: e.clientY }
        swiped.current = false
      }}
      onPointerMove={(e) => {
        if (!start.current) return
        const dx = e.clientX - start.current.x
        const dy = e.clientY - start.current.y
        if (Math.abs(dx) > Math.abs(dy)) {
          dragRef.current = dx
          setDragX(dx)
        }
      }}
      onPointerUp={() => {
        const dx = dragRef.current
        if (start.current && Math.abs(dx) >= SWIPE_PX) {
          swiped.current = true
          onSwipe?.(dx < 0 ? 'next' : 'prev')
        }
        endDrag()
      }}
      onPointerCancel={endDrag}
      className={cn(
        'group relative mx-auto h-[min(46svh,420px)] w-full sm:h-[min(56vh,460px)] max-w-2xl cursor-pointer touch-pan-y perspective-[1400px] text-left outline-none',
        'focus-visible:[&>div]:ring-[3px] focus-visible:[&>div]:ring-ring/50 focus-visible:[&>div]:rounded-3xl',
        className,
      )}
      aria-pressed={flipped}
      aria-label={flipped ? 'Mostrar pregunta' : 'Mostrar respuesta'}
    >
      <div
        className={cn('h-full w-full', !dragX && 'transition-transform duration-300 ease-out')}
        style={
          dragX
            ? { transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)` }
            : undefined
        }
      >
        <div
          className={cn(
            'relative h-full w-full [transform-style:preserve-3d]',
            !instant && 'transition-transform duration-[650ms] ease-spring',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          <Face side="front" accent={accent} chapterTitle={chapterTitle} originalNumber={originalNumber}>
            <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-2">
              <div className="text-xl leading-relaxed text-card-foreground sm:text-2xl">{front}</div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <span className="sm:hidden">Toca para voltear · desliza para cambiar</span>
              <span className="hidden sm:inline">Clic o Espacio para voltear</span>
            </p>
          </Face>
          <Face side="back" accent={accent} chapterTitle={chapterTitle} originalNumber={originalNumber}>
            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              <div className="text-lg leading-relaxed whitespace-pre-wrap text-card-foreground sm:text-xl">
                {back}
              </div>
            </div>
          </Face>
        </div>
      </div>
    </div>
  )
}

function Face({
  side,
  accent,
  chapterTitle,
  originalNumber,
  children,
}: {
  side: 'front' | 'back'
  accent: string
  chapterTitle?: string
  originalNumber?: number
  children: React.ReactNode
}) {
  const isBack = side === 'back'
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col overflow-hidden rounded-3xl border bg-card py-6 pr-6 pl-8 shadow-raised [backface-visibility:hidden] sm:py-8 sm:pr-10 sm:pl-12',
        isBack && '[transform:rotateY(180deg)]',
      )}
      style={
        isBack
          ? {
              backgroundColor: `color-mix(in oklch, ${accent} 7%, var(--card))`,
              borderColor: `color-mix(in oklch, ${accent} 40%, var(--border))`,
            }
          : undefined
      }
    >
      <span
        className="absolute inset-y-0 left-0 w-2 sm:w-2.5"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className="flex items-center justify-between gap-3">
        <p
          className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase"
          style={isBack ? { color: `color-mix(in oklch, ${accent} 75%, var(--foreground))` } : undefined}
        >
          {!isBack && <span className="text-muted-foreground">Pregunta</span>}
          {isBack && 'Respuesta'}
        </p>
        {originalNumber != null && originalNumber > 0 && (
          <span
            className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
            aria-label={`Tarjeta original ${originalNumber}`}
          >
            #{originalNumber}
          </span>
        )}
      </div>
      {chapterTitle && (
        <p className="mt-2 inline-flex max-w-full items-center gap-1.5 self-start rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground/80">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
          <span className="truncate">{chapterTitle}</span>
        </p>
      )}
      {children}
    </div>
  )
}
