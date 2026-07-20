import type {
  Currency,
  ExchangePurpose,
  PaymentMethod,
  PaymentRequestStatus,
  TransactionStatus,
  TransactionType,
  VerificationStatus,
} from '@/constants/enums'

export type AdminMe = {
  id: number
  email: string
  username: string | null
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  profile_picture?: string | null
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ApiErrorBody = {
  error_code?: string
  message?: string
  detail?: string | Record<string, unknown>
  [key: string]: unknown
}

export type UserSummary = {
  id?: number
  email?: string
  username: string | null
  profile_picture?: string
}

export type AdminUserListItem = {
  id: number
  email: string
  username: string | null
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  is_verified: boolean
  profile_picture: string
  balance_htg: string
  balance_usd: string
  date_joined: string
}

export type Badge = {
  slug: string
  name: string
  icon_url?: string
  description?: string
  is_active?: boolean
}

export type AdminUserDetail = AdminUserListItem & {
  bio: string
  is_public: boolean
  phone_number: string | null
  creator_category: string | null
  country: string
  department: string
  city: string
  badges: Badge[]
  firebase_uid: string
  profile_banner_url?: string
}

export type AdminUserUpdate = {
  email?: string
  is_active?: boolean
  first_name?: string
  last_name?: string
  username?: string | null
  bio?: string
  is_public?: boolean
  profile_picture?: string
  profile_banner_url?: string
  phone_number?: string | null
  is_verified?: boolean
  creator_category?: string | null
  country?: string
  department?: string
  city?: string
}

export type VerificationRequest = {
  id: number
  user: UserSummary
  user_photo_url: string
  identity_document_url: string
  reason: string
  status: VerificationStatus
  admin_notes: string
  reviewed_at: string | null
  rejected_at: string | null
  can_resubmit_at: string | null
  created_at: string
  updated_at: string
}

export type PaymentRequest = {
  id: string
  amount: string
  currency: Currency
  payout_amount_htg: string
  exchange_rate_htg_per_usd: string | null
  payment_method: PaymentMethod
  phone_number: string | null
  bank_account_holder_name: string | null
  bank_name: string | null
  bank_account_number: string | null
  note: string
  status: PaymentRequestStatus
  admin_notes: string
  reviewed_at: string | null
  last_updated_by: UserSummary | null
  user: UserSummary
  created_at: string
  updated_at: string
}

export type ExchangeRate = {
  purpose: ExchangePurpose
  htg_per_usd: string
  updated_at: string
}

export type Category = {
  slug: string
  name: string
  is_active: boolean
  created_at?: string
}

export type ProfileItem = {
  slug: string
  emoji: string
  name: string
  price: string
  description: string
  is_active: boolean
}

export type Fundraiser = {
  id: string
  title: string
  slug: string
  goal_amount: string
  currency: Currency
  is_active: boolean
  is_suspended: boolean
  creator: UserSummary
  raised_htg: string
  raised_usd: string
  created_at: string
  updated_at: string
}

export type TransactionAuditLog = {
  previous_status: string | null
  new_status: string
  source: string
  payload: Record<string, unknown>
  created_at: string
}

export type AdminTransaction = {
  id: string
  transaction_type: TransactionType
  donor_name: string
  donor_username: string | null
  receiver_username: string | null
  fundraiser_slug: string | null
  amount_htg: string
  amount_usd: string
  amount: string
  currency: Currency
  message: string
  payment_method: PaymentMethod
  status: TransactionStatus
  external_order_id: string | null
  external_transaction_id: string | null
  created_at: string
  updated_at: string
  audit_logs?: TransactionAuditLog[]
}

export type AdminAuditLog = {
  id: number
  actor: number | null
  actor_email: string | null
  actor_username: string | null
  action: string
  resource_type: string
  resource_id: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  metadata: Record<string, unknown>
  created_at: string
}

export type AdminNotification = {
  id: string
  recipient: number | null
  recipient_username: string | null
  origin: string
  category: string
  title: string
  body: string
  action_url: string
  broadcast_id: string | null
  created_by: number | null
  created_by_username: string | null
  created_at: string
}

export type StatsOverview = {
  period: { from: string | null; to: string | null }
  lifetime: {
    users: Record<string, number>
    visits: Record<string, number>
    fundraisers: Record<string, number>
    wallets?: { balance_htg: string; balance_usd: string }
  }
  period_metrics: {
    users: Record<string, number>
    transactions: { by_status: Record<string, number> }
    payouts: { by_status: Record<string, { count: number; total_amount?: string }> }
    visits: Record<string, number>
    money?: {
      total_htg: string
      total_usd: string
      by_transaction_type?: unknown[]
      by_payment_method?: unknown[]
    }
  }
}

export type StatsMoney = {
  period: { from: string | null; to: string | null }
  total_htg: string
  total_usd: string
  by_currency: unknown[]
  by_type: unknown[]
  by_payment_method: unknown[]
  by_day: Array<{ day: string; total_htg?: string; total_usd?: string; count?: number }>
}

export type StatsUsers = {
  period: { from: string | null; to: string | null }
  counts: Record<string, number>
  recently_active_count: number
  new_by_day: Array<{ day: string; count: number }>
  recently_active_users?: unknown[]
}

export type StatsTransactions = {
  period: { from: string | null; to: string | null }
  by_status: Record<string, number>
  by_transaction_type: Record<string, number>
  by_payment_method: Record<string, number>
  success_rate_percent: number
  by_day: Array<{ day: string; count?: number; total_htg?: string; total_usd?: string }>
  volume?: { total_htg: string; total_usd: string }
  average_tip_htg?: string
  average_tip_usd?: string
}

export type StatsMoneyByUser = {
  period: { from: string | null; to: string | null }
  role: string
  order_by: string
  results: Array<{
    user_id: number
    username: string | null
    email?: string
    total_htg: string
    total_usd: string
  }>
}

export type StatsVisits = {
  period: { from: string | null; to: string | null }
  total_unique_views: number
  unique_views_in_period: number
  by_day: Array<{ day: string; count: number }>
  top_creators: Array<{
    user_id?: number
    username?: string | null
    unique_views: number
  }>
}

export type ListParams = Record<string, string | number | boolean | undefined | null>
