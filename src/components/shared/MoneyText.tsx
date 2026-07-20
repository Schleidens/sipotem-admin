import { formatMoney } from '@/lib/utils'

export function MoneyText({
  amount,
  currency,
  className,
}: {
  amount?: string | null
  currency?: string
  className?: string
}) {
  return <span className={className}>{formatMoney(amount, currency)}</span>
}
