'use client'

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; orgName: string }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Guard: never dispatch a router action before the client has mounted.
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const navigate = useCallback((href: string) => {
    if (!mountedRef.current) return
    startTransition(() => { router.push(href) })
  }, [router])

  const refresh = useCallback(async () => {
    try {
      const me = await apiGet<User>('/auth/me')
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await apiPost<User>('/auth/login', { email, password })
      setUser(u)
      navigate('/dashboard')
    },
    [navigate],
  )

  const register = useCallback(
    async (data: { name: string; email: string; password: string; orgName: string }) => {
      const u = await apiPost<User>('/auth/register', data)
      setUser(u)
      navigate('/dashboard')
    },
    [navigate],
  )

  const logout = useCallback(async () => {
    await apiPost('/auth/logout')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
