import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStatsMoneyByUser } from '@/api/adminStats'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { MoneyText } from '@/components/shared/MoneyText'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Table, Td, Tr } from '@/components/ui/Table'
import { useApiError } from '@/hooks/useApiError'
import type { StatsMoneyByUser } from '@/types/admin'

export function StatsMoneyByUserPage() {
  const onError = useApiError()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [role, setRole] = useState<'receiver' | 'donor'>('receiver')
  const [orderBy, setOrderBy] = useState<'htg' | 'usd'>('htg')
  const [data, setData] = useState<StatsMoneyByUser | null>(null)
  const [loading, setLoading] = useState(true)

  const params = useMemo(
    () => ({
      role,
      order_by: orderBy,
      limit: 50,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [from, to, role, orderBy],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getStatsMoneyByUser(params))
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
        title="Stats · Money by user"
        description="Superuser only — leaderboard by HTG/USD."
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
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'receiver' | 'donor')}
            >
              <option value="receiver">Receiver</option>
              <option value="donor">Donor</option>
            </Select>
            <Select
              label="Order by"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as 'htg' | 'usd')}
            >
              <option value="htg">HTG</option>
              <option value="usd">USD</option>
            </Select>
          </div>
        }
      />
      {loading ? <Spinner /> : null}
      {!loading && !data ? <EmptyState title="No data" /> : null}
      {data && data.results.length === 0 ? <EmptyState title="No results" /> : null}
      {data && data.results.length > 0 ? (
        <Table columns={['User', 'Email', 'HTG', 'USD']}>
          {data.results.map((row) => (
            <Tr key={row.user_id}>
              <Td>
                {row.username || row.user_id}
              </Td>
              <Td>{row.email || '—'}</Td>
              <Td>
                <MoneyText amount={row.total_htg} currency="HTG" />
              </Td>
              <Td>
                <MoneyText amount={row.total_usd} currency="USD" />
              </Td>
            </Tr>
          ))}
        </Table>
      ) : null}
    </div>
  )
}
