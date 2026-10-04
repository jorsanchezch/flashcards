import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { CitedText } from '@/components/CitedText'
import { DeckSessionPrompt } from '@/components/DeckSessionPrompt'
import { UserPickerView } from '@/components/UserPickerView'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGlossary } from '@/context/GlossaryContext'
import { useUser } from '@/context/UserContext'
import {
  cardsForGlossaryTerm,
  glossaryBibleSearchUrl,
  glossaryKindLabel,
  GLOSSARY_KINDS,
  isCustomGlossaryId,
  isGlossaryKind,
  newGlossaryEntryId,
  type GlossaryEntry,
  type GlossaryKind,
} from '@/lib/glossary'
import { toggleGlossaryTerm, getGlossaryTermIds, setGlossaryTermIds } from '@/lib/deckFilter'
import { groupingsPatch } from '@/lib/userData'
import type { Flashcard } from '@/lib/parseFlashcard'
import { cn } from '@/lib/utils'

type GlossaryPanelProps = {
  cards: Flashcard[]
  selectedTermId: string | null
  onSelectTerm: (id: string | null) => void
  autoOpenDetails?: boolean
  onAutoOpenDetailsConsumed?: () => void
  onOpenCardInStudy: (cardId: string) => void
  onStudyWithFilter?: () => void
  onBackToMaterials: () => void
  suggestedUserId?: string | null
}

type EditorState = {
  id: string
  term: string
  aliases: string
  kind: GlossaryKind
  note: string
  properName: boolean
}

function toEditor(entry?: GlossaryEntry | null): EditorState {
  return {
    id: entry?.id ?? newGlossaryEntryId(),
    term: entry?.term ?? '',
    aliases: entry?.aliases.join(', ') ?? '',
    kind: entry?.kind ?? 'persona',
    note: entry?.note ?? '',
    properName: entry?.properName ?? false,
  }
}

