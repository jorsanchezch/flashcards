import type { ComponentType, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type MaterialRowProps = {
  icon: ComponentType<{ className?: string }>
  title: string
  subtitle: ReactNode
  /** Shown on the right while closed (e.g. a count); defaults to "Abrir". */
  meta?: ReactNode
  open: boolean
  onToggle: () => void
}

/** Header row for one item in Material; opens and closes its panel. */
export function MaterialRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  open,
  onToggle,
}: MaterialRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        'group relative flex w-full min-h-14 items-center justify-between gap-3 overflow-hidden rounded-xl border bg-card px-4 py-3 text-left shadow-card transition-all',
        'hover:border-primary/30 hover:bg-accent/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        open && 'border-primary/30 bg-accent/20',
      )}
    >
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-1 bg-primary transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      />
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors',
            open && 'bg-primary text-primary-foreground',
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="block font-medium">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        {open ? 'Cerrar' : (meta ?? 'Abrir')}
        <ChevronDown
          className={cn('size-4 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </span>
    </button>
  )
}
