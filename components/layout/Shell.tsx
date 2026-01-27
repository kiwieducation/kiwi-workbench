'use client'

import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { User } from '@/types/entities'

interface ShellProps {
  children: React.ReactNode
  currentUser: User | null
  isLoading?: boolean
}

/**
 * 全局 Shell 布局
 * 
 * 包含：
 * - 侧边栏（Sidebar）
 * - 顶部栏（Topbar）
 * - 主内容区
 * 
 * 布局结构：
 * ┌─────────────────────────────────────────┐
 * │ Topbar (h-16, fixed)                    │
 * ├───────────┬─────────────────────────────┤
 * │ Sidebar   │ Main Content               │
 * │ (w-64)    │ (ml-64, mt-16)             │
 * │ (fixed)   │                            │
 * │           │                            │
 * └───────────┴─────────────────────────────┘
 */
export function Shell({ children, currentUser, isLoading }: ShellProps) {
  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500 text-sm">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 侧边栏 */}
      <Sidebar currentUser={currentUser} />
      
      {/* 顶部栏 */}
      <Topbar currentUser={currentUser} />
      
      {/* 主内容区 */}
      <main className="ml-64 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  )
}
