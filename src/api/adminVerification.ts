import { adminGet, adminGetPaginated, adminPatch } from '@/api/adminClient'
import type { ListParams, VerificationRequest } from '@/types/admin'
import type { VerificationStatus } from '@/constants/enums'

export function listVerificationRequests(params?: ListParams, signal?: AbortSignal) {
  return adminGetPaginated<VerificationRequest>('/verification-requests/', params, signal)
}

export function getVerificationRequest(id: number, signal?: AbortSignal) {
  return adminGet<VerificationRequest>(`/verification-requests/${id}/`, undefined, signal)
}

export function updateVerificationRequest(
  id: number,
  body: { status: Extract<VerificationStatus, 'approved' | 'rejected'>; admin_notes?: string },
) {
  return adminPatch<VerificationRequest>(`/verification-requests/${id}/`, body)
}
