export function JsonViewer({ value, label }: { value: unknown; label?: string }) {
  return (
    <div className="space-y-1">
      {label ? <p className="text-xs font-medium text-text-muted uppercase">{label}</p> : null}
      <pre className="max-h-64 overflow-auto rounded-xl border border-border bg-canvas p-3 text-xs whitespace-pre-wrap break-all">
        {value === null || value === undefined
          ? '—'
          : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}
