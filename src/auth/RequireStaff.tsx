import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { Spinner } from '@/components/ui/Spinner'

export function RequireStaff() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'bootstrapping' || status === 'checking_admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking admin access…" />
      </div>
    )
  }

  if (status === 'signed_out') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (status === 'access_denied') {
    return <Navigate to="/access-denied" replace />
  }

  if (status === 'error') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
