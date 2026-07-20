import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { MultiFactorError } from 'firebase/auth'
import { useAuth } from '@/auth/AuthProvider'
import { isMfaRequiredError, resolveTotpSignIn } from '@/auth/mfa'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { safeInternalPath } from '@/lib/safePath'

export function LoginPage() {
  const { status, signInWithEmail, signInWithGoogle, errorMessage } = useAuth()
  const location = useLocation()
  const from = safeInternalPath(
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname,
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState<MultiFactorError | null>(null)
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const displayError = useMemo(
    () => localError || errorMessage,
    [localError, errorMessage],
  )

  if (status === 'ready') {
    return <Navigate to={from} replace />
  }

  if (status === 'access_denied') {
    return <Navigate to="/access-denied" replace />
  }

  if (status === 'bootstrapping' || status === 'checking_admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner label="Loading…" />
      </div>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)
    setBusy(true)
    try {
      if (mfaError) {
        await resolveTotpSignIn(mfaError, mfaCode)
        setMfaError(null)
        setMfaCode('')
        return
      }
      await signInWithEmail(email, password)
    } catch (err) {
      if (isMfaRequiredError(err)) {
        setMfaError(err)
        setLocalError('Enter your authenticator code to continue.')
      } else {
        setLocalError(err instanceof Error ? err.message : 'Sign-in failed')
      }
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle() {
    setLocalError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      if (isMfaRequiredError(err)) {
        setMfaError(err)
        setLocalError('Enter your authenticator code to continue.')
      } else {
        setLocalError(err instanceof Error ? err.message : 'Google sign-in failed')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4" style={{ backgroundColor: 'var(--admin-sidebar-bg, #1e2430)' }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 40%, #db6815 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 80% 70%, #2a3140 0%, transparent 50%)',
        }}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface p-8 shadow-[var(--shadow-elevated)]">
        <div className="mb-6 flex items-center gap-3">
          <img
            src="/sipotem-app-icon.png"
            alt="SipòteM"
            className="size-11 shrink-0 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-xl font-semibold text-text">SipòteM</h1>
            <p className="text-sm text-text-muted">Admin console</p>
          </div>
        </div>
        <p className="text-sm text-text-muted">
          Staff sign-in. Access is gated by the admin API and Firebase session.
        </p>

        <form className="mt-6 space-y-3" onSubmit={(e) => void onSubmit(e)}>
          {!mfaError ? (
            <>
              <Input
                label="Email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <Input
              label="Authenticator code (MFA)"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
            />
          )}

          {displayError ? <p className="text-sm text-danger">{displayError}</p> : null}

          <Button type="submit" variant="dark" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : mfaError ? 'Verify MFA' : 'Sign in'}
          </Button>
        </form>

        {!mfaError ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full"
            disabled={busy}
            onClick={() => void onGoogle()}
          >
            Continue with Google
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="mt-3 w-full"
            onClick={() => {
              setMfaError(null)
              setMfaCode('')
              setLocalError(null)
            }}
          >
            Back
          </Button>
        )}
      </div>
    </div>
  )
}
