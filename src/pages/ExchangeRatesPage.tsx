import { useCallback, useEffect, useState } from 'react'
import { listExchangeRates, updateExchangeRate } from '@/api/adminRates'
import { PURPOSE_LABELS, type ExchangePurpose } from '@/constants/enums'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useApiError } from '@/hooks/useApiError'
import { formatDate } from '@/lib/utils'
import type { ExchangeRate } from '@/types/admin'

export function ExchangeRatesPage() {
  const toast = useToast()
  const onError = useApiError()
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listExchangeRates()
      setRates(data)
      const next: Record<string, string> = {}
      for (const r of data) next[r.purpose] = r.htg_per_usd
      setDrafts(next)
    } catch (err) {
      onError(err)
    } finally {
      setLoading(false)
    }
  }, [onError])

  useEffect(() => {
    void load()
  }, [load])

  async function save(purpose: ExchangePurpose) {
    setBusy(purpose)
    try {
      await updateExchangeRate(purpose, drafts[purpose])
      toast.success('Rate updated')
      await load()
    } catch (err) {
      onError(err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <PageHeader title="Exchange rates" description="HTG per USD for buying and selling." />

      {loading ? <Spinner /> : null}
      {!loading && rates.length === 0 ? <EmptyState title="No rates configured" /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {rates.map((rate) => (
          <div key={rate.purpose} className="rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-4">
            <h2 className="font-semibold">
              {PURPOSE_LABELS[rate.purpose as ExchangePurpose] || rate.purpose}
            </h2>
            <p className="mt-1 text-xs text-text-muted">Updated {formatDate(rate.updated_at)}</p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <Input
                label="htg_per_usd"
                value={drafts[rate.purpose] ?? ''}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [rate.purpose]: e.target.value }))
                }
              />
              <Button
                type="button"
                disabled={busy === rate.purpose}
                onClick={() => void save(rate.purpose as ExchangePurpose)}
              >
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
