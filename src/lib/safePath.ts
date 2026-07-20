/** Allow only same-origin relative paths used by this admin app. */
const ALLOWED_PREFIXES = [
  '/users',
  '/verification',
  '/payouts',
  '/transactions',
  '/fundraisers',
  '/catalog',
  '/exchange-rates',
  '/notifications',
  '/stats',
  '/audit',
]

export function safeInternalPath(pathname: unknown, fallback = '/'): string {
  if (typeof pathname !== 'string' || !pathname) return fallback
  if (!pathname.startsWith('/')) return fallback
  if (pathname.startsWith('//')) return fallback
  if (pathname.includes('\\') || pathname.includes('://')) return fallback
  if (pathname === '/login' || pathname === '/access-denied') return fallback
  if (pathname === '/') return '/'

  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  return allowed ? pathname : fallback
}
