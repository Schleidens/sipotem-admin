import { adminGet, adminGetPaginated } from '@/api/adminClient'
import type { AdminTransaction, ListParams } from '@/types/admin'

export function listTransactions(params?: ListParams, signal?: AbortSignal) {
  return adminGetPaginated<AdminTransaction>('/transactions/', params, signal)
}

export function getTransaction(id: string, signal?: AbortSignal) {
  return adminGet<AdminTransaction>(`/transactions/${id}/`, undefined, signal)
}
