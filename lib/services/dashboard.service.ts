/**
 * Dashboard 数据服务层
 *
 * 从 Supabase 获取首页数据（KPI、待办、近期动态）
 * 使用 server-side client（基于 cookie/session）
 */

import { createClient } from '@/lib/supabase/server'
import type { KPIMetric, TodoItem, ScheduleEvent, TaskPriority, TaskStatus } from '@/types/entities'

// ============================================
// 类型定义
// ============================================

export interface RecentActivity {
  id: string
  type: 'task' | 'customer_activity'
  title: string
  created_at: string
}

export interface DashboardUser {
  id: string
  name: string
  email: string
}

// ============================================
// 服务函数
// ============================================

/**
 * 获取当前登录用户信息（用于 Dashboard 问候语）
 */
export async function getCurrentUserForDashboard(): Promise<DashboardUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // 尝试从 users 表获取用户名（静默降级，不打印错误）
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', user.id)
      .single()

    if (userData?.name) {
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email || user.email || '',
      }
    }

    // 降级：使用 auth 中的 email 提取用户名
    return {
      id: user.id,
      name: user.email?.split('@')[0] || '同事',
      email: user.email || '',
    }
  } catch {
    return null
  }
}

/**
 * 获取 Dashboard KPI 指标
 *
 * 口径：
 * 1. 待处理任务：当前用户 tasks 表 count (assignee_id = user.id AND status IN pending, in_progress)
 * 2. 跟进中客户：customers 表 count（受 RLS 约束，已限制当前用户可见范围）
 * 3. 逾期任务：当前用户 tasks 表 count (assignee_id = user.id AND due_date < now AND status IN pending, in_progress)
 * 4. 新消息：本阶段不接入，显示"—"
 */
export async function getDashboardKPIs(): Promise<KPIMetric[]> {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // 未登录，返回默认值
      return [
        { label: '待处理任务', value: 0 },
        { label: '跟进中客户', value: 0 },
        { label: '逾期任务', value: 0 },
        { label: '新消息', value: '—', trend: 'neutral' },
      ]
    }

    // 1. 待处理任务数（当前用户）
    const { count: pendingTasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assignee_id', user.id)
      .in('status', ['pending', 'in_progress'])

    // 2. 客户数量（受 RLS 约束，已限制当前用户可见范围）
    const { count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    // 3. 逾期任务数（当前用户）
    const now = new Date().toISOString()
    const { count: overdueTasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assignee_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .lt('due_date', now)

    return [
      { label: '待处理任务', value: pendingTasksCount ?? 0 },
      { label: '跟进中客户', value: customersCount ?? 0 },
      { label: '逾期任务', value: overdueTasksCount ?? 0 },
      { label: '新消息', value: '—', trend: 'neutral' }, // 本阶段不接入
    ]
  } catch (error) {
    console.error('Failed to fetch dashboard KPIs:', error)
    // 降级：返回默认值
    return [
      { label: '待处理任务', value: 0 },
      { label: '跟进中客户', value: 0 },
      { label: '逾期任务', value: 0 },
      { label: '新消息', value: '—', trend: 'neutral' },
    ]
  }
}

/**
 * 获取待办事项列表
 *
 * 从 tasks 表查询当前用户的未完成任务（assignee_id = user.id）
 * 字段映射按 tasks 表实际结构，缺失字段使用默认值
 */
export async function getTodoItems(filter?: 'all' | 'today' | 'overdue'): Promise<TodoItem[]> {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // 未登录，返回空数组
      return []
    }

    let query = supabase
      .from('tasks')
      .select('id, title, priority, due_date, related_type, related_id, status, created_at')
      .eq('assignee_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(10)

    // 根据 filter 添加条件
    if (filter === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      query = query
        .gte('due_date', todayStart.toISOString())
        .lte('due_date', todayEnd.toISOString())
    } else if (filter === 'overdue') {
      const now = new Date().toISOString()
      query = query.lt('due_date', now)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch todo items:', error)
      return []
    }

    // 映射到 TodoItem 类型，缺失字段使用默认值
    return (data || []).map((task) => ({
      id: task.id,
      title: task.title,
      type: 'task' as const, // tasks 表无 type 字段，默认为 'task'
      source: 'system' as const, // tasks 表无 source 字段，默认为 'system'
      priority: (task.priority || 'medium') as TaskPriority,
      due_date: task.due_date,
      related_type: task.related_type,
      related_id: task.related_id,
      status: task.status as TaskStatus,
      created_at: task.created_at,
    }))
  } catch (error) {
    console.error('Failed to fetch todo items:', error)
    return []
  }
}

/**
 * 获取近期动态（替代日程）
 *
 * 合并近 7 天的 tasks（当前用户）和 customer_activities（受 RLS 限制）
 * 按创建时间倒序，最多返回 5 条
 */
export async function getRecentActivities(): Promise<RecentActivity[]> {
  try {
    const supabase = await createClient()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()

    let taskItems: RecentActivity[] = []

    // 仅当有用户时才查询 tasks（按 assignee_id 过滤）
    if (user) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, created_at')
        .eq('assignee_id', user.id)
        .gte('created_at', sevenDaysAgoISO)
        .order('created_at', { ascending: false })
        .limit(5)

      taskItems = (tasks || []).map((t) => ({
        id: `task-${t.id}`,
        type: 'task' as const,
        title: `任务：${t.title}`,
        created_at: t.created_at,
      }))
    }

    // 获取近 7 天的 customer_activities（受 RLS 限制）
    const { data: activities } = await supabase
      .from('customer_activities')
      .select('id, content, created_at')
      .gte('created_at', sevenDaysAgoISO)
      .order('created_at', { ascending: false })
      .limit(5)

    const activityItems: RecentActivity[] = (activities || []).map((a) => ({
      id: `activity-${a.id}`,
      type: 'customer_activity' as const,
      title: `客户跟进：${a.content || '(无内容)'}`,
      created_at: a.created_at,
    }))

    // 合并、排序、截取
    const combined = [...taskItems, ...activityItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    return combined
  } catch (error) {
    console.error('Failed to fetch recent activities:', error)
    return []
  }
}

/**
 * 获取日程事件（本阶段返回空，保留占位）
 */
export async function getUpcomingEvents(): Promise<ScheduleEvent[]> {
  // 本阶段不实现日程数据，返回空数组
  // 未来接入企业微信 Calendar
  return []
}

/**
 * 获取在线用户数（本阶段返回固定值）
 */
export async function getOnlineUsersCount(): Promise<number> {
  // TODO: 未来从 Supabase Realtime / Presence 获取
  return 42
}
