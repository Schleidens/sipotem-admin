import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Table({
  columns,
  children,
  className,
}: {
  columns: string[]
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-border/60 bg-transparent',
        className,
      )}
    >
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-4 py-3 text-xs font-medium tracking-wide text-text-muted"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({
  children,
  onClick,
  className,
  selected,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  selected?: boolean
}) {
  return (
    <tr
      className={cn(
        'transition-shadow',
        selected
          ? 'bg-surface shadow-[var(--shadow-soft)] ring-1 ring-border/80'
          : 'hover:bg-surface/70',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      data-selected={selected ? 'true' : undefined}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('whitespace-nowrap px-4 py-3.5 align-middle first:rounded-l-xl last:rounded-r-xl', className)}>
      {children}
    </td>
  )
}
