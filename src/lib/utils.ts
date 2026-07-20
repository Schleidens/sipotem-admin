import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export function formatMoney(amount: string | number | null | undefined, currency?: string) {
  if (amount === null || amount === undefined || amount === '') return '—'
  const suffix = currency ? ` ${currency}` : ''
  return `${amount}${suffix}`
}

export function boolLabel(value: boolean | null | undefined) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return '—'
}
