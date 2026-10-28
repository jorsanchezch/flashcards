import {
  KINGS,
  LORD_STANDS,
  kingsByKingdom,
  lordStandMeta,
  successorsOf,
  type KingRecord,
  type LordStand,
} from '@/lib/kingsTimeline'

export type QuizScope = 'all' | 'judah' | 'israel'
export type QuizKind = 'order' | 'stand' | 'successor' | 'numbers'

export const QUIZ_KINDS: { kind: QuizKind; label: string; hint: string }[] = [
  { kind: 'order', label: 'Ordenar', hint: 'Pon cinco reyes en orden' },
  { kind: 'stand', label: '¿Recto o malo?', hint: 'La evaluación del relato' },
  { kind: 'successor', label: '¿Quién siguió?', hint: 'Sucesión en el trono' },
  { kind: 'numbers', label: 'Edades y años', hint: 'Datos que da el texto' },
]

export type ChoiceQuestion = {
  kind: 'stand' | 'successor' | 'numbers'
  king: KingRecord
  prompt: string
  choices: string[]
  answer: string
}

export type OrderQuestion = {
  kind: 'order'
  /** Shuffled; the answer is these sorted by `startBc` descending. */
  kings: KingRecord[]
  prompt: string
}

export type QuizQuestion = ChoiceQuestion | OrderQuestion

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function israelites(scope: QuizScope): KingRecord[] {
  if (scope === 'judah') return kingsByKingdom('judah')
  if (scope === 'israel') return kingsByKingdom('israel')
  return KINGS.filter(
    (k) => k.kingdom === 'united' || k.kingdom === 'judah' || k.kingdom === 'israel',
  )
}

/** Distractors of the same kind: names a learner could plausibly confuse. */
function nameChoices(answer: KingRecord, pool: KingRecord[]): string[] {
  const near = pool
    .filter((k) => k.id !== answer.id && k.name !== answer.name)
    .sort(
      (a, b) =>
        Math.abs(a.startBc - answer.startBc) - Math.abs(b.startBc - answer.startBc),
    )
    .slice(0, 6)
  return shuffle([answer.name, ...shuffle(near).slice(0, 3).map((k) => k.name)])
}

function numberChoices(answer: number): string[] {
  const offsets = shuffle([-10, -5, -3, -2, 2, 3, 5, 8, 10]).filter(
    (d) => answer + d > 0,
  )
  return shuffle([answer, ...offsets.slice(0, 3).map((d) => answer + d)]).map(String)
}

function standQuestion(king: KingRecord): ChoiceQuestion {
  const stand = king.lordStand as LordStand
  return {
    kind: 'stand',
    king,
    prompt: `¿Cómo evalúa el relato a ${king.name}?`,
    choices: LORD_STANDS.filter((s) => s !== 'not_applicable').map(
      (s) => lordStandMeta(s)!.shortLabel,
    ),
    answer: lordStandMeta(stand)!.shortLabel,
  }
}

function successorQuestion(king: KingRecord, pool: KingRecord[]): ChoiceQuestion | null {
  const next = successorsOf(king)
  if (next.length !== 1) return null
  return {
    kind: 'successor',
    king,
    prompt: `¿Quién reinó después de ${king.name}?`,
    choices: nameChoices(next[0], pool),
    answer: next[0].name,
  }
}

function numbersQuestion(king: KingRecord): ChoiceQuestion | null {
  const ages = king.ages
  if (!ages) return null
  const options: { prompt: string; value: number }[] = []
  if (ages.accessionAge != null) {
    options.push({
      prompt: `¿Qué edad tenía ${king.name} al comenzar a reinar?`,
      value: ages.accessionAge,
    })
  }
  if (ages.reignYears) {
    options.push({
      prompt: `¿Cuántos años reinó ${king.name}?`,
      value: ages.reignYears,
    })
  }
  if (!options.length) return null
  const chosen = pick(options)
  return {
    kind: 'numbers',
    king,
    prompt: chosen.prompt,
    choices: numberChoices(chosen.value),
    answer: String(chosen.value),
  }
}

function orderQuestion(pool: KingRecord[]): OrderQuestion {
  const sorted = [...pool].sort((a, b) => b.startBc - a.startBc)
  const size = Math.min(5, sorted.length)
  const start = Math.floor(Math.random() * (sorted.length - size + 1))
  const run = sorted.slice(start, start + size)
  let kings = shuffle(run)
  if (kings.every((k, i) => k.id === run[i].id)) kings = [...run].reverse()
  return {
    kind: 'order',
    kings,
    prompt: 'Ordena del más antiguo al más reciente',
  }
}

/** One question; `focus` repeats a king the learner missed when possible. */
export function makeQuestion(
  kind: QuizKind,
  scope: QuizScope,
  focus?: KingRecord,
): QuizQuestion {
  const pool = israelites(scope)
  if (kind === 'order') return orderQuestion(pool)

  const candidates = (focus ? [focus, ...shuffle(pool)] : shuffle(pool)).filter(
    (k) => pool.some((p) => p.id === k.id),
  )
  for (const king of candidates) {
    if (kind === 'stand' && king.lordStand && king.lordStand !== 'not_applicable') {
      return standQuestion(king)
    }
    if (kind === 'successor') {
      const q = successorQuestion(king, pool)
      if (q) return q
    }
    if (kind === 'numbers') {
      const q = numbersQuestion(king)
      if (q) return q
    }
  }
  return orderQuestion(pool)
}

export function isOrderCorrect(kings: KingRecord[]): boolean {
  return kings.every((k, i) => i === 0 || kings[i - 1].startBc >= k.startBc)
}

export type QuizStats = { answered: number; correct: number; best: number }

const STATS_KEY = 'kings-quiz-stats'

export function loadQuizStats(): QuizStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return { answered: 0, correct: 0, best: 0, ...JSON.parse(raw) }
  } catch {
    // Storage may be blocked; start fresh.
  }
  return { answered: 0, correct: 0, best: 0 }
}

export function saveQuizStats(stats: QuizStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // Ignore: stats are a convenience.
  }
}
