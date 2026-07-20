import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export function AccessDeniedPage() {
  const { errorMessage, firebaseUser, logout, status } = useAuth()
  const signedOut = useRef(false)

  useEffect(() => {
    if (signedOut.current) return
    if (status === 'access_denied' || status === 'ready' || firebaseUser) {
      signedOut.current = true
      void logout()
    }
  }, [status, firebaseUser, logout])

  const cleared = status === 'signed_out'

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-danger">
          <ShieldOff className="size-7" />
        </div>
        <h1 className="text-xl font-semibold text-text">Access Denied</h1>
        <p className="mt-2 text-sm text-text-muted">
          This account is not allowed to use the SipòteM admin API. Common causes: not staff,
          missing Firebase admin claim, MFA required, or origin not allowlisted.
        </p>
        {!cleared && firebaseUser?.email ? (
          <p className="mt-3 text-sm text-text-muted">
            Clearing session for <strong className="text-text">{firebaseUser.email}</strong>…
          </p>
        ) : (
          <p className="mt-3 text-sm text-text-muted">Your session has been cleared for security.</p>
        )}
        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {errorMessage}
          </p>
        ) : null}
        {cleared ? (
          <Link to="/login">
            <Button type="button" variant="dark" className="mt-6">
              Back to sign in
            </Button>
          </Link>
        ) : (
          <div className="mt-6 flex justify-center">
            <Spinner label="Signing out…" />
          </div>
        )}
      </div>
    </div>
  )
}
