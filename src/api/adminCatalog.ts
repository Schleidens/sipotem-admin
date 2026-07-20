import { adminGet, adminPatch, adminPost } from '@/api/adminClient'
import type { Badge, Category, ProfileItem } from '@/types/admin'

export function listCategories(signal?: AbortSignal) {
  return adminGet<Category[]>('/categories/', undefined, signal)
}

export function createCategory(body: { slug: string; name: string; is_active?: boolean }) {
  return adminPost<Category>('/categories/', body)
}

export function updateCategory(slug: string, body: Partial<{ slug: string; name: string; is_active: boolean }>) {
  return adminPatch<Category>(`/categories/${slug}/`, body)
}

export function listProfileItems(signal?: AbortSignal) {
  return adminGet<ProfileItem[]>('/profile-items/', undefined, signal)
}

export function createProfileItem(body: {
  slug: string
  emoji: string
  name: string
  price: string
  description?: string
  is_active?: boolean
}) {
  return adminPost<ProfileItem>('/profile-items/', body)
}

export function updateProfileItem(
  slug: string,
  body: Partial<{
    slug: string
    emoji: string
    name: string
    price: string
    description: string
    is_active: boolean
  }>,
) {
  return adminPatch<ProfileItem>(`/profile-items/${slug}/`, body)
}

export function listBadges(signal?: AbortSignal) {
  return adminGet<Badge[]>('/badges/', undefined, signal)
}

export function createBadge(body: {
  slug: string
  name: string
  icon_url?: string
  description?: string
  is_active?: boolean
}) {
  return adminPost<Badge>('/badges/', body)
}

export function updateBadge(
  slug: string,
  body: Partial<{
    slug: string
    name: string
    icon_url: string
    description: string
    is_active: boolean
  }>,
) {
  return adminPatch<Badge>(`/badges/${slug}/`, body)
}
