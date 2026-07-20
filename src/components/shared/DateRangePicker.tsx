import { Input } from '@/components/ui/Input'

export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (next: { from: string; to: string }) => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        type="date"
        label="From"
        value={from}
        onChange={(e) => onChange({ from: e.target.value, to })}
      />
      <Input
        type="date"
        label="To"
        value={to}
        onChange={(e) => onChange({ from, to: e.target.value })}
      />
    </div>
  )
}
