/**
 * Dashboard 数据服务层
 * 
 * 负责获取首页数据，后续从 Supabase 获取
 * 目前使用 Mock 数据
 */

import type { KPIMetric, TodoItem, ScheduleEvent } from '@/types/entities'

// ============================================
// Mock 数据定义
// ============================================

const mockKPIs: KPIMetric[] = [
  { label: '待处理任务', value: 12, change: 2, trend: 'up' },
  { label: '跟进中客户', value: 45, change: 5, trend: 'up' },
  { label: '逾期任务', value: 3, change: -1, trend: 'down' },
  { label: '新消息', value: 8, trend: 'neutral' },
]

const mockTodos: TodoItem[] = [
  {
    id: 'todo-001',
    title: '审核 Emily Zhang 的 Harvard 申请文书',
    type: 'task',
    source: 'tutor',
    priority: 'high',
    due_date: new Date().toISOString(),
    related_type: 'student',
    related_id: 'student-001',
    status: 'pending',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'todo-002',
    title: '跟进 Mr. Li 家长咨询',
    type: 'follow_up',
    source: 'sales',
    priority: 'medium',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    related_type: 'customer',
    related_id: 'customer-002',
    status: 'pending',
    created_at: '2024-01-20T09:00:00Z',
  },
  {
    id: 'todo-003',
    title: '完成 Q4 业绩报表',
    type: 'task',
    source: 'sales',
    priority: 'medium',
    due_date: new Date(Date.now() + 172800000).toISOString(),
    related_type: null,
    related_id: null,
    status: 'in_progress',
    created_at: '2024-01-19T14:00:00Z',
  },
  {
    id: 'todo-004',
    title: '审批合同变更申请',
    type: 'approval',
    source: 'finance',
    priority: 'high',
    due_date: new Date().toISOString(),
    related_type: 'contract',
    related_id: 'contract-005',
    status: 'pending',
    created_at: '2024-01-20T08:00:00Z',
  },
  {
    id: 'todo-005',
    title: '准备周会汇报材料',
    type: 'task',
    source: 'system',
    priority: 'low',
    due_date: new Date(Date.now() + 259200000).toISOString(),
    related_type: null,
    related_id: null,
    status: 'pending',
    created_at: '2024-01-18T16:00:00Z',
  },
]

const mockEvents: ScheduleEvent[] = [
  { id: 'event-001', title: '内部周会', date: '2024-01-22', time: '10:00 AM - 11:30 AM' },
  { id: 'event-002', title: 'Emily Zhang 文书讨论', date: '2024-01-23', time: '2:00 PM - 3:00 PM' },
]

// ============================================
// 服务函数
// ============================================

export async function getDashboardKPIs(): Promise<KPIMetric[]> {
  // TODO: 从 Supabase 聚合 KPI 数据
  return mockKPIs
}

export async function getTodoItems(filter?: 'all' | 'today' | 'overdue'): Promise<TodoItem[]> {
  // TODO: 从 Supabase 获取待办事项
  if (filter === 'today') {
    const today = new Date().toDateString()
    return mockTodos.filter(t => t.due_date && new Date(t.due_date).toDateString() === today)
  }
  if (filter === 'overdue') {
    const now = new Date()
    return mockTodos.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed')
  }
  return mockTodos
}

export async function getUpcomingEvents(): Promise<ScheduleEvent[]> {
  // TODO: 从 Supabase 获取日程
  return mockEvents
}

export async function getOnlineUsersCount(): Promise<number> {
  // TODO: 从 Supabase Realtime 获取在线用户数
  return 42
}
