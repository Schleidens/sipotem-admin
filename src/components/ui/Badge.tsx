import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning'
  | 'brand'
  | 'paid'
  | 'delivered'
  | 'completed'

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  const tones: Record<BadgeTone, string> = {
    neutral: 'bg-canvas text-text-muted',
    success: 'bg-status-completed text-status-completed-text',
    danger: 'bg-red-50 text-danger',
    warning: 'bg-status-delivered text-status-delivered-text',
    brand: 'bg-brand-muted text-brand',
    paid: 'bg-status-paid text-status-paid-text',
    delivered: 'bg-status-delivered text-status-delivered-text',
    completed: 'bg-status-completed text-status-completed-text',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
