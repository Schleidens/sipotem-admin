import { useCallback, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { listUsers } from '@/api/adminUsers'
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
import { boolLabel, formatDate, formatMoney } from '@/lib/utils'

export function UsersListPage() {
  const navigate = useNavigate()
  const { id: selectedId } = useParams()
  const [q, setQ] = useState('')
  const [qApplied, setQApplied] = useState('')
  const [isVerified, setIsVerified] = useState('')
  const [isStaff, setIsStaff] = useState('')
  const [isActive, setIsActive] = useState('')

  const filters = useMemo(
    () => ({
      q: qApplied || undefined,
      is_verified: isVerified || undefined,
      is_staff: isStaff || undefined,
      is_active: isActive || undefined,
    }),
    [qApplied, isVerified, isStaff, isActive],
  )

  const fetcher = useCallback(
    (params: Parameters<typeof listUsers>[0], signal?: AbortSignal) => listUsers(params, signal),
    [],
  )

  const { results, count, page, setPage, pageSize, loading, error } = usePaginatedList(
    fetcher,
    filters,
  )

  const outletCtx: DetailOutletContext = { listPath: '/users' }
  const detailOpen = Boolean(selectedId)

  const list = (
    <div>
      <PageHeader title="Users" description="Search and filter platform users." />

      <form
        className="mb-5 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          setQApplied(q.trim())
        }}
      >
        <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="email, username…" />
        <Select label="Verified" value={isVerified} onChange={(e) => setIsVerified(e.target.value)}>
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
        <Select label="Staff" value={isStaff} onChange={(e) => setIsStaff(e.target.value)}>
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
        <Select label="Active" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
        <Button type="submit">Apply</Button>
      </form>

      {loading ? <Spinner label="Loading users…" /> : null}
      {error ? <EmptyState title="Failed to load users" description={error} /> : null}
      {!loading && !error && results.length === 0 ? <EmptyState title="No users found" /> : null}

      {results.length > 0 ? (
        <>
          <Table
            columns={[
              'User',
              'Email',
              'Verified',
              'Active',
              'Staff',
              'HTG',
              'USD',
              'Joined',
            ]}
          >
            {results.map((u) => {
              const selected = String(u.id) === selectedId
              const name = u.username || u.email
              return (
                <Tr key={u.id} selected={selected} onClick={() => navigate(`/users/${u.id}`)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={name} src={u.profile_picture} size="sm" />
                      <div>
                        <div className="font-medium">{u.username || '—'}</div>
                        <div className="text-xs text-text-muted">#{u.id}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>{u.email}</Td>
                  <Td>
                    {u.is_verified ? (
                      <Badge tone="completed">Verified</Badge>
                    ) : (
                      <Badge tone="paid">Unverified</Badge>
                    )}
                  </Td>
                  <Td>{boolLabel(u.is_active)}</Td>
                  <Td>{boolLabel(u.is_staff)}</Td>
                  <Td>{formatMoney(u.balance_htg)}</Td>
                  <Td>{formatMoney(u.balance_usd)}</Td>
                  <Td>{formatDate(u.date_joined)}</Td>
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
