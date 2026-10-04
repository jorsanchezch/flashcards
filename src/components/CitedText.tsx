import { extractCitationHrefs, splitCitedText } from '@/lib/bibleGateway'
import {
  findGlossaryMatches,
  type CompiledGlossaryForm,
} from '@/lib/glossary'
import { useGlossary } from '@/context/GlossaryContext'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type CitedTextProps = {
  text: string
  className?: string
  /** When `plain`, citations stay as text (use CitationLinks beside them). */
  citeStyle?: 'inline' | 'plain'
}

function HighlightedPlain({
  text,
  matchers,
}: {
  text: string
  matchers: CompiledGlossaryForm[]
}) {
  if (!text) return null
  const matches = findGlossaryMatches(text, matchers)
  if (!matches.length) return <>{text}</>

  const nodes: ReactNode[] = []
  let cursor = 0
  matches.forEach((match, i) => {
    if (match.start > cursor) {
      nodes.push(text.slice(cursor, match.start))
    }
    nodes.push(
      <strong key={`${match.start}-${match.end}-${i}`} className="font-semibold">
        {text.slice(match.start, match.end)}
      </strong>,
    )
    cursor = match.end
  })
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return <>{nodes}</>
}

export function CitedText({
  text,
  className,
  citeStyle = 'inline',
}: CitedTextProps) {
  const { matchers } = useGlossary()
  const parts = splitCitedText(text)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === 'cite' ? (
          citeStyle === 'plain' ? (
            <span key={`${part.href}-${i}`}>{part.value}</span>
          ) : (
          <a
            key={`${part.href}-${i}`}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline rounded-sm text-primary underline decoration-primary/70 underline-offset-2 touch-manipulation [-webkit-tap-highlight-color:transparent]"
          >
            {part.value}
          </a>
          )
        ) : (
          <span key={i}>
            <HighlightedPlain text={part.value} matchers={matchers} />
          </span>
        ),
      )}
    </span>
  )
}

type CitationLinksProps = {
  text: string
  className?: string
  compact?: boolean
}

/** Compact tap targets for citations next to an editor field. */
export function CitationLinks({
  text,
  className,
  compact = false,
}: CitationLinksProps) {
  const links = extractCitationHrefs(text)
  if (!links.length) return null
  return (
    <p className={cn('mt-2 flex flex-wrap gap-2', className)}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
            'inline-flex items-center rounded-md border border-primary/30 bg-primary/5 text-primary underline decoration-primary/70 underline-offset-2 touch-manipulation',
            compact
              ? 'min-h-9 px-2 py-1 text-xs'
              : 'min-h-11 px-3 text-sm',
          )}
        >
          {compact
            ? link.label.replace(/^\(|\)$/g, '')
            : `Abrir ${link.label.replace(/^\(|\)$/g, '')} en NTV`}
        </a>
      ))}
    </p>
  )
}
