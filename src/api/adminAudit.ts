import { adminGetPaginated } from '@/api/adminClient'
import type { AdminAuditLog, ListParams } from '@/types/admin'

export function listAuditLogs(params?: ListParams, signal?: AbortSignal) {
  return adminGetPaginated<AdminAuditLog>('/audit-logs/', params, signal)
}
