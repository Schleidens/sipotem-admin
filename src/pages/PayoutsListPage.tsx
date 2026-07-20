import { useCallback, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { listPaymentRequests } from '@/api/adminPayments'
import {
  CURRENCIES,
  PAYMENT_REQUEST_STATUSES,
  STATUS_LABELS,
  METHOD_LABELS,
} from '@/constants/enums'
import { MasterDetailLayout } from '@/components/layout/MasterDetail'
import type { DetailOutletContext } from '@/components/layout/detailOutlet'
import { MoneyText } from '@/components/shared/MoneyText'
import { PageHeader } from '@/components/shared/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Table, Td, Tr } from '@/components/ui/Table'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { formatDate } from '@/lib/utils'

function statusTone(status: string) {
  if (status === 'approved') return 'completed' as const
  if (status === 'rejected') return 'danger' as const
  if (status === 'in_process') return 'delivered' as const
  return 'paid' as const
}

export function PayoutsListPage() {
  const navigate = useNavigate()
  const { id: selectedId } = useParams()
  const [status, setStatus] = useState('pending')
  const [currency, setCurrency] = useState('')
  const [user, setUser] = useState('')

  const filters = useMemo(
    () => ({
      status: status || undefined,
      currency: currency || undefined,
      user: user || undefined,
    }),
    [status, currency, user],
  )

  const fetcher = useCallback(
    (params: Parameters<typeof listPaymentRequests>[0], signal?: AbortSignal) =>
      listPaymentRequests(params, signal),
    [],
  )

  const { results, count, page, setPage, pageSize, loading, error } = usePaginatedList(
    fetcher,
    filters,
  )

  const outletCtx: DetailOutletContext = { listPath: '/payouts' }
  const detailOpen = Boolean(selectedId)

  const list = (
    <div>
      <PageHeader
        title="Payouts"
        description="Staff primary workflow — review and approve payment requests."
      />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {PAYMENT_REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="">All</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input label="User id" value={user} onChange={(e) => setUser(e.target.value)} />
        <Button type="button" variant="secondary" onClick={() => setStatus('pending')}>
          Pending queue
        </Button>
      </div>

      {loading ? <Spinner label="Loading payouts…" /> : null}
      {error ? <EmptyState title="Failed to load" description={error} /> : null}
      {!loading && !error && results.length === 0 ? <EmptyState title="No payout requests" /> : null}

      {results.length > 0 ? (
        <>
          <Table columns={['Payout', 'User', 'Amount', 'Method', 'Status', 'Date']}>
            {results.map((row) => {
              const selected = row.id === selectedId
              return (
                <Tr key={row.id} selected={selected} onClick={() => navigate(`/payouts/${row.id}`)}>
                  <Td>
                    <span className="font-mono text-xs">#{row.id.slice(0, 8)}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={row.user?.username} src={row.user?.profile_picture} size="sm" />
                      {row.user?.username || '—'}
                    </div>
                  </Td>
                  <Td>
                    <MoneyText amount={row.amount} currency={row.currency} />
                  </Td>
                  <Td>{METHOD_LABELS[row.payment_method] || row.payment_method}</Td>
                  <Td>
                    <Badge tone={statusTone(row.status)}>{STATUS_LABELS[row.status]}</Badge>
                  </Td>
                  <Td>{formatDate(row.created_at)}</Td>
                </Tr>
              )
            })}
          </Table>
          <Pagination page={page} pageSize={pageSize} total={count} onPageChange={setPage} />
        </>
      ) : null}
    </div>
  )

  return (
    <MasterDetailLayout
      detailOpen={detailOpen}
      list={list}
      detail={<Outlet context={outletCtx} />}
    />
  )
}
