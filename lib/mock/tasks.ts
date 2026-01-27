import type { Task, TodoItem, KPIMetric } from '@/types/entities'

/**
 * Mock 任务数据
 * 
 * 注意：生产环境通过 RLS 策略控制访问
 * - 普通导师：只能看自己负责的任务
 * - 组长：可看本部门所有任务
 * - 管理层：可看全公司任务
 */

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Review SOP draft for Harvard Application',
    description: '需要在12月15日前完成 Emily Zhang 的 Harvard 申请文书审核',
    assignee_id: 'user-001',
    related_type: 'student',
    related_id: 'student-001',
    project_id: null,
    due_date: '2025-01-27T17:00:00Z',
    status: 'pending',
    priority: 'high',
    created_at: '2025-01-20T08:00:00Z',
    updated_at: '2025-01-25T10:00:00Z',
  },
  {
    id: 'task-002',
    title: 'Follow up with Mr. Li on service proposal',
    description: '李先生对UK申请项目有兴趣，需要跟进方案',
    assignee_id: 'user-001',
    related_type: 'customer',
    related_id: 'customer-002',
    project_id: null,
    due_date: '2025-01-28T12:00:00Z',
    status: 'in_progress',
    priority: 'medium',
    created_at: '2025-01-22T08:00:00Z',
    updated_at: '2025-01-26T09:00:00Z',
  },
  {
    id: 'task-003',
    title: 'Prepare Q4 sales report',
    description: '准备第四季度销售报告，提交给管理层',
    assignee_id: 'user-001',
    related_type: null,
    related_id: null,
    project_id: 'project-001',
    due_date: '2025-01-30T18:00:00Z',
    status: 'pending',
    priority: 'low',
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 'task-004',
    title: 'Complete essay polishing for Jessica',
    description: 'Jessica Liu 的 Oxford 申请文书润色',
    assignee_id: 'user-003',
    related_type: 'student',
    related_id: 'student-002',
    project_id: null,
    due_date: '2025-01-26T17:00:00Z',
    status: 'completed',
    priority: 'urgent',
    created_at: '2025-01-18T08:00:00Z',
    updated_at: '2025-01-25T16:00:00Z',
  },
]

/**
 * Mock 待办事项（聚合视图）
 * Dashboard 首页展示
 */
export const mockTodoItems: TodoItem[] = [
  {
    id: 'todo-001',
    title: 'Review SOP draft for Harvard Application',
    type: 'task',
    source: 'tutor',
    priority: 'high',
    due_date: '2025-01-27T17:00:00Z',
    related_type: 'student',
    related_id: 'student-001',
    status: 'pending',
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'todo-002',
    title: 'Follow up with Mr. Li',
    type: 'follow_up',
    source: 'sales',
    priority: 'medium',
    due_date: '2025-01-28T12:00:00Z',
    related_type: 'customer',
    related_id: 'customer-002',
    status: 'in_progress',
    created_at: '2025-01-22T08:00:00Z',
  },
  {
    id: 'todo-003',
    title: '审批：新客户合同 - David Wang',
    type: 'approval',
    source: 'sales',
    priority: 'urgent',
    due_date: '2025-01-26T18:00:00Z',
    related_type: 'contract',
    related_id: 'contract-001',
    status: 'pending',
    created_at: '2025-01-25T14:00:00Z',
  },
  {
    id: 'todo-004',
    title: 'Prepare Q4 sales report',
    type: 'task',
    source: 'project',
    priority: 'low',
    due_date: '2025-01-30T18:00:00Z',
    related_type: null,
    related_id: null,
    status: 'pending',
    created_at: '2025-01-15T08:00:00Z',
  },
  {
    id: 'todo-005',
    title: '学员 Emily Zhang 48小时未回复',
    type: 'notification',
    source: 'system',
    priority: 'high',
    due_date: null,
    related_type: 'student',
    related_id: 'student-001',
    status: 'pending',
    created_at: '2025-01-26T08:00:00Z',
  },
]

/**
 * Mock KPI 数据
 * Dashboard 首页展示
 */
export const mockDashboardKPIs: KPIMetric[] = [
  {
    label: '待办任务',
    value: 12,
    change: 2,
    trend: 'up',
  },
  {
    label: '活跃客户',
    value: 45,
    change: 5,
    trend: 'up',
  },
  {
    label: '逾期任务',
    value: 3,
    change: -1,
    trend: 'down',
  },
  {
    label: '新消息',
    value: 8,
    trend: 'neutral',
  },
]

/**
 * Mock 近期日程
 */
export const mockUpcomingEvents = [
  {
    id: 'event-001',
    title: 'Internal Review Meeting',
    date: '2025-01-27',
    time: '10:00 AM - 11:30 AM',
  },
  {
    id: 'event-002',
    title: 'Client Onboarding: Emily Zhang',
    date: '2025-01-28',
    time: '2:00 PM - 3:00 PM',
  },
]
