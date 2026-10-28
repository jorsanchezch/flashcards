import type { ComponentType, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChoiceCardProps = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: ReactNode
  onClick: () => void
  /** The highlighted choice; the other one stays quiet. */
  primary?: boolean
  className?: string
}

/** A large tappable option with an icon, a title and a line of explanation. */
export function ChoiceCard({
  icon: Icon,
  title,
  description,
  onClick,
  primary = false,
  className,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-5 text-left shadow-card transition-all',
        'hover:-translate-y-0.5 hover:shadow-raised focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-0 active:scale-[0.99]',
        primary
          ? 'border-transparent bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_70%,var(--gold))] text-primary-foreground'
          : 'bg-card hover:border-primary/40',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
          primary ? 'bg-white/15' : 'bg-primary/10 text-primary',
        )}
        aria-hidden
      >
        <Icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg leading-tight font-semibold">{title}</span>
        <span
          className={cn(
            'mt-1 block text-sm leading-snug',
            primary ? 'text-primary-foreground/85' : 'text-muted-foreground',
          )}
        >
          {description}
        </span>
      </span>
      <ChevronRight
        className={cn(
          'mt-3 size-5 shrink-0 transition-transform group-hover:translate-x-0.5',
          primary ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
        aria-hidden
      />
    </button>
  )
}
