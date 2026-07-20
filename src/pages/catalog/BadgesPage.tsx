import { useCallback, useEffect, useState } from 'react'
import { createBadge, listBadges, updateBadge } from '@/api/adminCatalog'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Table, Td, Tr } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiError } from '@/hooks/useApiError'
import type { Badge as BadgeType } from '@/types/admin'

export function BadgesPage() {
  const toast = useToast()
  const onError = useApiError()
  const [items, setItems] = useState<BadgeType[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    slug: '',
    name: '',
    icon_url: '',
    description: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listBadges())
    } catch (err) {
      onError(err)
    } finally {
      setLoading(false)
    }
  }, [onError])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await createBadge({ ...form, is_active: true })
      toast.success('Badge created')
      setForm({ slug: '', name: '', icon_url: '', description: '' })
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  async function toggle(item: BadgeType) {
    setBusy(true)
    try {
      await updateBadge(item.slug, { is_active: !item.is_active })
      toast.success(item.is_active ? 'Deactivated' : 'Activated')
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="Badges" description="Awardable badges. Deactivate instead of deleting." />

      <form className="mb-5 grid gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2" onSubmit={(e) => void onCreate(e)}>
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Icon URL" value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Button type="submit" variant="dark" disabled={busy}>
          Create
        </Button>
      </form>

      {loading ? <Spinner /> : null}
      {!loading && items.length === 0 ? <EmptyState title="No badges" /> : null}

      {items.length > 0 ? (
        <Table columns={['Slug', 'Name', 'Active', 'Actions']}>
          {items.map((item) => (
            <Tr key={item.slug}>
              <Td className="font-mono text-xs">{item.slug}</Td>
              <Td>{item.name}</Td>
              <Td>
                <Badge tone={item.is_active !== false ? 'completed' : 'neutral'}>
                  {item.is_active !== false ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td>
                <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void toggle(item)}>
                  {item.is_active !== false ? 'Deactivate' : 'Activate'}
                </Button>
              </Td>
            </Tr>
          ))}
        </Table>
      ) : null}
    </div>
  )
}
