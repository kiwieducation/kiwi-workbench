'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  Search,
  Bell,
  Globe,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/types/entities'
import { roleDisplayNames } from '@/lib/services/user.service'

interface TopbarProps {
  currentUser: User | null
}

export function Topbar({ currentUser }: TopbarProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [language, setLanguage] = useState<'cn' | 'en'>('cn')

  // 创建浏览器端 Supabase 客户端
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 登出处理
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // 获取用户名首字母
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // 切换语言
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'cn' ? 'en' : 'cn'))
    // TODO: 实际的语言切换逻辑
  }

  // 默认显示名称
  const displayName = currentUser?.name || 'Guest'
  const displayRole = currentUser?.role ? roleDisplayNames[currentUser.role] : '访客'
  const displayEmail = currentUser?.email || ''

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      {/* 左侧：搜索 */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="搜索资源..."
            className="w-80 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* 右侧：操作区 */}
      <div className="flex items-center gap-3">
        {/* 语言切换 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="text-slate-500"
        >
          <Globe size={20} />
        </Button>

        {/* 通知 */}
        <Button variant="ghost" size="icon" className="text-slate-500 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* 分隔线 */}
        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        {/* 用户菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              {currentUser?.avatar_url && (
                <AvatarImage src={currentUser.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">
                {displayRole}
              </p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <>
              {/* 点击外部关闭 */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-20">
                {/* 用户信息 */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500">{displayEmail}</p>
                  <Badge variant="secondary" className="mt-2">
                    {displayRole}
                  </Badge>
                </div>

                {/* 菜单项 */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      // TODO: 跳转到个人设置
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon size={16} />
                    个人资料
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/settings')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={16} />
                    系统设置
                  </button>
                </div>

                {/* 登出 */}
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    退出登录
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
