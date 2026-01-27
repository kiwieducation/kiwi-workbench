'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser } from '@/lib/services/user.service'
import { useToast } from '@/components/shared/Toast'
import type { User } from '@/types/entities'

// ============================================
// Context 类型
// ============================================

interface UserContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

// ============================================
// Hook
// ============================================

export function useCurrentUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useCurrentUser must be used within a UserProvider')
  }
  return context
}

// ============================================
// Provider
// ============================================

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  const fetchUser = async () => {
    setIsLoading(true)
    try {
      const result = await getCurrentUser()
      if (result.success) {
        setUser(result.data)
      } else {
        // 非开发模式下显示错误
        if (process.env.NODE_ENV !== 'development') {
          toast.error('获取用户信息失败', result.error.message)
        }
        setUser(null)
      }
    } catch (error) {
      console.error('fetchUser error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const refresh = async () => {
    await fetchUser()
  }

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      refresh,
    }}>
      {children}
    </UserContext.Provider>
  )
}
