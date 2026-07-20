import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  listCategories,
  updateCategory,
} from '@/api/adminCatalog'
import { ActionModal } from '@/components/shared/ActionModal'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Table, Td, Tr } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { useApiError } from '@/hooks/useApiError'
import type { Category } from '@/types/admin'

export function CategoriesPage() {
  const toast = useToast()
  const onError = useApiError()
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [editItem, setEditItem] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listCategories())
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
      await createCategory({ slug: slug.trim(), name: name.trim(), is_active: true })
      toast.success('Category created')
      setSlug('')
      setName('')
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  async function toggle(item: Category) {
    setBusy(true)
    try {
      await updateCategory(item.slug, { is_active: !item.is_active })
      toast.success(item.is_active ? 'Deactivated' : 'Activated')
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  async function saveRename() {
    if (!editItem) return
    const next = editName.trim()
    if (!next || next === editItem.name) {
      setEditItem(null)
      return
    }
    setBusy(true)
    try {
      await updateCategory(editItem.slug, { name: next })
      toast.success('Updated')
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
      <PageHeader title="Categories" description="Creator categories. Deactivate instead of deleting." />

      <form
        className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-[var(--shadow-soft)]"
        onSubmit={(e) => void onCreate(e)}
      >
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Button type="submit" variant="dark" disabled={busy}>
          Create
        </Button>
      </form>

      {loading ? <Spinner /> : null}
      {!loading && items.length === 0 ? <EmptyState title="No categories" /> : null}

      {items.length > 0 ? (
        <Table columns={['Slug', 'Name', 'Active', 'Actions']}>
          {items.map((item) => (
            <Tr key={item.slug}>
              <Td className="font-mono text-xs">{item.slug}</Td>
              <Td>{item.name}</Td>
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
                      setEditName(item.name)
                    }}
                  >
                    Edit
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
        title="Rename category"
        confirmLabel="Save"
        variant="dark"
        busy={busy}
        onClose={() => !busy && setEditItem(null)}
        onConfirm={() => void saveRename()}
      >
        <Input label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
      </ActionModal>
    </div>
  )
}
