import { useCallback, useEffect, useState } from 'react'
import {
  createProfileItem,
  listProfileItems,
  updateProfileItem,
} from '@/api/adminCatalog'
import { ActionModal } from '@/components/shared/ActionModal'
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
import { formatMoney } from '@/lib/utils'
import type { ProfileItem } from '@/types/admin'

export function ProfileItemsPage() {
  const toast = useToast()
  const onError = useApiError()
  const [items, setItems] = useState<ProfileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    slug: '',
    emoji: '',
    name: '',
    price: '',
    description: '',
  })
  const [editItem, setEditItem] = useState<ProfileItem | null>(null)
  const [editPrice, setEditPrice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listProfileItems())
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
      await createProfileItem({
        ...form,
        slug: form.slug.trim(),
        name: form.name.trim(),
        is_active: true,
      })
      toast.success('Profile item created')
      setForm({ slug: '', emoji: '', name: '', price: '', description: '' })
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  async function toggle(item: ProfileItem) {
    setBusy(true)
    try {
      await updateProfileItem(item.slug, { is_active: !item.is_active })
      toast.success(item.is_active ? 'Deactivated' : 'Activated')
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  async function savePrice() {
    if (!editItem) return
    const next = editPrice.trim()
    if (!next || next === editItem.price) {
      setEditItem(null)
      return
    }
    setBusy(true)
    try {
      await updateProfileItem(editItem.slug, { price: next })
      toast.success('Price updated')
      setEditItem(null)
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="Profile items" description="Tip menu items. Price is HTG." />

      <form
        className="mb-5 grid gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => void onCreate(e)}
      >
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} required />
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Price (HTG)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <div className="sm:col-span-2">
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <Button type="submit" variant="dark" disabled={busy}>
          Create
        </Button>
      </form>

      {loading ? <Spinner /> : null}
      {!loading && items.length === 0 ? <EmptyState title="No profile items" /> : null}

      {items.length > 0 ? (
        <Table columns={['', 'Slug', 'Name', 'Price HTG', 'Active', 'Actions']}>
          {items.map((item) => (
            <Tr key={item.slug}>
              <Td>{item.emoji}</Td>
              <Td className="font-mono text-xs">{item.slug}</Td>
              <Td>{item.name}</Td>
              <Td>{formatMoney(item.price)}</Td>
              <Td>
                <Badge tone={item.is_active ? 'completed' : 'neutral'}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setEditItem(item)
                      setEditPrice(item.price)
                    }}
                  >
                    Edit price
                  </Button>
                  <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void toggle(item)}>
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      ) : null}

      <ActionModal
        open={Boolean(editItem)}
        title="Edit price"
        confirmLabel="Save"
        variant="dark"
        busy={busy}
        onClose={() => !busy && setEditItem(null)}
        onConfirm={() => void savePrice()}
      >
        <Input label="Price (HTG)" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
      </ActionModal>
    </div>
  )
}
