import { useCallback, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { listTransactions } from '@/api/adminTransactions'
import {
  METHOD_LABELS,
  PAYMENT_METHODS,
  STATUS_LABELS,
  TRANSACTION_STATUSES,
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

export function TransactionsListPage() {
  const navigate = useNavigate()
  const { id: selectedId } = useParams()
  const [status, setStatus] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [receiver, setReceiver] = useState('')
  const [donor, setDonor] = useState('')
  const [fundraiser, setFundraiser] = useState('')
  const [createdAfter, setCreatedAfter] = useState('')
  const [createdBefore, setCreatedBefore] = useState('')

  const filters = useMemo(
    () => ({
      status: status || undefined,
      payment_method: paymentMethod || undefined,
      receiver: receiver || undefined,
      donor: donor || undefined,
      fundraiser: fundraiser || undefined,
      created_after: createdAfter || undefined,
      created_before: createdBefore || undefined,
    }),
    [status, paymentMethod, receiver, donor, fundraiser, createdAfter, createdBefore],
  )

  const fetcher = useCallback(
    (params: Parameters<typeof listTransactions>[0], signal?: AbortSignal) =>
      listTransactions(params, signal),
    [],
  )

  const { results, count, page, setPage, pageSize, loading, error } = usePaginatedList(
    fetcher,
    filters,
  )

  const outletCtx: DetailOutletContext = { listPath: '/transactions' }
  const detailOpen = Boolean(selectedId)

  const list = (
    <div>
      <PageHeader title="Transactions" description="Read-only ledger. Status cannot be edited here." />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {TRANSACTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
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
        <Input label="Receiver id" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
        <Input label="Donor id" value={donor} onChange={(e) => setDonor(e.target.value)} />
        <Input label="Fundraiser" value={fundraiser} onChange={(e) => setFundraiser(e.target.value)} />
        <Input
          type="date"
          label="Created after"
          value={createdAfter}
          onChange={(e) => setCreatedAfter(e.target.value)}
        />
        <Input
          type="date"
          label="Created before"
          value={createdBefore}
          onChange={(e) => setCreatedBefore(e.target.value)}
        />
        <Button type="button" variant="secondary" onClick={() => setStatus('success')}>
          Success only
        </Button>
      </div>

      {loading ? <Spinner /> : null}
      {error ? <EmptyState title="Failed to load" description={error} /> : null}
      {!loading && !error && results.length === 0 ? <EmptyState title="No transactions" /> : null}

      {results.length > 0 ? (
        <>
          <Table columns={['Txn', 'Receiver', 'Donor', 'Amount', 'Status', 'Date']}>
            {results.map((row) => {
              const selected = row.id === selectedId
              return (
                <Tr
                  key={row.id}
                  selected={selected}
                  onClick={() => navigate(`/transactions/${row.id}`)}
                >
                  <Td>
                    <span className="font-mono text-xs">#{row.id.slice(0, 8)}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={row.receiver_username} size="sm" />
                      {row.receiver_username || '—'}
                    </div>
                  </Td>
                  <Td>{row.donor_username || row.donor_name || '—'}</Td>
                  <Td>
                    <MoneyText amount={row.amount} currency={row.currency} />
                  </Td>
                  <Td>
                    <Badge
                      tone={
                        row.status === 'success'
                          ? 'completed'
                          : row.status === 'failed'
                            ? 'danger'
                            : 'paid'
                      }
                    >
                      {STATUS_LABELS[row.status]}
                    </Badge>
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
