import { useCallback, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { listFundraisers } from '@/api/adminFundraisers'
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

export function FundraisersListPage() {
  const navigate = useNavigate()
  const { id: selectedId } = useParams()
  const [q, setQ] = useState('')
  const [qApplied, setQApplied] = useState('')
  const [creator, setCreator] = useState('')
  const [isActive, setIsActive] = useState('')
  const [isSuspended, setIsSuspended] = useState('')

  const filters = useMemo(
    () => ({
      q: qApplied || undefined,
      creator: creator || undefined,
      is_active: isActive || undefined,
      is_suspended: isSuspended || undefined,
    }),
    [qApplied, creator, isActive, isSuspended],
  )

  const fetcher = useCallback(
    (params: Parameters<typeof listFundraisers>[0], signal?: AbortSignal) =>
      listFundraisers(params, signal),
    [],
  )

  const { results, count, page, setPage, pageSize, loading, error } = usePaginatedList(
    fetcher,
    filters,
  )

  const outletCtx: DetailOutletContext = { listPath: '/fundraisers' }
  const detailOpen = Boolean(selectedId)

  const list = (
    <div>
      <PageHeader title="Fundraisers" description="Edit, close, or suspend fundraisers." />

      <form
        className="mb-5 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          setQApplied(q.trim())
        }}
      >
        <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input label="Creator id" value={creator} onChange={(e) => setCreator(e.target.value)} />
        <Select label="Active" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
        <Select label="Suspended" value={isSuspended} onChange={(e) => setIsSuspended(e.target.value)}>
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
        <Button type="submit">Apply</Button>
      </form>

      {loading ? <Spinner /> : null}
      {error ? <EmptyState title="Failed to load" description={error} /> : null}
      {!loading && !error && results.length === 0 ? <EmptyState title="No fundraisers" /> : null}

      {results.length > 0 ? (
        <>
          <Table columns={['Fundraiser', 'Creator', 'Goal', 'Raised', 'Status', 'Updated']}>
            {results.map((row) => {
              const selected = row.id === selectedId
              const creatorName = row.creator?.username || row.creator?.email || '—'
              return (
                <Tr
                  key={row.id}
                  selected={selected}
                  onClick={() => navigate(`/fundraisers/${row.id}`)}
                >
                  <Td>
                    <div className="font-medium">{row.title}</div>
                    <div className="text-xs text-text-muted">{row.slug}</div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={creatorName} src={row.creator?.profile_picture} size="sm" />
                      {creatorName}
                    </div>
                  </Td>
                  <Td>
                    <MoneyText amount={row.goal_amount} currency={row.currency} />
                  </Td>
                  <Td>
                    <MoneyText amount={row.raised_htg} currency="HTG" />
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <Badge tone={row.is_active ? 'completed' : 'neutral'}>
                        {row.is_active ? 'Active' : 'Closed'}
                      </Badge>
                      {row.is_suspended ? <Badge tone="danger">Suspended</Badge> : null}
                    </div>
                  </Td>
                  <Td>{formatDate(row.updated_at)}</Td>
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
