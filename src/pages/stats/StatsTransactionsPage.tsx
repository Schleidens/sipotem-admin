import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStatsTransactions } from '@/api/adminStats'
import { useAuth } from '@/auth/AuthProvider'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { DaySeriesChart } from '@/components/shared/DaySeriesChart'
import { MoneyText } from '@/components/shared/MoneyText'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiError } from '@/hooks/useApiError'
import type { StatsTransactions } from '@/types/admin'

export function StatsTransactionsPage() {
  const { adminUser } = useAuth()
  const onError = useApiError()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState<StatsTransactions | null>(null)
  const [loading, setLoading] = useState(true)

  const params = useMemo(
    () => ({
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [from, to],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getStatsTransactions(params))
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
        title="Stats · Transactions"
        actions={
          <DateRangePicker
            from={from}
            to={to}
            onChange={({ from: f, to: t }) => {
              setFrom(f)
              setTo(t)
            }}
          />
        }
      />
      {loading ? <Spinner /> : null}
      {!loading && !data ? <EmptyState title="No data" /> : null}
      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
              <div className="text-text-muted">Success rate</div>
              <div className="text-lg font-semibold">{data.success_rate_percent}%</div>
            </div>
            {Object.entries(data.by_status).map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
                <div className="text-text-muted">Status · {k}</div>
                <div className="text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>

          {adminUser?.is_superuser && data.volume ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
                <div className="text-text-muted">Volume HTG</div>
                <MoneyText amount={data.volume.total_htg} currency="HTG" className="text-lg font-semibold" />
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
                <div className="text-text-muted">Volume USD</div>
                <MoneyText amount={data.volume.total_usd} currency="USD" className="text-lg font-semibold" />
              </div>
              {data.average_tip_htg != null ? (
                <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
                  <div className="text-text-muted">Avg tip HTG</div>
                  <MoneyText amount={data.average_tip_htg} currency="HTG" className="text-lg font-semibold" />
                </div>
              ) : null}
              {data.average_tip_usd != null ? (
                <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
                  <div className="text-text-muted">Avg tip USD</div>
                  <MoneyText amount={data.average_tip_usd} currency="USD" className="text-lg font-semibold" />
                </div>
              ) : null}
            </div>
          ) : null}

          <DaySeriesChart data={data.by_day} dataKey="count" label="Transactions" />
        </>
      ) : null}
    </div>
  )
}
