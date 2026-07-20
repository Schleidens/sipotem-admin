export const PAYMENT_REQUEST_STATUSES = [
  'pending',
  'in_process',
  'approved',
  'rejected',
] as const

export const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected'] as const

export const TRANSACTION_STATUSES = ['pending', 'success', 'failed'] as const

export const TRANSACTION_TYPES = ['direct_tip', 'fundraiser_donation'] as const

export const PAYMENT_METHODS = ['moncash', 'natcash', 'bank', 'stripe'] as const

export const CURRENCIES = ['HTG', 'USD'] as const

export const EXCHANGE_PURPOSES = ['usd_buying', 'usd_selling'] as const

export const BANK_NAMES = ['unibank', 'sogebank', 'capital_bank', 'buh'] as const

export type PaymentRequestStatus = (typeof PAYMENT_REQUEST_STATUSES)[number]
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]
export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export type Currency = (typeof CURRENCIES)[number]
export type ExchangePurpose = (typeof EXCHANGE_PURPOSES)[number]
export type BankName = (typeof BANK_NAMES)[number]

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_process: 'In process',
  approved: 'Approved',
  rejected: 'Rejected',
  success: 'Success',
  failed: 'Failed',
}

export const METHOD_LABELS: Record<string, string> = {
  moncash: 'MonCash',
  natcash: 'NatCash',
  bank: 'Bank',
  stripe: 'Stripe',
}

export const PURPOSE_LABELS: Record<ExchangePurpose, string> = {
  usd_buying: 'USD buying (HTG per USD)',
  usd_selling: 'USD selling (HTG per USD)',
}
