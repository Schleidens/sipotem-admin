import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

/** Styled confirmation/action modal — use instead of ConfirmDialog or window.confirm. */
export function ActionModal({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  busy = false,
  onConfirm,
  onClose,
  size = 'md',
}: {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger' | 'accent' | 'dark'
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size={size}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      }
    >
      {typeof children === 'string' ? (
        <p className="whitespace-pre-wrap text-sm text-text-muted">{children}</p>
      ) : (
        children
      )}
    </Modal>
  )
}