function parseAliases(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function GlossaryPanel({
  cards,
  selectedTermId,
  onSelectTerm,
  autoOpenDetails,
  onAutoOpenDetailsConsumed,
  onOpenCardInStudy,
  onStudyWithFilter,
  onBackToMaterials,
  suggestedUserId,
}: GlossaryPanelProps) {
  const { status, message, entries, matchers, reload } = useGlossary()
  const {
    userDoc,
    hasSession,
    isGuest,
    roster,
    continueAsGuest,
    selectUser,
    saveGlossaryEntry,
    deleteGlossaryEntry,
    patchConfig,
  } = useUser()
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GlossaryEntry | null>(null)
  const [sessionPrompt, setSessionPrompt] = useState(false)
  const [showIdentify, setShowIdentify] = useState(false)
  const [pendingAfterSession, setPendingAfterSession] = useState<
    'add' | GlossaryEntry | null
  >(null)

  const [pendingFilterId, setPendingFilterId] = useState<string | null>(null)

  const [pendingStudyFilter, setPendingStudyFilter] = useState<string | null>(
    null,
  )
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({})

  useEffect(() => {
    if (!selectedTermId) return
    const node = rowRefs.current[selectedTermId]
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedTermId])

  useEffect(() => {
    if (!autoOpenDetails || !selectedTermId) return
    setDetailsId(selectedTermId)
    onAutoOpenDetailsConsumed?.()
  }, [autoOpenDetails, selectedTermId, onAutoOpenDetailsConsumed])

  const detailsEntry = entries.find((e) => e.id === detailsId) ?? null
  const filterTermIds = userDoc
    ? getGlossaryTermIds(userDoc.config.groupings)
    : []

  const applyGlossaryFilter = (termId: string) => {
    if (!userDoc) return
    const ids = getGlossaryTermIds(userDoc.config.groupings)
    const nextIds = ids.includes(termId) ? ids : [...ids, termId]
    patchConfig(
      groupingsPatch(
        userDoc.config,
        setGlossaryTermIds(userDoc.config.groupings, nextIds),
      ),
    )
  }

  const filterAndStudy = (termId: string) => {
    if (!userDoc) {
      setPendingStudyFilter(termId)
      setSessionPrompt(true)
      return
    }
    applyGlossaryFilter(termId)
    onStudyWithFilter?.()
  }

  const toggleFilter = (termId: string) => {
    if (!userDoc) {
      setPendingFilterId(termId)
      setSessionPrompt(true)
      return
    }
    patchConfig(
      groupingsPatch(
        userDoc.config,
        toggleGlossaryTerm(userDoc.config.groupings, termId),
      ),
    )
  }

  useEffect(() => {
    if (!userDoc || !pendingFilterId) return
    const termId = pendingFilterId
    setPendingFilterId(null)
    patchConfig(
      groupingsPatch(
        userDoc.config,
        toggleGlossaryTerm(userDoc.config.groupings, termId),
      ),
    )
  }, [userDoc, pendingFilterId, patchConfig])

  useEffect(() => {
    if (!userDoc || !pendingStudyFilter) return
    const termId = pendingStudyFilter
    setPendingStudyFilter(null)
    applyGlossaryFilter(termId)
    onStudyWithFilter?.()
    // apply after session exists
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDoc, pendingStudyFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es')
    if (!q) return entries
    return entries.filter((entry) => {
      const hay = [entry.term, ...entry.aliases, glossaryKindLabel(entry.kind), entry.note]
        .join(' ')
        .toLocaleLowerCase('es')
      return hay.includes(q)
    })
  }, [entries, query])

  const references = useMemo(() => {
    if (!detailsEntry) return []
    return cardsForGlossaryTerm(cards, matchers, detailsEntry.id)
  }, [cards, matchers, detailsEntry])

  const requireSession = (action: 'add' | GlossaryEntry, run: () => void) => {
    if (hasSession && userDoc) {
      run()
      return
    }
    setPendingAfterSession(action)
    setSessionPrompt(true)
  }

  const afterSession = () => {
    const pending = pendingAfterSession
    const filterId = pendingFilterId
    setPendingAfterSession(null)
    setPendingFilterId(null)
    setSessionPrompt(false)
    setShowIdentify(false)
    if (pending === 'add') setEditor(toEditor())
    else if (pending) setEditor(toEditor(pending))
    if (filterId) {
      // userDoc may not have flushed; next click also works
    }
  }

  const saveEditor = () => {
    if (!editor) return
    const term = editor.term.trim()
    if (!term) return
    saveGlossaryEntry({
      id: editor.id,
      term,
      aliases: parseAliases(editor.aliases),
      kind: editor.kind,
      note: editor.note.trim(),
      properName: editor.properName,
      related: entries.find((e) => e.id === editor.id)?.related ?? [],
    })
    setEditor(null)
    onSelectTerm(editor.id)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteGlossaryEntry(deleteTarget.id)
    setDeleteTarget(null)
    if (selectedTermId === deleteTarget.id) onSelectTerm(null)
  }

  const subject = isGuest
    ? 'el glosario compartido del equipo'
    : userDoc
      ? `tu lista (${userDoc.displayName})`
      : 'tu lista'

  if (status === 'loading') {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Cargando glosario…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="py-8 text-center">
        <p className="mb-2 font-medium text-destructive">
          No se pudo abrir el glosario
        </p>
        <p className="mb-4 text-sm text-muted-foreground">{message}</p>
        <Button type="button" onClick={() => void reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (showIdentify) {
    return (
      <div className="py-2">
        <UserPickerView
          users={roster}
          suggestedUserId={suggestedUserId}
          onSelect={(user) => {
            selectUser(user)
            afterSession()
          }}
          title="Identifícate"
          description="Elige tu nombre para guardar cambios en tu glosario."
        />
        <div className="px-1 pb-4 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowIdentify(false)
              setPendingAfterSession(null)
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 px-2"
          onClick={onBackToMaterials}
        >
          <ArrowLeft className="size-4" />
          Volver al material
        </Button>
        <Button
          type="button"
          className="min-h-11"
          onClick={() => requireSession('add', () => setEditor(toEditor()))}
        >
          <Plus className="size-4" />
          Añadir palabra
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {entries.length} palabras. Toca <strong>Detalles</strong> para el sentido
        y los enlaces, o <strong>Estudiar esta palabra</strong> para filtrar el
        mazo.
        {hasSession
          ? isGuest
            ? ' Los cambios de esta sesión sin ID se guardan para el equipo.'
            : ' Los cambios de esta lista son solo tuyos.'
          : ' Para añadir o cambiar palabras, continúa sin ID o identifícate.'}
      </p>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en el glosario"
          className="h-11 min-h-11 pl-9"
          aria-label="Buscar en el glosario"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
          {query.trim()
            ? 'Ninguna palabra coincide con esa búsqueda.'
            : 'El glosario está vacío.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              ref={(node) => {
                rowRefs.current[entry.id] = node
              }}
            >
              <div
                className={cn(
                  'flex w-full flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2',
                  selectedTermId === entry.id && 'border-primary ring-2 ring-primary/20',
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{entry.term}</span>
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    'shrink-0',
                    isCustomGlossaryId(entry.id) && 'border-primary/40',
                  )}
                >
                  {glossaryKindLabel(entry.kind)}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  onClick={() => {
                    onSelectTerm(entry.id)
                    setDetailsId(entry.id)
                  }}
                >
                  Detalles
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="min-h-11"
                  onClick={() => filterAndStudy(entry.id)}
                >
                  Estudiar esta palabra
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {detailsEntry && (
        <GlossaryDetailsModal
          entry={detailsEntry}
          entries={entries}
          references={references}
          filterTermIds={filterTermIds}
          onClose={() => setDetailsId(null)}
          onSelectRelated={(id) => {
            onSelectTerm(id)
            setDetailsId(id)
          }}
          onStudy={() => filterAndStudy(detailsEntry.id)}
          onToggleFilter={() => toggleFilter(detailsEntry.id)}
          onEdit={() =>
            requireSession(detailsEntry, () => setEditor(toEditor(detailsEntry)))
          }
          onDelete={() =>
            requireSession(detailsEntry, () => setDeleteTarget(detailsEntry))
          }
          onOpenCardInStudy={onOpenCardInStudy}
        />
      )}

      {editor && (
        <GlossaryEditor
          editor={editor}
          setEditor={setEditor}
          onCancel={() => setEditor(null)}
          onSave={saveEditor}
          subject={subject}
        />
      )}
      <DeleteConfirm
        target={deleteTarget}
        subject={subject}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <DeckSessionPrompt
        open={sessionPrompt}
        onContinueAsGuest={() => {
          continueAsGuest()
          afterSession()
        }}
        onIdentify={() => {
          setSessionPrompt(false)
          setShowIdentify(true)
        }}
        onClose={() => {
          setSessionPrompt(false)
          setPendingAfterSession(null)
        }}
      />
    </div>
  )
}

function GlossaryDetailsModal({
  entry,
  entries,
  references,
  filterTermIds,
  onClose,
  onSelectRelated,
  onStudy,
  onToggleFilter,
  onEdit,
  onDelete,
  onOpenCardInStudy,
}: {
  entry: GlossaryEntry
  entries: GlossaryEntry[]
  references: Flashcard[]
  filterTermIds: string[]
  onClose: () => void
  onSelectRelated: (id: string) => void
  onStudy: () => void
  onToggleFilter: () => void
  onEdit: () => void
  onDelete: () => void
  onOpenCardInStudy: (cardId: string) => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-details-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p id="glossary-details-title" className="text-xl font-semibold">
              {entry.term}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {glossaryKindLabel(entry.kind)}
              {entry.properName ? ' · Nombre propio' : ''}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" onClick={onStudy}>
            Estudiar esta palabra
            <ArrowRight className="size-4" />
          </Button>
          {filterTermIds.includes(entry.id) && (
            <Button type="button" variant="outline" className="min-h-11" onClick={onToggleFilter}>
              Quitar del filtro
            </Button>
          )}
          <Button type="button" variant="outline" className="min-h-11" onClick={onEdit}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
            Eliminar
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {entry.note ? (
            <p className="text-sm leading-relaxed">
              <span className="font-medium">Sentido. </span>
              {entry.note}
            </p>
          ) : null}
          {entry.aliases.length > 0 && (
            <p className="text-sm leading-relaxed">
              <span className="font-medium">También se escribe. </span>
              {entry.aliases.join(', ')}
            </p>
          )}
          {entry.related.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Relacionado</p>
              <ul className="flex flex-col gap-1">
                {entry.related.map((item) => {
                  const other = entries.find((e) => e.id === item.id)
                  if (!other) return null
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-accent/40"
                        onClick={() => onSelectRelated(other.id)}
                      >
                        <span className="font-medium">{other.term}</span>
                        <span className="text-muted-foreground"> — {item.rel}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <a
              href={glossaryBibleSearchUrl(entry)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
              Ver en la Biblia (NTV)
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            {references.length === 1
              ? '1 tarjeta menciona esta palabra.'
              : `${references.length} tarjetas mencionan esta palabra.`}
          </p>
          {references.length === 0 ? (
            <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
              Ninguna tarjeta usa esta palabra todavía.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {references.map((card) => (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCardInStudy(card.id)}
                    className="w-full min-h-11 rounded-xl border bg-background px-3 py-3 text-left transition-colors hover:bg-accent/40"
                  >
                    <p className="text-xs text-muted-foreground">
                      {card.bookLabel} {card.chapter} · Abrir en modo estudio
                    </p>
                    <p className="mt-1 text-sm font-medium leading-snug">
                      <CitedText text={card.question} />
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function GlossaryEditor({
  editor,
  setEditor,
  onCancel,
  onSave,
  subject,
}: {
  editor: EditorState
  setEditor: (next: EditorState) => void
  onCancel: () => void
  onSave: () => void
  subject: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-edit-title"
      onClick={onCancel}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-xl border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="glossary-edit-title" className="font-medium">
          {isCustomGlossaryId(editor.id) && !editor.term
            ? 'Nueva palabra'
            : 'Editar palabra'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Se guarda en {subject}.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <Label htmlFor="glossary-term">Palabra</Label>
            <Input
              id="glossary-term"
              className="mt-1 h-11"
              value={editor.term}
              onChange={(e) => setEditor({ ...editor, term: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="glossary-aliases">
              También se escribe / otras versiones
            </Label>
            <Input
              id="glossary-aliases"
              className="mt-1 h-11"
              value={editor.aliases}
              onChange={(e) =>
                setEditor({ ...editor, aliases: e.target.value })
              }
              placeholder="Sadoc, Zadok, Sadoq"
            />
          </div>
          <div>
            <Label htmlFor="glossary-kind">Tipo</Label>
            <select
              id="glossary-kind"
              className="mt-1 h-11 w-full rounded-md border border-input bg-transparent px-3 text-base md:text-sm"
              value={editor.kind}
              onChange={(e) => {
                const kind = e.target.value
                if (isGlossaryKind(kind)) setEditor({ ...editor, kind })
              }}
            >
              {GLOSSARY_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {glossaryKindLabel(kind)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="glossary-note">Sentido (quién / qué / dónde)</Label>
            <textarea
              id="glossary-note"
              className="mt-1 min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base md:text-sm"
              value={editor.note}
              onChange={(e) => setEditor({ ...editor, note: e.target.value })}
            />
          </div>
          <label
            htmlFor="glossary-proper-name"
            className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3"
          >
            <input
              id="glossary-proper-name"
              type="checkbox"
              className="mt-1 size-4 shrink-0"
              checked={editor.properName}
              onChange={(e) =>
                setEditor({ ...editor, properName: e.target.checked })
              }
            />
            <span>
              <span className="block text-sm font-medium">Nombre propio</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Marcado: distingue mayúsculas y minúsculas. Sin marcar: da
                igual. En ambos casos se ignoran acentos y variantes de
                guion.
              </span>
            </span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={!editor.term.trim()}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({
  target,
  subject,
  onCancel,
  onConfirm,
}: {
  target: GlossaryEntry | null
  subject: string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!target) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="alertdialog"
      aria-labelledby="glossary-delete-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="glossary-delete-title" className="font-medium">
          ¿Eliminar «{target.term}» del glosario?
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Se quita de {subject}. Las tarjetas no cambian.
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Sí, eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function GlossaryMaterialRow({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  const { entries, status } = useGlossary()
  const countLabel =
    status === 'ready'
      ? `${entries.length} palabras`
      : status === 'loading'
        ? 'Cargando…'
        : 'No se pudo cargar'
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full min-h-11 items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
    >
      <span className="flex items-center gap-3">
        <BookOpen className="size-5 shrink-0 text-primary" />
        <span>
          <span className="block font-medium">Glosario</span>
          <span className="block text-xs text-muted-foreground">
            Nombres, lugares y conceptos de las tarjetas
          </span>
        </span>
      </span>
      <span className="text-xs text-muted-foreground">
        {open ? 'Cerrar' : countLabel}
      </span>
    </button>
  )
}
