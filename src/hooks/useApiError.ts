import { useCallback } from 'react'
import { AdminApiError } from '@/api/adminClient'
import { useToast } from '@/components/ui/Toast'

export function useApiError() {
  const toast = useToast()

  return useCallback(
    (err: unknown, fallback = 'Something went wrong') => {
      if (err instanceof AdminApiError) {
        if (err.status === 429) {
          toast.error(err.message || 'Too many requests. Try again shortly.')
          return err.fieldErrors()
        }
        if (err.status === 403) {
          toast.error(err.message || 'Permission denied.')
          return err.fieldErrors()
        }
        toast.error(err.message || fallback)
        return err.fieldErrors()
      }
      toast.error(err instanceof Error ? err.message : fallback)
      return {} as Record<string, string>
    },
    [toast],
  )
}
