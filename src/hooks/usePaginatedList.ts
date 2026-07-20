import { useCallback, useEffect, useState } from 'react'
import type { ListParams, PaginatedResponse } from '@/types/admin'
import { useApiError } from '@/hooks/useApiError'

export function usePaginatedList<T>(
  fetcher: (params: ListParams, signal?: AbortSignal) => Promise<PaginatedResponse<T>>,
  filters: ListParams,
  pageSize = 20,
) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const onError = useApiError()

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    setPage(1)
  }, [filterKey])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const parsed = JSON.parse(filterKey) as ListParams
        const res = await fetcher(
          { ...parsed, page, page_size: pageSize },
          controller.signal,
        )
        if (!cancelled) setData(res)
      } catch (err) {
        if (cancelled || (err as { name?: string }).name === 'AbortError') return
        onError(err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [fetcher, filterKey, page, pageSize, onError, reloadKey])

  const reload = useCallback(async () => {
    setReloadKey((k) => k + 1)
  }, [])

  return {
    page,
    setPage,
    pageSize,
    data,
    loading,
    error,
    reload,
    results: data?.results ?? [],
    count: data?.count ?? 0,
  }
}
