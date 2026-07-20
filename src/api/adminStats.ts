import { adminGet } from '@/api/adminClient'
import type {
  ListParams,
  StatsMoney,
  StatsMoneyByUser,
  StatsOverview,
  StatsTransactions,
  StatsUsers,
  StatsVisits,
} from '@/types/admin'

export function getStatsOverview(params?: ListParams, signal?: AbortSignal) {
  return adminGet<StatsOverview>('/stats/overview/', params, signal)
}

export function getStatsMoney(params?: ListParams, signal?: AbortSignal) {
  return adminGet<StatsMoney>('/stats/money/', params, signal)
}

export function getStatsUsers(params?: ListParams, signal?: AbortSignal) {
  return adminGet<StatsUsers>('/stats/users/', params, signal)
}

export function getStatsTransactions(params?: ListParams, signal?: AbortSignal) {
  return adminGet<StatsTransactions>('/stats/transactions/', params, signal)
}

export function getStatsMoneyByUser(params?: ListParams, signal?: AbortSignal) {
  return adminGet<StatsMoneyByUser>('/stats/money-by-user/', params, signal)
}

export function getStatsVisits(params?: ListParams, signal?: AbortSignal) {
  return adminGet<StatsVisits>('/stats/visits/', params, signal)
}
