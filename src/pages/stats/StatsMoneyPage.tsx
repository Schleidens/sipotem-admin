import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStatsMoney } from '@/api/adminStats'
import { PAYMENT_METHODS, TRANSACTION_TYPES, METHOD_LABELS } from '@/constants/enums'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { DaySeriesChart } from '@/components/shared/DaySeriesChart'
import { MoneyText } from '@/components/shared/MoneyText'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { useApiError } from '@/hooks/useApiError'
import type { StatsMoney } from '@/types/admin'

export function StatsMoneyPage() {
  const onError = useApiError()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [data, setData] = useState<StatsMoney | null>(null)
  const [loading, setLoading] = useState(true)

  const params = useMemo(
    () => ({
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(paymentMethod ? { payment_method: paymentMethod } : {}),
      ...(transactionType ? { transaction_type: transactionType } : {}),
    }),
    [from, to, paymentMethod, transactionType],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getStatsMoney(params))
    } catch (err) {
      onError(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [params, onError])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stats · Money"
        description="Superuser only — platform money totals."
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <DateRangePicker
              from={from}
              to={to}
              onChange={({ from: f, to: t }) => {
                setFrom(f)
                setTo(t)
              }}
            />
            <Select
              label="Payment method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">All</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
            <Select
              label="Type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="">All</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      {loading ? <Spinner /> : null}
      {!loading && !data ? <EmptyState title="No data" /> : null}
      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
              <div className="text-text-muted">Total HTG</div>
              <MoneyText amount={data.total_htg} currency="HTG" className="text-lg font-semibold" />
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
              <div className="text-text-muted">Total USD</div>
              <MoneyText amount={data.total_usd} currency="USD" className="text-lg font-semibold" />
            </div>
          </div>
          <DaySeriesChart
            data={data.by_day.map((d) => ({
              day: d.day,
              count: Number(d.total_htg ?? d.count ?? 0),
            }))}
            dataKey="count"
            label="HTG volume"
          />
        </>
      ) : null}
    </div>
  )
}
