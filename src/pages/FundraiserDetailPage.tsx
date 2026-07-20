import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { getFundraiser, updateFundraiser } from '@/api/adminFundraisers'
import { useAuth } from '@/auth/AuthProvider'
import { CURRENCIES, type Currency } from '@/constants/enums'
import { DetailPane } from '@/components/layout/MasterDetail'
import type { DetailOutletContext } from '@/components/layout/detailOutlet'
import { ActionModal } from '@/components/shared/ActionModal'
import { MoneyText } from '@/components/shared/MoneyText'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useApiError } from '@/hooks/useApiError'
import type { Fundraiser } from '@/types/admin'

export function FundraiserDetailPage() {
  const { id } = useParams()
  const fundraiserId = id ?? ''
  const navigate = useNavigate()
  const { listPath } = useOutletContext<DetailOutletContext>()
  const { refreshAccessToken } = useAuth()
  const toast = useToast()
  const onError = useApiError()
  const [item, setItem] = useState<Fundraiser | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [currency, setCurrency] = useState<Currency>('HTG')
  const [confirm, setConfirm] = useState<'close' | 'suspend' | 'unsuspend' | null>(null)

  const close = () => navigate(listPath)

  const load = useCallback(async () => {
    if (!fundraiserId) return
    setLoading(true)
    try {
      const data = await getFundraiser(fundraiserId)
      setItem(data)
      setTitle(data.title)
      setGoal(data.goal_amount)
      setCurrency(data.currency)
    } catch (err) {
      onError(err)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [fundraiserId, onError])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    setBusy(true)
    try {
      const updated = await updateFundraiser(fundraiserId, {
        title,
        goal_amount: goal,
        currency,
      })
      setItem(updated)
      toast.success('Fundraiser updated')
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  async function patch(body: Partial<{ is_active: boolean; is_suspended: boolean }>) {
    setBusy(true)
    try {
      await refreshAccessToken()
      const updated = await updateFundraiser(fundraiserId, body)
      setItem(updated)
      toast.success('Updated')
      setConfirm(null)
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  if (!fundraiserId) {
    return (
      <DetailPane open title="Invalid" onClose={close}>
        <EmptyState title="Invalid id" />
      </DetailPane>
    )
  }
  if (loading) {
    return (
      <DetailPane open title="Fundraiser" onClose={close}>
        <Spinner />
      </DetailPane>
    )
  }
  if (!item) {
    return (
      <DetailPane open title="Not found" onClose={close}>
        <EmptyState title="Not found" />
      </DetailPane>
    )
  }

  const creatorName = item.creator?.username || item.creator?.email || String(item.creator?.id ?? '—')

  return (
    <>
      <DetailPane
        open
        title={item.title}
        subtitle={
          <>
            <Badge tone={item.is_active ? 'completed' : 'neutral'}>
              {item.is_active ? 'Active' : 'Closed'}
            </Badge>
            {item.is_suspended ? <Badge tone="danger">Suspended</Badge> : null}
            <span className="text-xs text-text-muted">{item.slug}</span>
          </>
        }
        onClose={close}
        footer={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="dark" className="flex-1" disabled={busy} onClick={() => void save()}>
              Save
            </Button>
            {item.is_active ? (
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                disabled={busy}
                onClick={() => setConfirm('close')}
              >
                Close
              </Button>
            ) : null}
            {item.is_suspended ? (
              <Button
                type="button"
                variant="accent"
                className="flex-1"
                disabled={busy}
                onClick={() => setConfirm('unsuspend')}
              >
                Unsuspend
              </Button>
            ) : (
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                disabled={busy}
                onClick={() => setConfirm('suspend')}
              >
                Suspend
              </Button>
            )}
          </div>
        }
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar name={creatorName} src={item.creator?.profile_picture} size="xl" />
          <div className="mt-3 font-semibold">{creatorName}</div>
          <div className="text-sm text-text-muted">Creator</div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-canvas p-3">
            <div className="text-xs text-text-muted">Raised HTG</div>
            <MoneyText amount={item.raised_htg} currency="HTG" className="font-semibold" />
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <div className="text-xs text-text-muted">Raised USD</div>
            <MoneyText amount={item.raised_usd} currency="USD" className="font-semibold" />
          </div>
        </div>

        <div className="space-y-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Goal amount" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </DetailPane>

      <ActionModal
        open={confirm === 'close'}
        title="Close fundraiser?"
        confirmLabel="Close"
        variant="dark"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void patch({ is_active: false })}
      >
        Sets is_active=false. The fundraiser will no longer accept contributions.
      </ActionModal>
      <ActionModal
        open={confirm === 'suspend'}
        title="Suspend fundraiser?"
        confirmLabel="Suspend"
        variant="danger"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void patch({ is_suspended: true })}
      >
        Sets is_suspended=true.
      </ActionModal>
      <ActionModal
        open={confirm === 'unsuspend'}
        title="Unsuspend fundraiser?"
        confirmLabel="Unsuspend"
        variant="accent"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void patch({ is_suspended: false })}
      >
        Sets is_suspended=false.
      </ActionModal>
    </>
  )
}
