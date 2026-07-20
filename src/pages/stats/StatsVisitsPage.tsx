import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStatsVisits } from '@/api/adminStats'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { DaySeriesChart } from '@/components/shared/DaySeriesChart'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Table, Td, Tr } from '@/components/ui/Table'
import { useApiError } from '@/hooks/useApiError'
import type { StatsVisits } from '@/types/admin'

export function StatsVisitsPage() {
  const onError = useApiError()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState<StatsVisits | null>(null)
  const [loading, setLoading] = useState(true)

  const params = useMemo(
    () => ({
      limit: 20,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [from, to],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getStatsVisits(params))
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
        title="Stats · Visits"
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
              <div className="text-text-muted">Total unique views</div>
              <div className="text-lg font-semibold">{data.total_unique_views}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-3 text-sm">
              <div className="text-text-muted">Unique views in period</div>
              <div className="text-lg font-semibold">{data.unique_views_in_period}</div>
            </div>
          </div>
          <DaySeriesChart data={data.by_day} dataKey="count" label="Views" />
          <Table columns={['Creator', 'Unique views']}>
            {data.top_creators.map((c, i) => (
              <Tr key={i}>
                <Td>{c.username || c.user_id || '—'}</Td>
                <Td>{c.unique_views}</Td>
              </Tr>
            ))}
          </Table>
        </>
      ) : null}
    </div>
  )
}
