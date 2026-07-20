export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-4 py-12 text-center">
      <p className="text-sm font-medium text-text">{title}</p>
      {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
    </div>
  )
}
