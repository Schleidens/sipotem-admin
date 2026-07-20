import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { createNotification, listNotifications } from '@/api/adminNotifications'
import { listUsers } from '@/api/adminUsers'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Table, Td, Tr } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiError } from '@/hooks/useApiError'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { formatDate } from '@/lib/utils'

export function NotificationsPage() {
  const toast = useToast()
  const onError = useApiError()
  const [target, setTarget] = useState<'all' | 'user'>('all')
  const [userId, setUserId] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userOptions, setUserOptions] = useState<Array<{ id: number; label: string }>>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const filters = useMemo(() => ({}), [])
  const fetcher = useCallback(
    (params: Parameters<typeof listNotifications>[0], signal?: AbortSignal) =>
      listNotifications(params, signal),
    [],
  )
  const { results, count, page, setPage, pageSize, loading, error, reload } = usePaginatedList(
    fetcher,
    filters,
  )

  async function searchUsers() {
    try {
      const res = await listUsers({ q: userQuery, page_size: 20 })
      setUserOptions(
        res.results.map((u) => ({
          id: u.id,
          label: `${u.username || u.email} (#${u.id})`,
        })),
      )
    } catch (err) {
      onError(err)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await createNotification({
        target,
        user_id: target === 'user' ? Number(userId) : undefined,
        title,
        body,
        action_url: actionUrl,
      })
      toast.success(
        target === 'all'
          ? 'Broadcast queued (may email marketing-opt-in users)'
          : 'Notification sent',
      )
      setTitle('')
      setBody('')
      setActionUrl('')
      await reload()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Compose staff broadcasts or DMs. History shows admin-originated sends."
      />

      <form className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-4 space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <h2 className="font-semibold">Compose</h2>
        <Select
          label="Target"
          value={target}
          onChange={(e) => setTarget(e.target.value as 'all' | 'user')}
        >
          <option value="all">Broadcast (all)</option>
          <option value="user">Single user</option>
        </Select>

        {target === 'user' ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Find user"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search username/email"
              />
              <Button type="button" variant="secondary" onClick={() => void searchUsers()}>
                Search
              </Button>
            </div>
            <Select
              label="User"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            >
              <option value="">Select…</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </Select>
            <Input
              label="Or user id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
        ) : null}

        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} required />
        <Input
          label="Action URL (optional)"
          value={actionUrl}
          onChange={(e) => setActionUrl(e.target.value)}
        />
        <p className="text-xs text-text-muted">
          Broadcasts may email users who opted into marketing. System/DM behavior follows user prefs.
        </p>
        <Button type="submit" variant="dark" disabled={busy}>
          Send
        </Button>
      </form>

      <div>
        <h2 className="mb-3 font-semibold">History</h2>
        {loading ? <Spinner /> : null}
        {error ? <EmptyState title="Failed to load" description={error} /> : null}
        {!loading && !error && results.length === 0 ? (
          <EmptyState title="No admin notifications yet" />
        ) : null}
        {results.length > 0 ? (
          <>
            <Table columns={['Title', 'Recipient', 'Category', 'By', 'Created']}>
              {results.map((row) => (
                <Tr key={row.id}>
                  <Td>
                    <div className="font-medium">{row.title}</div>
                    <div className="max-w-xs truncate text-xs text-text-muted">{row.body}</div>
                  </Td>
                  <Td>{row.recipient_username || (row.broadcast_id ? 'Broadcast' : '—')}</Td>
                  <Td>{row.category}</Td>
                  <Td>{row.created_by_username || '—'}</Td>
                  <Td>{formatDate(row.created_at)}</Td>
                </Tr>
              ))}
            </Table>
            <Pagination page={page} pageSize={pageSize} total={count} onPageChange={setPage} />
          </>
        ) : null}
      </div>
    </div>
  )
}
