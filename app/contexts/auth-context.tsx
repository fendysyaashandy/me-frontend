// app/contexts/auth-context.tsx
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '~/lib/api'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (credentials: { identifier: string; password: string }) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken')
    const expiry = localStorage.getItem('tokenExpiry')
    
    if (token && expiry && new Date(expiry) > new Date()) {
      setIsAuthenticated(true)
      // You might want to fetch user data here
    }
    
    setLoading(false)
  }, [])

  const login = async (credentials: { identifier: string; password: string }) => {
    const result = await authApi.login(credentials)
    localStorage.setItem('accessToken', result.accessToken)
    localStorage.setItem('tokenExpiry', result.accessTokenExpiresAt)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tokenExpiry')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}