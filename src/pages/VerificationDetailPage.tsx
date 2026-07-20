import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  getVerificationRequest,
  updateVerificationRequest,
} from '@/api/adminVerification'
import { useAuth } from '@/auth/AuthProvider'
import { DetailPane } from '@/components/layout/MasterDetail'
import type { DetailOutletContext } from '@/components/layout/detailOutlet'
import { ActionModal } from '@/components/shared/ActionModal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { STATUS_LABELS } from '@/constants/enums'
import { useApiError } from '@/hooks/useApiError'
import { formatDate } from '@/lib/utils'
import type { VerificationRequest } from '@/types/admin'

export function VerificationDetailPage() {
  const { id } = useParams()
  const requestId = Number(id)
  const navigate = useNavigate()
  const { listPath } = useOutletContext<DetailOutletContext>()
  const { refreshAccessToken } = useAuth()
  const toast = useToast()
  const onError = useApiError()
  const [item, setItem] = useState<VerificationRequest | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<'approved' | 'rejected' | null>(null)

  const close = () => navigate(listPath)

  const load = useCallback(async () => {
    if (!Number.isFinite(requestId)) return
    setLoading(true)
    try {
      const data = await getVerificationRequest(requestId)
      setItem(data)
      setNotes(data.admin_notes || '')
    } catch (err) {
      onError(err)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [requestId, onError])

  useEffect(() => {
    void load()
  }, [load])

  async function apply(status: 'approved' | 'rejected') {
    setBusy(true)
    try {
      await refreshAccessToken()
      const updated = await updateVerificationRequest(requestId, {
        status,
        admin_notes: notes,
      })
      setItem(updated)
      toast.success(
        status === 'approved'
          ? 'Approved — verification email/notification may be sent'
          : 'Rejected',
      )
      setConfirm(null)
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  if (!Number.isFinite(requestId)) {
    return (
      <DetailPane open title="Invalid" onClose={close}>
        <EmptyState title="Invalid id" />
      </DetailPane>
    )
  }
  if (loading) {
    return (
      <DetailPane open title="Verification" onClose={close}>
        <Spinner label="Loading…" />
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

  const pending = item.status === 'pending'
  const userName = item.user.username || item.user.email || String(item.user.id)

  return (
    <>
      <DetailPane
        open
        title={`Verification #${item.id}`}
        subtitle={
          <>
            <Badge
              tone={
                item.status === 'approved'
                  ? 'completed'
                  : item.status === 'rejected'
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
        footer={
          pending ? (
            <div className="flex gap-2">
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
            <p className="text-sm text-text-muted">Already {item.status}.</p>
          )
        }
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar name={userName} src={item.user.profile_picture} size="xl" />
          <div className="mt-3 font-semibold">{userName}</div>
        </div>

        <div className="mb-4 text-sm">
          <p className="font-medium">Reason</p>
          <p className="mt-1 whitespace-pre-wrap text-text-muted">{item.reason || '—'}</p>
        </div>

        <div className="mb-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">User photo</p>
            {item.user_photo_url ? (
              <>
                <a
                  href={item.user_photo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand hover:underline"
                >
                  Open image
                </a>
                <img
                  src={item.user_photo_url}
                  alt="User photo"
                  className="mt-2 max-h-48 w-full rounded-xl border border-border object-contain"
                />
              </>
            ) : (
              <span className="text-sm text-text-muted">—</span>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Identity document</p>
            {item.identity_document_url ? (
              <>
                <a
                  href={item.identity_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand hover:underline"
                >
                  Open document
                </a>
                <img
                  src={item.identity_document_url}
                  alt="Identity document"
                  className="mt-2 max-h-48 w-full rounded-xl border border-border object-contain"
                />
              </>
            ) : (
              <span className="text-sm text-text-muted">—</span>
            )}
          </div>
        </div>

        {item.reviewed_at ? (
          <p className="mb-3 text-xs text-text-muted">Reviewed {formatDate(item.reviewed_at)}</p>
        ) : null}

        <Textarea label="Admin notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </DetailPane>

      <ActionModal
        open={confirm === 'approved'}
        title="Approve verification?"
        confirmLabel="Approve"
        variant="dark"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void apply('approved')}
      >
        Approving sends a system email and in-app notification to the user.
      </ActionModal>
      <ActionModal
        open={confirm === 'rejected'}
        title="Reject verification?"
        confirmLabel="Reject"
        variant="danger"
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => void apply('rejected')}
      >
        <div className="space-y-3">
          <p className="text-sm text-text-muted">The user will be notified of the rejection.</p>
          <Textarea
            label="Admin notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </ActionModal>
    </>
  )
}
