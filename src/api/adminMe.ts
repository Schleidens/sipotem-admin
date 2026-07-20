import { adminGet } from '@/api/adminClient'
import type { AdminMe } from '@/types/admin'

export function fetchAdminMe(signal?: AbortSignal) {
  return adminGet<AdminMe>('/me/', undefined, signal)
}
