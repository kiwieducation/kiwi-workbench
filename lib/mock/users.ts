import type { User } from '@/types/entities'

/**
 * Mock 用户数据
 * 
 * 注意：这是开发阶段的 mock 数据
 * 生产环境将从 Supabase 获取，并通过 RLS 策略控制访问
 */

export const mockCurrentUser: User = {
  id: 'user-001',
  email: 'alex.chen@kiwiedu.com',
  name: 'Alex Chen',
  avatar_url: 'https://picsum.photos/id/64/200/200',
  role: 'sales',
  department: '销售部',
  team_id: 'team-sales-01',
  created_at: '2024-01-15T08:00:00Z',
  updated_at: '2024-12-01T10:00:00Z',
}

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 'user-002',
    email: 'sarah.wu@kiwiedu.com',
    name: 'Sarah Wu',
    avatar_url: 'https://picsum.photos/id/65/200/200',
    role: 'team_leader',
    department: '销售部',
    team_id: 'team-sales-01',
    created_at: '2023-06-01T08:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
  },
  {
    id: 'user-003',
    email: 'mike.ross@kiwiedu.com',
    name: 'Mike Ross',
    avatar_url: 'https://picsum.photos/id/66/200/200',
    role: 'tutor',
    department: '导师部',
    team_id: 'team-tutor-01',
    created_at: '2023-08-01T08:00:00Z',
    updated_at: '2024-10-20T10:00:00Z',
  },
  {
    id: 'user-004',
    email: 'jenny.zhao@kiwiedu.com',
    name: 'Jenny Zhao',
    avatar_url: 'https://picsum.photos/id/67/200/200',
    role: 'manager',
    department: '管理层',
    team_id: null,
    created_at: '2022-01-01T08:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
  },
  {
    id: 'user-005',
    email: 'admin@kiwiedu.com',
    name: 'Admin',
    avatar_url: null,
    role: 'admin',
    department: '管理层',
    team_id: null,
    created_at: '2022-01-01T08:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
]

/**
 * 根据角色获取用户可访问的导航菜单
 * 对齐 PRD 6.1 统一权限矩阵
 */
export function getUserMenuByRole(role: User['role']) {
  const baseMenu = [
    { key: 'dashboard', label: '首页', href: '/' },
    { key: 'messages', label: '会话中心', href: '/messages' },
    { key: 'knowledge', label: '知识库', href: '/knowledge' },
    { key: 'projects', label: '项目协作', href: '/projects' },
    { key: 'materials', label: '素材中台', href: '/materials' },
    { key: 'contacts', label: '通讯录', href: '/contacts' },
  ]

  const roleSpecificMenu: Record<string, { key: string; label: string; href: string }[]> = {
    sales: [{ key: 'sales', label: '销售工作台', href: '/sales' }],
    bd: [{ key: 'bd', label: 'BD工作台', href: '/bd' }],
    marketing: [{ key: 'marketing', label: '市场工作台', href: '/marketing' }],
    tutor: [{ key: 'tutor', label: '导师工作台', href: '/tutor' }],
    academic: [{ key: 'academic', label: '教务工作台', href: '/academic' }],
    finance: [{ key: 'finance', label: '财务工作台', href: '/finance' }],
    team_leader: [
      { key: 'sales', label: '销售工作台', href: '/sales' },
    ],
    manager: [
      { key: 'sales', label: '销售工作台', href: '/sales' },
      { key: 'tutor', label: '导师工作台', href: '/tutor' },
      { key: 'quality', label: '质检中心', href: '/quality' },
    ],
    admin: [
      { key: 'sales', label: '销售工作台', href: '/sales' },
      { key: 'bd', label: 'BD工作台', href: '/bd' },
      { key: 'marketing', label: '市场工作台', href: '/marketing' },
      { key: 'tutor', label: '导师工作台', href: '/tutor' },
      { key: 'academic', label: '教务工作台', href: '/academic' },
      { key: 'finance', label: '财务工作台', href: '/finance' },
      { key: 'quality', label: '质检中心', href: '/quality' },
      { key: 'settings', label: '系统设置', href: '/settings' },
    ],
  }

  return [...baseMenu, ...(roleSpecificMenu[role] || [])]
}
