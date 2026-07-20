import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

  const sizes = {
    sm: 'size-7 text-[10px]',
    md: 'size-9 text-xs',
    lg: 'size-14 text-base',
    xl: 'size-20 text-xl',
  }

  const showPhoto = Boolean(src) && !failed

  if (showPhoto) {
    return (
      <img
        src={src!}
        alt={name || 'Profile'}
        className={cn(
          'shrink-0 rounded-full object-cover ring-2 ring-border/60',
          sizes[size],
          className,
        )}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-muted font-semibold text-brand',
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}
