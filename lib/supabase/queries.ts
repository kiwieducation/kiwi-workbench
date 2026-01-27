/**
 * Supabase 数据查询服务
 * 
 * 提供统一的数据库查询接口
 * 注意：目前使用 Mock 数据，实际对接时替换查询逻辑
 */

import { createClient } from '@/lib/supabase/client'
import type { User, Customer, Student, Task, KnowledgeDocument, Project } from '@/types/entities'

// ============================================
// 用户相关查询
// ============================================

/**
 * 获取当前登录用户
 */
export async function getCurrentUserFromDB(): Promise<User | null> {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching current user:', error)
    return null
  }
  
  return data as User
}

/**
 * 根据 ID 获取用户
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data as User
}

// ============================================
// 客户相关查询
// ============================================

interface CustomerQueryOptions {
  page?: number
  pageSize?: number
  stage?: string
  ownerId?: string
}

/**
 * 获取客户列表
 */
export async function getCustomersFromDB(options?: CustomerQueryOptions) {
  const supabase = createClient()
  const { page = 1, pageSize = 20, stage, ownerId } = options || {}
  
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
  
  if (stage && stage !== 'all') {
    query = query.eq('stage', stage)
  }
  
  if (ownerId) {
    query = query.eq('assigned_to', ownerId)
  }
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to).order('updated_at', { ascending: false })
  
  const { data, error, count } = await query
  
  if (error) {
    console.error('Error fetching customers:', error)
    return { data: [], total: 0 }
  }
  
  return { data: (data || []) as Customer[], total: count || 0 }
}

/**
 * 根据 ID 获取客户
 */
export async function getCustomerByIdFromDB(id: string): Promise<Customer | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }
  
  return data as Customer
}

// ============================================
// 学员相关查询
// ============================================

interface StudentQueryOptions {
  page?: number
  pageSize?: number
  status?: string
  tutorId?: string
}

/**
 * 获取学员列表
 */
export async function getStudentsFromDB(options?: StudentQueryOptions) {
  const supabase = createClient()
  const { page = 1, pageSize = 20, status, tutorId } = options || {}
  
  let query = supabase
    .from('students')
    .select('*', { count: 'exact' })
  
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  
  if (tutorId) {
    query = query.eq('tutor_id', tutorId)
  }
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to).order('updated_at', { ascending: false })
  
  const { data, error, count } = await query
  
  if (error) {
    console.error('Error fetching students:', error)
    return { data: [], total: 0 }
  }
  
  return { data: (data || []) as Student[], total: count || 0 }
}

// ============================================
// 任务相关查询
// ============================================

interface TaskQueryOptions {
  assigneeId?: string
  status?: string
  priority?: string
}

/**
 * 获取任务列表
 */
export async function getTasksFromDB(options?: TaskQueryOptions): Promise<Task[]> {
  const supabase = createClient()
  const { assigneeId, status, priority } = options || {}
  
  let query = supabase
    .from('tasks')
    .select('*')
  
  if (assigneeId) {
    query = query.eq('assignee_id', assigneeId)
  }
  
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
  
  query = query.order('due_date', { ascending: true })
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
  
  return (data || []) as Task[]
}

// ============================================
// 知识库相关查询
// ============================================

/**
 * 获取知识库文档
 */
export async function getKnowledgeDocumentsFromDB(folderId?: string): Promise<KnowledgeDocument[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('knowledge_documents')
    .select('*')
  
  if (folderId) {
    query = query.eq('folder_id', folderId)
  }
  
  query = query.order('updated_at', { ascending: false })
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching knowledge documents:', error)
    return []
  }
  
  return (data || []) as KnowledgeDocument[]
}

// ============================================
// 统计查询
// ============================================

/**
 * 获取客户阶段统计
 */
export async function getCustomerStatsFromDB(): Promise<Record<string, number>> {
  const supabase = createClient()
  
  const stages = ['new', 'following', 'proposal', 'signed', 'lost']
  const stats: Record<string, number> = {}
  
  for (const stage of stages) {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('stage', stage)
    
    stats[stage] = count || 0
  }
  
  return stats
}

/**
 * 获取任务状态统计
 */
export async function getTaskStatsFromDB(userId?: string): Promise<Record<string, number>> {
  const supabase = createClient()
  
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled']
  const stats: Record<string, number> = {}
  
  for (const status of statuses) {
    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    
    if (userId) {
      query = query.eq('assignee_id', userId)
    }
    
    const { count } = await query
    stats[status] = count || 0
  }
  
  return stats
}
