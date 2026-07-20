import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStatsUsers } from '@/api/adminStats'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { DaySeriesChart } from '@/components/shared/DaySeriesChart'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useApiError } from '@/hooks/useApiError'
import type { StatsUsers } from '@/types/admin'

export function StatsUsersPage() {
  const onError = useApiError()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState<StatsUsers | null>(null)
  const [loading, setLoading] = useState(true)

  const params = useMemo(
    () => ({
      include_list: 1,
      limit: 20,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [from, to],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getStatsUsers(params))
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
        title="Stats · Users"
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data.counts).map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
                <div className="text-text-muted">{k}</div>
                <div className="text-lg font-semibold">{v}</div>
              </div>
            ))}
            <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
              <div className="text-text-muted">Recently active</div>
              <div className="text-lg font-semibold">{data.recently_active_count}</div>
            </div>
          </div>
          <DaySeriesChart data={data.new_by_day} dataKey="count" label="New users" />
        </>
      ) : null}
    </div>
  )
}
