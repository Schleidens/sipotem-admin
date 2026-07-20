import { adminGet, adminGetPaginated, adminPatch } from '@/api/adminClient'
import type { Fundraiser, ListParams } from '@/types/admin'
import type { Currency } from '@/constants/enums'

export function listFundraisers(params?: ListParams, signal?: AbortSignal) {
  return adminGetPaginated<Fundraiser>('/fundraisers/', params, signal)
}

export function getFundraiser(id: string, signal?: AbortSignal) {
  return adminGet<Fundraiser>(`/fundraisers/${id}/`, undefined, signal)
}

export function updateFundraiser(
  id: string,
  body: Partial<{
    title: string
    goal_amount: string
    currency: Currency
    is_active: boolean
    is_suspended: boolean
  }>,
) {
  return adminPatch<Fundraiser>(`/fundraisers/${id}/`, body)
}
