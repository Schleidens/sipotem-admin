import { adminGet, adminGetPaginated, adminPatch, adminPut } from '@/api/adminClient'
import type { AdminUserDetail, AdminUserListItem, AdminUserUpdate, Badge, ListParams } from '@/types/admin'

export function listUsers(params?: ListParams, signal?: AbortSignal) {
  return adminGetPaginated<AdminUserListItem>('/users/', params, signal)
}

export function getUser(id: number, signal?: AbortSignal) {
  return adminGet<AdminUserDetail>(`/users/${id}/`, undefined, signal)
}

export function updateUser(id: number, body: AdminUserUpdate) {
  return adminPatch<AdminUserDetail>(`/users/${id}/`, body)
}

export function updateUserRoles(id: number, body: { is_staff?: boolean; is_superuser?: boolean }) {
  return adminPatch<AdminUserDetail>(`/users/${id}/roles/`, body)
}

export function getUserBadges(id: number, signal?: AbortSignal) {
  return adminGet<Badge[]>(`/users/${id}/badges/`, undefined, signal)
}

export function setUserBadges(id: number, badges: string[]) {
  return adminPut<Badge[]>(`/users/${id}/badges/`, { badges })
}
