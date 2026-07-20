import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchAdminMe } from '@/api/adminMe'
import { AdminApiError, setAdminTokenGetter, setOnUnauthorized } from '@/api/adminClient'
import { getFirebaseAuth } from '@/auth/firebase'
import type { AdminMe } from '@/types/admin'

export type AuthStatus =
  | 'bootstrapping'
  | 'signed_out'
  | 'checking_admin'
  | 'ready'
  | 'access_denied'
  | 'error'

type AuthContextValue = {
  status: AuthStatus
  firebaseUser: User | null
  adminUser: AdminMe | null
  errorMessage: string | null
  getAccessToken: () => Promise<string | null>
  /** Force-refresh Firebase ID token before sensitive mutations. */
  refreshAccessToken: () => Promise<string | null>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  completeAdminGate: () => Promise<void>
  logout: () => Promise<void>
  clearAccessDenied: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminMe | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getAccessToken = useCallback(async () => {
    const user = getFirebaseAuth().currentUser
    if (!user) return null
    return user.getIdToken()
  }, [])

  const refreshAccessToken = useCallback(async () => {
    const user = getFirebaseAuth().currentUser
    if (!user) return null
    return user.getIdToken(true)
  }, [])

  const clearAdmin = useCallback(() => {
    setAdminUser(null)
  }, [])

  const logout = useCallback(async () => {
    clearAdmin()
    setErrorMessage(null)
    await firebaseSignOut(getFirebaseAuth())
    setStatus('signed_out')
  }, [clearAdmin])

  const completeAdminGate = useCallback(async () => {
    const user = getFirebaseAuth().currentUser
    if (!user) {
      setStatus('signed_out')
      clearAdmin()
      return
    }
    setStatus('checking_admin')
    setErrorMessage(null)
    try {
      await user.getIdToken(true)
      const me = await fetchAdminMe()
      setAdminUser(me)
      setStatus('ready')
    } catch (err) {
      clearAdmin()
      if (err instanceof AdminApiError && err.status === 403) {
        setStatus('access_denied')
        setErrorMessage(err.message)
        return
      }
      if (err instanceof AdminApiError && err.status === 401) {
        setStatus('signed_out')
        setErrorMessage(err.message)
        await firebaseSignOut(getFirebaseAuth())
        return
      }
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to verify admin access.')
    }
  }, [clearAdmin])

  useEffect(() => {
    setAdminTokenGetter(getAccessToken)
    setOnUnauthorized(() => {
      void logout()
    })
  }, [getAccessToken, logout])

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      if (!user) {
        clearAdmin()
        setStatus('signed_out')
        return
      }
      void completeAdminGate()
    })
    return () => unsub()
  }, [clearAdmin, completeAdminGate])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setErrorMessage(null)
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setErrorMessage(null)
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(getFirebaseAuth(), provider)
  }, [])

  const clearAccessDenied = useCallback(() => {
    setErrorMessage(null)
    void logout()
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      firebaseUser,
      adminUser,
      errorMessage,
      getAccessToken,
      refreshAccessToken,
      signInWithEmail,
      signInWithGoogle,
      completeAdminGate,
      logout,
      clearAccessDenied,
    }),
    [
      status,
      firebaseUser,
      adminUser,
      errorMessage,
      getAccessToken,
      refreshAccessToken,
      signInWithEmail,
      signInWithGoogle,
      completeAdminGate,
      logout,
      clearAccessDenied,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
