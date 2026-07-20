import { cn } from '@/lib/utils'

export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2 text-sm text-text-muted', className)}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand" />
      {label ? <span>{label}</span> : null}
    </div>
  )
}
