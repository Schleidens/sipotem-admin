import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

/** Right-hand detail pane for master–detail layouts. */
export function DetailPane({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  className,
}: {
  open: boolean
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  if (!open) return null

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full flex-col border-l border-border bg-surface shadow-[var(--shadow-elevated)] lg:w-[380px] xl:w-[420px]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-text">{title}</h2>
          {subtitle ? <div className="mt-1.5 flex flex-wrap items-center gap-2">{subtitle}</div> : null}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close detail">
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer ? (
        <div className="border-t border-border px-5 py-4">{footer}</div>
      ) : null}
    </aside>
  )
}

/** Split list + optional detail for desktop; stacks on small screens. */
export function MasterDetailLayout({
  list,
  detail,
  detailOpen,
}: {
  list: ReactNode
  detail: ReactNode
  detailOpen: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-h-[calc(100vh-5.5rem)] flex-col lg:flex-row',
        detailOpen && 'lg:-mx-6 lg:-mb-6 lg:mt-0',
      )}
    >
      <div
        className={cn(
          'min-w-0 flex-1',
          detailOpen && 'hidden lg:block lg:px-6 lg:pt-0',
          !detailOpen && '',
        )}
      >
        {list}
      </div>
      {detailOpen ? (
        <div className="flex min-h-[calc(100vh-5.5rem)] flex-1 lg:flex-none">{detail}</div>
      ) : null}
    </div>
  )
}
