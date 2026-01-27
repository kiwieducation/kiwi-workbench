'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  FolderKanban,
  Library,
  Contact,
  TrendingUp,
  Users,
  Megaphone,
  GraduationCap,
  School,
  Wallet,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { User } from '@/types/entities'

/**
 * 侧边栏导航配置
 * 对齐 v8.0 PRD 模块分类
 */
interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles?: User['role'][]  // 可访问的角色，undefined 表示全员可见
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    label: '公司级能力',
    items: [
      { title: '个人首页', href: '/', icon: LayoutDashboard },
      { title: '会话中心', href: '/messages', icon: MessageSquare },
      { title: '知识库', href: '/knowledge', icon: BookOpen },
      { title: '项目协作', href: '/projects', icon: FolderKanban },
      { title: '素材中台', href: '/materials', icon: Library },
      { title: '通讯录', href: '/contacts', icon: Contact },
    ],
  },
  {
    label: '部门工作台',
    items: [
      { title: '销售工作台', href: '/sales', icon: TrendingUp, roles: ['sales', 'team_leader', 'manager', 'admin'] },
      { title: 'BD工作台', href: '/bd', icon: Users, roles: ['bd', 'manager', 'admin'] },
      { title: '市场工作台', href: '/marketing', icon: Megaphone, roles: ['marketing', 'manager', 'admin'] },
      { title: '导师工作台', href: '/tutor', icon: GraduationCap, roles: ['tutor', 'team_leader', 'manager', 'admin'] },
      { title: '教务工作台', href: '/academic', icon: School, roles: ['academic', 'manager', 'admin'] },
      { title: '财务工作台', href: '/finance', icon: Wallet, roles: ['finance', 'manager', 'admin'] },
    ],
  },
  {
    label: '管理监控',
    items: [
      { title: '质检中心', href: '/quality', icon: ShieldCheck, roles: ['manager', 'admin'] },
    ],
  },
  {
    label: '系统',
    items: [
      { title: '系统设置', href: '/settings', icon: Settings, roles: ['admin'] },
    ],
  },
]

interface SidebarProps {
  currentUser: User | null
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname()

  // 根据用户角色过滤可见的导航项
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      if (!item.roles) return true // 无角色限制，全员可见
      if (!currentUser) return false // 无用户时隐藏需要角色的项
      return item.roles.includes(currentUser.role)
    })
  }

  // 检查路径是否激活
  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            柯维留学
          </span>
        </Link>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navigation.map((group) => {
          const visibleItems = filterNavItems(group.items)
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label}>
              <h4 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.label}
              </h4>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon size={18} />
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* 底部版本信息 */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-xs text-slate-500 text-center font-medium">
            v1.0.0 Enterprise
          </p>
        </div>
      </div>
    </aside>
  )
}
