import { useCallback, useMemo, useState } from 'react'
import { listAuditLogs } from '@/api/adminAudit'
import { useAuth } from '@/auth/AuthProvider'
import { JsonViewer } from '@/components/shared/JsonViewer'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Spinner'
import { Table, Td, Tr } from '@/components/ui/Table'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { formatDate } from '@/lib/utils'
import type { AdminAuditLog } from '@/types/admin'

export function AuditLogPage() {
  const { adminUser } = useAuth()
  const isSuper = Boolean(adminUser?.is_superuser)
  const [actor, setActor] = useState('')
  const [action, setAction] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [selected, setSelected] = useState<AdminAuditLog | null>(null)

  const filters = useMemo(() => {
    if (!isSuper) {
      return { mine: 1 }
    }
    return {
      actor: actor || undefined,
      action: action || undefined,
      resource_type: resourceType || undefined,
    }
  }, [isSuper, actor, action, resourceType])

  const fetcher = useCallback(
    (params: Parameters<typeof listAuditLogs>[0], signal?: AbortSignal) =>
      listAuditLogs(params, signal),
    [],
  )

  const { results, count, page, setPage, pageSize, loading, error } = usePaginatedList(
    fetcher,
    filters,
  )

  return (
    <div>
      <PageHeader
        title="Audit log"
        description={
          isSuper
            ? 'All staff actions (superuser). Filter by actor, action, resource.'
            : 'Your own actions only (staff).'
        }
      />

      {isSuper ? (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Input label="Actor id" value={actor} onChange={(e) => setActor(e.target.value)} />
          <Input label="Action" value={action} onChange={(e) => setAction(e.target.value)} />
          <Input
            label="Resource type"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
          />
        </div>
      ) : null}

      {loading ? <Spinner /> : null}
      {error ? <EmptyState title="Failed to load" description={error} /> : null}
      {!loading && !error && results.length === 0 ? <EmptyState title="No audit entries" /> : null}

      {results.length > 0 ? (
        <>
          <Table columns={['When', 'Actor', 'Action', 'Resource', '']}>
            {results.map((row) => (
              <Tr key={row.id}>
                <Td>{formatDate(row.created_at)}</Td>
                <Td>
                  {row.actor_username || row.actor_email || row.actor || '—'}
                </Td>
                <Td className="font-mono text-xs">{row.action}</Td>
                <Td>
                  {row.resource_type} · {row.resource_id}
                </Td>
                <Td>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setSelected(row)}>
                    Details
                  </Button>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} pageSize={pageSize} total={count} onPageChange={setPage} />
        </>
      ) : null}

      <Modal
        open={Boolean(selected)}
        title="Audit entry"
        onClose={() => setSelected(null)}
        size="lg"
      >
        {selected ? (
          <div className="space-y-3 text-sm">
            <p>
              <strong>{selected.action}</strong> on {selected.resource_type}/{selected.resource_id}
            </p>
            <p className="text-text-muted">{formatDate(selected.created_at)}</p>
            <JsonViewer value={selected.before} label="Before" />
            <JsonViewer value={selected.after} label="After" />
            <JsonViewer value={selected.metadata} label="Metadata (ip, ua, …)" />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
