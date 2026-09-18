import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type NameSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}

export function NameSearchField({
  value,
  onChange,
  placeholder = 'Buscar por nombre…',
  ariaLabel = 'Buscar por nombre',
}: NameSearchFieldProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        className="pl-9"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
      />
    </div>
  )
}
