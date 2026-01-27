'use client'

import { Shell } from '@/components/layout'
import { ToastProvider } from '@/components/shared/Toast'
import { UserProvider, useCurrentUser } from '@/lib/hooks/useCurrentUser'

/**
 * 受保护路由客户端布局
 * 
 * 包含：
 * - ToastProvider（全局 Toast 通知）
 * - UserProvider（用户状态管理）
 * - Shell（全局布局）
 */
export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <UserProvider>
        <ShellWithUser>{children}</ShellWithUser>
      </UserProvider>
    </ToastProvider>
  )
}

/**
 * Shell 包装组件，使用 useCurrentUser hook
 */
function ShellWithUser({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCurrentUser()

  return (
    <Shell currentUser={user} isLoading={isLoading}>
      {children}
    </Shell>
  )
}
