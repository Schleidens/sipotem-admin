import { adminGet, adminPatch } from '@/api/adminClient'
import type { ExchangeRate } from '@/types/admin'
import type { ExchangePurpose } from '@/constants/enums'

export function listExchangeRates(signal?: AbortSignal) {
  return adminGet<ExchangeRate[]>('/exchange-rates/', undefined, signal)
}

export function updateExchangeRate(purpose: ExchangePurpose, htg_per_usd: string) {
  return adminPatch<ExchangeRate>(`/exchange-rates/${purpose}/`, { htg_per_usd })
}
