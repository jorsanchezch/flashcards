import { lordStandMeta, type LordStand } from '@/lib/kingsTimeline'
import { cn } from '@/lib/utils'

/** Verdict mark: a shape plus the stand color, readable without color vision. */
export function StandGlyph({
  stand,
  className,
}: {
  stand?: LordStand
  className?: string
}) {
  const meta = lordStandMeta(stand)
  if (!meta) return null
  return (
    <span
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-none font-bold text-white',
        className,
      )}
      style={{ backgroundColor: meta.color }}
      title={meta.label}
      aria-label={meta.label}
      role="img"
    >
      {meta.glyph}
    </span>
  )
}
