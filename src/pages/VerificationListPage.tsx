import { useCallback, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { listVerificationRequests } from '@/api/adminVerification'
import { VERIFICATION_STATUSES, STATUS_LABELS } from '@/constants/enums'
import { MasterDetailLayout } from '@/components/layout/MasterDetail'
import type { DetailOutletContext } from '@/components/layout/detailOutlet'
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

export function VerificationListPage() {
  const navigate = useNavigate()
  const { id: selectedId } = useParams()
  const [status, setStatus] = useState('pending')
  const [user, setUser] = useState('')

  const filters = useMemo(
    () => ({
      status: status || undefined,
      user: user || undefined,
    }),
    [status, user],
  )

  const fetcher = useCallback(
    (params: Parameters<typeof listVerificationRequests>[0], signal?: AbortSignal) =>
      listVerificationRequests(params, signal),
    [],
  )

  const { results, count, page, setPage, pageSize, loading, error } = usePaginatedList(
    fetcher,
    filters,
  )

  const outletCtx: DetailOutletContext = { listPath: '/verification' }
  const detailOpen = Boolean(selectedId)

  const list = (
    <div>
      <PageHeader
        title="Verification"
        description="Approve or reject blue-check requests."
      />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {VERIFICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Input
          label="User id"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="optional"
        />
        <Button type="button" variant="secondary" onClick={() => setStatus('pending')}>
          Pending only
        </Button>
      </div>

      {loading ? <Spinner label="Loading…" /> : null}
      {error ? <EmptyState title="Failed to load" description={error} /> : null}
      {!loading && !error && results.length === 0 ? <EmptyState title="No verification requests" /> : null}

      {results.length > 0 ? (
        <>
          <Table columns={['Request', 'User', 'Status', 'Reason', 'Created']}>
            {results.map((row) => {
              const name = row.user.username || row.user.email || String(row.user.id)
              const selected = String(row.id) === selectedId
              return (
                <Tr
                  key={row.id}
                  selected={selected}
                  onClick={() => navigate(`/verification/${row.id}`)}
                >
                  <Td>#{row.id}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={name} src={row.user.profile_picture} size="sm" />
                      {name}
                    </div>
                  </Td>
                  <Td>
                    <Badge
                      tone={
                        row.status === 'approved'
                          ? 'completed'
                          : row.status === 'rejected'
                            ? 'danger'
                            : 'paid'
                      }
                    >
                      {STATUS_LABELS[row.status]}
                    </Badge>
                  </Td>
                  <Td className="max-w-xs truncate">{row.reason || '—'}</Td>
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
