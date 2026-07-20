import { adminGet, adminGetPaginated, adminPatch } from '@/api/adminClient'
import type { ListParams, PaymentRequest } from '@/types/admin'
import type { PaymentRequestStatus } from '@/constants/enums'

export function listPaymentRequests(params?: ListParams, signal?: AbortSignal) {
  return adminGetPaginated<PaymentRequest>('/payment-requests/', params, signal)
}

export function getPaymentRequest(id: string, signal?: AbortSignal) {
  return adminGet<PaymentRequest>(`/payment-requests/${id}/`, undefined, signal)
}

export function updatePaymentRequest(
  id: string,
  body: {
    status: Extract<PaymentRequestStatus, 'in_process' | 'approved' | 'rejected'>
    admin_notes?: string
  },
) {
  return adminPatch<PaymentRequest>(`/payment-requests/${id}/`, body)
}
