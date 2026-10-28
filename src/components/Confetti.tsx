import { useEffect, useState } from 'react'

const COLORS = [
  'var(--gold)',
  'var(--primary)',
  'var(--known)',
  'var(--reviewed)',
  'var(--review-again)',
  'var(--book-1-samuel)',
  'var(--book-2-samuel)',
]

function makeBits(pieces: number) {
  return Array.from({ length: pieces }, (_, i) => ({
    left: Math.random() * 100,
    drift: (Math.random() - 0.5) * 30,
    spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
    delay: Math.random() * 0.5,
    dur: 1.8 + Math.random() * 1.2,
    color: COLORS[i % COLORS.length],
    round: Math.random() < 0.35,
  }))
}

/** A one-off burst of falling confetti; reduced-motion settings skip it. */
export function Confetti({ pieces = 36, durationMs = 3200 }: { pieces?: number; durationMs?: number }) {
  const [visible, setVisible] = useState(true)
  const [bits] = useState(() => makeBits(pieces))

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs])

  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 block"
          style={
            {
              left: `${b.left}%`,
              width: b.round ? 8 : 7,
              height: b.round ? 8 : 12,
              borderRadius: b.round ? 999 : 2,
              backgroundColor: b.color,
              '--drift': `${b.drift}vw`,
              '--spin': `${b.spin}deg`,
              '--delay': `${b.delay}s`,
              '--dur': `${b.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
