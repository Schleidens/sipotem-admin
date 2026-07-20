import { cn } from '@/lib/utils'
import type { SelectHTMLAttributes } from 'react'

export function Select({
  className,
  label,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-text-muted">{label}</span> : null}
      <select
        className={cn(
          'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  )
}
