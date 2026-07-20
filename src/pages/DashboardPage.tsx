import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStatsOverview } from '@/api/adminStats'
import { useAuth } from '@/auth/AuthProvider'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { MoneyText } from '@/components/shared/MoneyText'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiError } from '@/hooks/useApiError'
import type { StatsOverview } from '@/types/admin'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-5 shadow-[var(--shadow-soft)]">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  )
}

function StatLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function DashboardPage() {
  const { adminUser } = useAuth()
  const onError = useApiError()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState<StatsOverview | null>(null)
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
      setData(await getStatsOverview(params))
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

  const wallets = data?.lifetime.wallets
  const money = data?.period_metrics.money
  const showMoney = adminUser?.is_superuser && wallets && money

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview metrics for the selected period."
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

      {loading ? <Spinner label="Loading overview…" /> : null}
      {!loading && !data ? <EmptyState title="Could not load overview" /> : null}

      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Card title="Users (lifetime)">
            {Object.entries(data.lifetime.users).map(([k, v]) => (
              <StatLine key={k} label={k} value={v} />
            ))}
          </Card>
          <Card title="Users (period)">
            {Object.entries(data.period_metrics.users).map(([k, v]) => (
              <StatLine key={k} label={k} value={v} />
            ))}
          </Card>
          <Card title="Transactions (period)">
            {Object.entries(data.period_metrics.transactions.by_status).map(([k, v]) => (
              <StatLine key={k} label={k} value={v} />
            ))}
          </Card>
          <Card title="Payouts (period)">
            {Object.entries(data.period_metrics.payouts.by_status).map(([k, v]) => (
              <StatLine
                key={k}
                label={k}
                value={
                  typeof v === 'object' && v && 'count' in v
                    ? `${v.count}${adminUser?.is_superuser && v.total_amount != null ? ` · ${v.total_amount}` : ''}`
                    : String(v)
                }
              />
            ))}
          </Card>
          <Card title="Visits">
            {Object.entries(data.lifetime.visits).map(([k, v]) => (
              <StatLine key={k} label={`lifetime · ${k}`} value={v} />
            ))}
            {Object.entries(data.period_metrics.visits).map(([k, v]) => (
              <StatLine key={k} label={`period · ${k}`} value={v} />
            ))}
          </Card>
          <Card title="Fundraisers">
            {Object.entries(data.lifetime.fundraisers).map(([k, v]) => (
              <StatLine key={k} label={k} value={v} />
            ))}
          </Card>

          {showMoney ? (
            <>
              <Card title="Wallets (lifetime · superuser)">
                <StatLine
                  label="HTG"
                  value={<MoneyText amount={wallets.balance_htg} currency="HTG" />}
                />
                <StatLine
                  label="USD"
                  value={<MoneyText amount={wallets.balance_usd} currency="USD" />}
                />
              </Card>
              <Card title="Money (period · superuser)">
                <StatLine
                  label="Total HTG"
                  value={<MoneyText amount={money.total_htg} currency="HTG" />}
                />
                <StatLine
                  label="Total USD"
                  value={<MoneyText amount={money.total_usd} currency="USD" />}
                />
              </Card>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
