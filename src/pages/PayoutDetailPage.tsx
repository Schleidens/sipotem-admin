import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { getPaymentRequest, updatePaymentRequest } from '@/api/adminPayments'
import { useAuth } from '@/auth/AuthProvider'
import { DetailPane } from '@/components/layout/MasterDetail'
import type { DetailOutletContext } from '@/components/layout/detailOutlet'
import { ActionModal } from '@/components/shared/ActionModal'
import { MoneyText } from '@/components/shared/MoneyText'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { METHOD_LABELS, STATUS_LABELS } from '@/constants/enums'
import { useApiError } from '@/hooks/useApiError'
import { formatDate } from '@/lib/utils'
import type { PaymentRequest } from '@/types/admin'
import type { PaymentRequestStatus } from '@/constants/enums'

function statusTone(status: string) {
  if (status === 'approved') return 'completed' as const
  if (status === 'rejected') return 'danger' as const
  if (status === 'in_process') return 'delivered' as const
  return 'paid' as const
}

export function PayoutDetailPage() {
  const { id } = useParams()
  const payoutId = id ?? ''
  const navigate = useNavigate()
  const { listPath } = useOutletContext<DetailOutletContext>()
  const { refreshAccessToken } = useAuth()
  const toast = useToast()
  const onError = useApiError()
  const [item, setItem] = useState<PaymentRequest | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Extract<
    PaymentRequestStatus,
    'in_process' | 'approved' | 'rejected'
  > | null>(null)

  const close = () => navigate(listPath)

  const load = useCallback(async () => {
    if (!payoutId) return
    setLoading(true)
    try {
      const data = await getPaymentRequest(payoutId)
      setItem(data)
      setNotes(data.admin_notes || '')
    } catch (err) {
      onError(err)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [payoutId, onError])

  useEffect(() => {
    void load()
  }, [load])

  async function apply(status: 'in_process' | 'approved' | 'rejected') {
    setBusy(true)
    try {
      await refreshAccessToken()
      const updated = await updatePaymentRequest(payoutId, {
        status,
        admin_notes: notes,
      })
      setItem(updated)
      if (status === 'approved') {
        toast.success('Approved — wallet debited and user notified by email/in-app')
      } else if (status === 'rejected') {
        toast.success('Rejected — user notified')
      } else {
        toast.success('Marked in process')
      }
      setConfirm(null)
    } catch (err) {
      onError(err, 'Payout update failed (check wallet balance)')
    } finally {
      setBusy(false)
    }
  }

  if (!payoutId) {
    return (
      <DetailPane open title="Invalid" onClose={close}>
        <EmptyState title="Invalid id" />
      </DetailPane>
    )
  }
  if (loading) {
    return (
      <DetailPane open title="Payout" onClose={close}>
        <Spinner label="Loading payout…" />
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

  const canProcess = item.status === 'pending'
  const canDecide = item.status === 'pending' || item.status === 'in_process'
  const userName = item.user?.username || '—'

  return (
    <>
      <DetailPane
        open
        title={`Payout #${item.id.slice(0, 8)}`}
        subtitle={
          <>
            <Badge tone={statusTone(item.status)}>{STATUS_LABELS[item.status]}</Badge>
            <span className="text-xs text-text-muted">{formatDate(item.created_at)}</span>
          </>
        }
        onClose={close}
        footer={
          canDecide ? (
            <div className="flex flex-wrap gap-2">
              {canProcess ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => setConfirm('in_process')}
                >
                  In process
                </Button>
              ) : null}
              <Button
                type="button"
                variant="dark"
                className="flex-1"
                disabled={busy}
                onClick={() => setConfirm('approved')}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="accent"
                className="flex-1"
                disabled={busy}
                onClick={() => setConfirm('rejected')}
              >
                Reject
              </Button>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No further status transitions.</p>
          )
        }
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar name={userName} src={item.user?.profile_picture} size="xl" />
          <div className="mt-3 font-semibold">{userName}</div>
          <div className="text-sm text-text-muted">
            {METHOD_LABELS[item.payment_method] || item.payment_method}
          </div>
        </div>

        <div className="mb-5 space-y-2 text-sm">
          <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
            <span className="text-text-muted">Amount</span>
            <MoneyText amount={item.amount} currency={item.currency} className="font-semibold" />
          </div>
          <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
            <span className="text-text-muted">Payout HTG</span>
            <MoneyText amount={item.payout_amount_htg} currency="HTG" className="font-semibold" />
          </div>
          <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
            <span className="text-text-muted">Phone</span>
            <span>{item.phone_number || '—'}</span>
          </div>
          <div className="rounded-xl bg-canvas px-3 py-2.5">
            <div className="text-text-muted">Bank</div>
            <div className="mt-0.5">
              {item.bank_name || '—'} · {item.bank_account_holder_name || '—'}
            </div>
            <div className="font-mono text-xs">{item.bank_account_number || ''}</div>
          </div>
          <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
            <span className="text-text-muted">FX rate</span>
            <span>{item.exchange_rate_htg_per_usd || '—'}</span>
          </div>
        </div>

        <div className="mb-4 text-sm">
          <p className="font-medium">User note</p>
          <p className="mt-1 whitespace-pre-wrap text-text-muted">{item.note || '—'}</p>
        </div>

        <div className="mb-4 space-y-1 text-sm text-text-muted">
          <p>Created: {formatDate(item.created_at)}</p>
          <p>Updated: {formatDate(item.updated_at)}</p>
          <p>Reviewed: {formatDate(item.reviewed_at)}</p>
          <p>Last updated by: {item.last_updated_by?.username || '—'}</p>
        </div>

        <Textarea label="Admin notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <p className="mt-2 text-xs text-text-muted">
          Transitions: pending → in_process → approved|rejected. Approve auto-debits the wallet.
        </p>
      </DetailPane>

      <ActionModal
        open={confirm === 'approved'}
        title="Approve payout?"
        confirmLabel="Approve payout"
        variant="dark"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void apply('approved')}
      >
        {`This will debit ${item.payout_amount_htg} HTG from the user's wallet and send payment confirmation email + in-app notification. Insufficient balance will fail.`}
      </ActionModal>
      <ActionModal
        open={confirm === 'rejected'}
        title="Reject payout?"
        confirmLabel="Reject"
        variant="danger"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void apply('rejected')}
      >
        <div className="space-y-3">
          <p className="text-sm text-text-muted">
            The user will receive email and in-app notification. No wallet debit.
          </p>
          <Textarea
            label="Admin notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </ActionModal>
      <ActionModal
        open={confirm === 'in_process'}
        title="Mark in process?"
        confirmLabel="Mark in process"
        variant="dark"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void apply('in_process')}
      >
        Marks this payout as being worked on.
      </ActionModal>
    </>
  )
}
