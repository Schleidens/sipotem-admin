import type { ApiErrorBody, ListParams, PaginatedResponse } from '@/types/admin'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

let tokenGetter: (() => Promise<string | null>) | null = null
let onUnauthorized: (() => void) | null = null

export function setAdminTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn
}

export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn
}

export class AdminApiError extends Error {
  status: number
  errorCode?: string
  detail?: string | Record<string, unknown>
  body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody) {
    const message =
      (typeof body.message === 'string' && body.message) ||
      (typeof body.detail === 'string' && body.detail) ||
      `Request failed (${status})`
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.errorCode = typeof body.error_code === 'string' ? body.error_code : undefined
    this.detail = body.detail
    this.body = body
  }

  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {}
    const detail = this.detail
    if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
      for (const [key, value] of Object.entries(detail)) {
        if (typeof value === 'string') {
          out[key] = value
        } else if (Array.isArray(value) && value.length > 0) {
          const first = value[0]
          if (typeof first === 'string') out[key] = first
          else if (first && typeof first === 'object' && 'message' in first) {
            out[key] = String((first as { message: unknown }).message)
          }
        } else if (value && typeof value === 'object' && 'message' in value) {
          out[key] = String((value as { message: unknown }).message)
        }
      }
    }
    for (const [key, value] of Object.entries(this.body)) {
      if (['error_code', 'message', 'detail'].includes(key)) continue
      if (typeof value === 'string') out[key] = value
      else if (Array.isArray(value) && typeof value[0] === 'string') out[key] = value[0]
    }
    return out
  }
}

function buildQuery(params?: ListParams): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    sp.set(key, String(value))
  }
  const q = sp.toString()
  return q ? `?${q}` : ''
}

async function parseBody(res: Response): Promise<ApiErrorBody | unknown> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

export type AdminRequestOptions = {
  method?: string
  body?: unknown
  params?: ListParams
  signal?: AbortSignal
}

export async function adminRequest<T>(path: string, options: AdminRequestOptions = {}): Promise<T> {
  if (!API_BASE) {
    throw new AdminApiError(0, { message: 'VITE_API_BASE_URL is not configured.' })
  }

  const token = tokenGetter ? await tokenGetter() : null
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = `${API_BASE}/api/admin${path.startsWith('/') ? path : `/${path}`}${buildQuery(options.params)}`

  const res = await fetch(url, {
    method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const parsed = await parseBody(res)

  if (!res.ok) {
    const body = (parsed && typeof parsed === 'object' ? parsed : { message: String(parsed) }) as ApiErrorBody
    if (res.status === 401) {
      onUnauthorized?.()
    }
    throw new AdminApiError(res.status, body)
  }

  return parsed as T
}

export async function adminGet<T>(path: string, params?: ListParams, signal?: AbortSignal) {
  return adminRequest<T>(path, { method: 'GET', params, signal })
}

export async function adminPost<T>(path: string, body?: unknown, params?: ListParams) {
  return adminRequest<T>(path, { method: 'POST', body, params })
}

export async function adminPatch<T>(path: string, body?: unknown, params?: ListParams) {
  return adminRequest<T>(path, { method: 'PATCH', body, params })
}

export async function adminPut<T>(path: string, body?: unknown, params?: ListParams) {
  return adminRequest<T>(path, { method: 'PUT', body, params })
}

export async function adminGetPaginated<T>(path: string, params?: ListParams, signal?: AbortSignal) {
  return adminGet<PaginatedResponse<T>>(path, params, signal)
}

export function getApiBaseUrl() {
  return API_BASE
}
