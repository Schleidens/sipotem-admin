import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'

export function RequireSuperuser() {
  const { adminUser } = useAuth()

  if (!adminUser?.is_superuser) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
