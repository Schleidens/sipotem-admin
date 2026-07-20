import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { getTransaction } from '@/api/adminTransactions'
import { DetailPane } from '@/components/layout/MasterDetail'
import type { DetailOutletContext } from '@/components/layout/detailOutlet'
import { JsonViewer } from '@/components/shared/JsonViewer'
import { MoneyText } from '@/components/shared/MoneyText'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { METHOD_LABELS, STATUS_LABELS } from '@/constants/enums'
import { useApiError } from '@/hooks/useApiError'
import { formatDate } from '@/lib/utils'
import type { AdminTransaction } from '@/types/admin'

export function TransactionDetailPage() {
  const { id } = useParams()
  const txnId = id ?? ''
  const navigate = useNavigate()
  const { listPath } = useOutletContext<DetailOutletContext>()
  const onError = useApiError()
  const [item, setItem] = useState<AdminTransaction | null>(null)
  const [loading, setLoading] = useState(true)

  const close = () => navigate(listPath)

  const load = useCallback(async () => {
    if (!txnId) return
    setLoading(true)
    try {
      setItem(await getTransaction(txnId))
    } catch (err) {
      onError(err)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [txnId, onError])

  useEffect(() => {
    void load()
  }, [load])

  if (!txnId) {
    return (
      <DetailPane open title="Invalid" onClose={close}>
        <EmptyState title="Invalid id" />
      </DetailPane>
    )
  }
  if (loading) {
    return (
      <DetailPane open title="Transaction" onClose={close}>
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

  return (
    <DetailPane
      open
      title={`Txn #${item.id.slice(0, 8)}`}
      subtitle={
        <>
          <Badge
            tone={
              item.status === 'success'
                ? 'completed'
                : item.status === 'failed'
                  ? 'danger'
                  : 'paid'
            }
          >
            {STATUS_LABELS[item.status]}
          </Badge>
          <span className="text-xs text-text-muted">{formatDate(item.created_at)}</span>
        </>
      }
      onClose={close}
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <Avatar name={item.receiver_username} size="xl" />
        <div className="mt-3 font-semibold">{item.receiver_username || '—'}</div>
        <div className="mt-1 flex flex-wrap justify-center gap-1">
          <Badge>{item.transaction_type}</Badge>
          <Badge>{METHOD_LABELS[item.payment_method] || item.payment_method}</Badge>
        </div>
      </div>

      <div className="mb-5 space-y-2 text-sm">
        <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
          <span className="text-text-muted">Amount</span>
          <MoneyText amount={item.amount} currency={item.currency} className="font-semibold" />
        </div>
        <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
          <span className="text-text-muted">HTG / USD</span>
          <span>
            <MoneyText amount={item.amount_htg} currency="HTG" /> ·{' '}
            <MoneyText amount={item.amount_usd} currency="USD" />
          </span>
        </div>
        <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
          <span className="text-text-muted">Donor</span>
          <span>{item.donor_username || item.donor_name || '—'}</span>
        </div>
        <div className="flex justify-between rounded-xl bg-canvas px-3 py-2.5">
          <span className="text-text-muted">Fundraiser</span>
          <span>{item.fundraiser_slug || '—'}</span>
        </div>
      </div>

      <div className="mb-5 text-sm">
        <p className="font-medium">Message</p>
        <p className="mt-1 whitespace-pre-wrap text-text-muted">{item.message || '—'}</p>
        <p className="mt-3 text-xs text-text-muted">
          External order: {item.external_order_id || '—'} · txn:{' '}
          {item.external_transaction_id || '—'}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Audit logs</h3>
        {(item.audit_logs ?? []).length === 0 ? (
          <p className="text-sm text-text-muted">No audit logs.</p>
        ) : (
          (item.audit_logs ?? []).map((log, idx) => (
            <div key={idx} className="rounded-xl border border-border p-3 text-sm">
              <p>
                {log.previous_status || '—'} → {log.new_status} · {log.source} ·{' '}
                {formatDate(log.created_at)}
              </p>
              <JsonViewer value={log.payload} label="Payload" />
            </div>
          ))
        )}
      </div>
    </DetailPane>
  )
}
