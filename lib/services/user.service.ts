/**
 * 用户服务层
 * 
 * 负责用户身份、认证、权限相关数据
 * 所有 Supabase 查询集中在此
 */

import { createClient } from '@/lib/supabase/client'
import { createServiceError, success, failure, type ServiceResult } from '@/components/shared/Toast'
import type { User } from '@/types/entities'

// ============================================
// Mock 数据（Supabase 查询失败时的 fallback）
// ============================================

const mockUser: User = {
  id: 'mock-user-001',
  email: 'demo@kiwiedu.com',
  name: 'Demo User',
  avatar_url: null,
  role: 'sales',
  department: 'Sales',
  team_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// ============================================
// 服务函数
// ============================================

/**
 * 获取当前登录用户
 * 
 * 优先从 Supabase 获取，失败时返回 Mock 数据（开发模式）
 */
export async function getCurrentUser(): Promise<ServiceResult<User>> {
  const supabase = createClient()
  
  try {
    // 1. 获取认证用户
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.warn('Auth error, using mock user:', authError.message)
      // 开发模式下返回 mock 用户
      if (process.env.NODE_ENV === 'development') {
        return success(mockUser)
      }
      return failure(createServiceError(authError, '获取用户认证信息失败'))
    }
    
    if (!authUser) {
      // 未登录，开发模式下返回 mock
      if (process.env.NODE_ENV === 'development') {
        return success(mockUser)
      }
      return failure({ code: 'NOT_AUTHENTICATED', message: '用户未登录' })
    }
    
    // 2. 获取用户详情（从 users 表）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (userError) {
      console.warn('User profile error, using auth data:', userError.message)
      // 如果 users 表没有记录，使用认证信息构建基本用户
      return success({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        avatar_url: authUser.user_metadata?.avatar_url || null,
        role: 'sales', // 默认角色
        department: null,
        team_id: null,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at || authUser.created_at,
      })
    }
    
    return success(userData as User)
  } catch (error) {
    console.error('getCurrentUser error:', error)
    // 开发模式下返回 mock
    if (process.env.NODE_ENV === 'development') {
      return success(mockUser)
    }
    return failure(createServiceError(error, '获取用户信息失败'))
  }
}

/**
 * 根据 ID 获取用户
 */
export async function getUserById(id: string): Promise<ServiceResult<User>> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return failure(createServiceError(error, '获取用户信息失败'))
    }
    
    return success(data as User)
  } catch (error) {
    return failure(createServiceError(error, '获取用户信息失败'))
  }
}

/**
 * 获取团队成员列表
 */
export async function getTeamMembers(teamId?: string): Promise<ServiceResult<User[]>> {
  const supabase = createClient()
  
  try {
    let query = supabase.from('users').select('*')
    
    if (teamId) {
      query = query.eq('team_id', teamId)
    }
    
    const { data, error } = await query.order('name')
    
    if (error) {
      return failure(createServiceError(error, '获取团队成员失败'))
    }
    
    return success((data || []) as User[])
  } catch (error) {
    return failure(createServiceError(error, '获取团队成员失败'))
  }
}

/**
 * 获取所有销售/顾问（用于下拉选择）
 */
export async function getSalesUsers(): Promise<ServiceResult<User[]>> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['sales', 'team_leader', 'manager'])
      .order('name')
    
    if (error) {
      return failure(createServiceError(error, '获取销售人员列表失败'))
    }
    
    return success((data || []) as User[])
  } catch (error) {
    return failure(createServiceError(error, '获取销售人员列表失败'))
  }
}

// ============================================
// 角色显示名称
// ============================================

export const roleDisplayNames: Record<User['role'], string> = {
  admin: '系统管理员',
  manager: '管理层',
  team_leader: '组长',
  sales: '销售顾问',
  tutor: '导师',
  bd: 'BD经理',
  marketing: '市场专员',
  finance: '财务',
  academic: '教务',
}
