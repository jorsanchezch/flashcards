import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type NativeSelectProps = React.ComponentProps<'select'> & {
  density?: 'sm' | 'default'
  wrapperClassName?: string
}

/** A styled native `<select>`: keeps the platform picker on phones. */
function NativeSelect({
  className,
  wrapperClassName,
  density = 'default',
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div data-slot="native-select" className={cn('relative', wrapperClassName)}>
      <select
        className={cn(
          'w-full appearance-none rounded-lg border border-input bg-card pr-9 pl-3 text-sm shadow-xs transition-colors outline-none',
          'hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50',
          density === 'sm' ? 'h-9 text-xs' : 'h-11',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}

export { NativeSelect }
