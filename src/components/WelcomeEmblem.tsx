import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Decorative crown with the four book colors orbiting it. */
const DOTS = [
  { color: 'var(--book-1-samuel)', className: '-top-1 left-2 size-3' },
  { color: 'var(--book-2-samuel)', className: 'top-3 -right-3 size-2.5' },
  { color: 'var(--book-1-reyes)', className: '-bottom-2 right-3 size-3.5' },
  { color: 'var(--book-2-reyes)', className: 'bottom-4 -left-3 size-2' },
]

export function WelcomeEmblem({ className }: { className?: string }) {
  return (
    <div className={cn('relative mx-auto size-20', className)} aria-hidden>
      <span className="absolute inset-0 rotate-6 rounded-3xl bg-gold/30" />
      <span className="animate-bounce-in absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_55%,var(--gold))] text-primary-foreground shadow-raised">
        <Crown className="size-10" />
      </span>
      {DOTS.map((dot) => (
        <span
          key={dot.color}
          className={cn('absolute rounded-full shadow-card', dot.className)}
          style={{ backgroundColor: dot.color }}
        />
      ))}
    </div>
  )
}
