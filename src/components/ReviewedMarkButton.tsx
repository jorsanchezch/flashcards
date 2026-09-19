import { useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { formatReviewMoment } from '@/lib/formatDate'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ReviewedMarkButtonProps = {
  timestamps: string[]
  onMark: () => void
  shortcutHint?: string
}

export function ReviewedMarkButton({
  timestamps,
  onMark,
  shortcutHint = 'R',
}: ReviewedMarkButtonProps) {
  const [open, setOpen] = useState(false)
  const longPressRef = useRef<number | null>(null)
  const longPressOpenedRef = useRef(false)
  const history = [...timestamps].reverse()

  const clearLongPress = () => {
    if (longPressRef.current != null) {
      window.clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  const handleMark = () => {
    if (longPressOpenedRef.current) {
      longPressOpenedRef.current = false
      return
    }
    onMark()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <div
        className="inline-flex"
        onMouseEnter={() => {
          if (history.length > 0) setOpen(true)
        }}
        onMouseLeave={() => setOpen(false)}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleMark()
            }}
            onTouchStart={() => {
              clearLongPress()
              longPressOpenedRef.current = false
              longPressRef.current = window.setTimeout(() => {
                if (history.length > 0) {
                  setOpen(true)
                  longPressOpenedRef.current = true
                }
              }, 450)
            }}
            onTouchEnd={clearLongPress}
            onTouchCancel={clearLongPress}
            aria-haspopup={history.length > 0 ? 'menu' : undefined}
            aria-expanded={open}
          >
            <CheckCircle2 className="size-4" />
            Revisada
            {history.length > 0 && (
              <span className="text-xs opacity-80">({history.length})</span>
            )}
            {shortcutHint && (
              <span className="hidden text-xs opacity-70 sm:inline">
                ({shortcutHint})
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="max-h-56 w-56"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>Historial de repaso</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {history.length === 0 ? (
            <DropdownMenuItem disabled>Sin repasos aún</DropdownMenuItem>
          ) : (
            history.map((ts) => (
              <DropdownMenuItem
                key={ts}
                onSelect={(e) => e.preventDefault()}
                className="text-xs"
              >
                {formatReviewMoment(ts)}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  )
}
