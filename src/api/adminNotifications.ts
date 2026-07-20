import { adminGetPaginated, adminPost } from '@/api/adminClient'
import type { AdminNotification, ListParams } from '@/types/admin'

export function listNotifications(params?: ListParams, signal?: AbortSignal) {
  return adminGetPaginated<AdminNotification>('/notifications/', params, signal)
}

export function createNotification(body: {
  target: 'all' | 'user'
  user_id?: number
  title: string
  body: string
  action_url?: string
}) {
  return adminPost<AdminNotification | { created: number }>('/notifications/', body)
}
