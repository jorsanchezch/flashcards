import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { DialogOverlay } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetClose = DialogPrimitive.Close
const SheetTitle = DialogPrimitive.Title

const SIDES = {
  /** Slides up from the bottom. */
  bottom: 'inset-x-0 bottom-0 max-h-[85svh] rounded-t-2xl border-t animate-sheet-up',
  /** Slides in from the right. */
  right: 'inset-y-0 right-0 h-full w-full max-w-[420px] border-l animate-drawer-in',
  /** Bottom sheet on phones, right drawer from `sm` up. */
  responsive:
    'inset-x-0 bottom-0 max-h-[85svh] rounded-t-2xl border-t animate-sheet-up sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:h-full sm:w-[420px] sm:rounded-none sm:border-t-0 sm:border-l sm:animate-drawer-in',
} as const

type SheetContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: keyof typeof SIDES
}

function SheetContent({ className, side = 'responsive', children, ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        aria-describedby={undefined}
        className={cn(
          'scrollbar-thin fixed z-50 overflow-y-auto bg-background pb-[env(safe-area-inset-bottom)] shadow-raised outline-none',
          SIDES[side],
          className,
        )}
        {...props}
      >
        {(side === 'bottom' || side === 'responsive') && (
          <div
            className={cn(
              'sticky top-0 z-10 flex justify-center bg-background pt-2 pb-1',
              side === 'responsive' && 'sm:hidden',
            )}
            aria-hidden
          >
            <span className="h-1 w-10 rounded-full bg-border" />
          </div>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Sheet, SheetClose, SheetContent, SheetTitle }
