/**
 * 质检中心数据服务层
 * 
 * 负责获取质检数据
 * 基于 wechat_messages 聚合会话，支持风险标记
 */

import { createClient } from '@/lib/supabase/client'
import { createServiceError, success, failure, type ServiceResult } from '@/components/shared/Toast'
import { getConversationList } from './conversation.service'
import type {
  QualityAlert,
  QualityMetric,
  QualityFilters,
  QualityAlertType,
  AlertSeverity,
  AlertStatus,
  Conversation,
} from '@/types/entities'

// ============================================
// Mock 数据（开发模式 fallback）
// ============================================

const ENABLE_MOCK_FALLBACK = process.env.NODE_ENV === 'development'

const mockAlerts: QualityAlert[] = [
  {
    id: 'alert-001',
    type: 'response_timeout',
    severity: 'high',
    title: '客户消息响应超时',
    description: 'Emily Zhang 的消息已超过2小时未回复',
    relatedType: 'conversation',
    relatedId: 'conv-001',
    relatedName: 'Emily Zhang',
    assignee: 'Sarah Wu',
    assigneeId: 'user-002',
    status: 'pending',
    createdAt: '2024-10-24 10:30',
  },
  {
    id: 'alert-002',
    type: 'follow_up_overdue',
    severity: 'medium',
    title: '客户跟进逾期',
    description: 'Michael Chen 的跟进任务已逾期1天',
    relatedType: 'customer',
    relatedId: 'cust-002',
    relatedName: 'Michael Chen',
    assignee: 'Alex Chen',
    assigneeId: 'user-001',
    status: 'processing',
    createdAt: '2024-10-23 14:00',
  },
  {
    id: 'alert-003',
    type: 'service_risk',
    severity: 'critical',
    title: '服务风险预警',
    description: 'Jessica Liu 连续5天无互动，存在流失风险',
    relatedType: 'customer',
    relatedId: 'cust-003',
    relatedName: 'Jessica Liu',
    assignee: 'Alex Chen',
    assigneeId: 'user-001',
    status: 'pending',
    createdAt: '2024-10-24 09:00',
  },
]

// ============================================
// 服务函数
// ============================================

/**
 * 获取质检预警列表
 * 
 * 基于会话数据生成预警
 */
export async function getQualityAlerts(filters?: QualityFilters): Promise<ServiceResult<QualityAlert[]>> {
  try {
    // 获取会话列表
    const conversationsResult = await getConversationList({ pageSize: 100 })
    
    if (!conversationsResult.success) {
      if (ENABLE_MOCK_FALLBACK) {
        return success(filterAlerts(mockAlerts, filters))
      }
      return failure(conversationsResult.error)
    }

    // 从会话生成预警
    const alerts = generateAlertsFromConversations(conversationsResult.data.data)

    // 补充 mock 预警（开发模式）
    const allAlerts = ENABLE_MOCK_FALLBACK ? [...alerts, ...mockAlerts] : alerts

    // 应用筛选
    const filtered = filterAlerts(allAlerts, filters)

    return success(filtered)
  } catch (error) {
    console.error('getQualityAlerts error:', error)
    if (ENABLE_MOCK_FALLBACK) {
      return success(filterAlerts(mockAlerts, filters))
    }
    return failure(createServiceError(error, '获取预警列表失败'))
  }
}

/**
 * 获取单个预警
 */
export async function getAlertById(id: string): Promise<ServiceResult<QualityAlert | null>> {
  const result = await getQualityAlerts()
  if (!result.success) return failure(result.error)

  const alert = result.data.find(a => a.id === id)
  return success(alert || null)
}

/**
 * 获取质检指标
 */
export async function getQualityMetrics(): Promise<ServiceResult<QualityMetric[]>> {
  try {
    // 获取会话统计
    const conversationsResult = await getConversationList({ pageSize: 200 })
    
    let totalConversations = 0
    let overdueCount = 0
    let unreadCount = 0
    
    if (conversationsResult.success) {
      totalConversations = conversationsResult.data.total
      overdueCount = conversationsResult.data.data.filter(c => c.isOverdue).length
      unreadCount = conversationsResult.data.data.filter(c => c.unreadCount > 0).length
    }

    // 获取预警统计
    const alertsResult = await getQualityAlerts()
    let pendingAlerts = 0
    let criticalAlerts = 0
    let resolvedAlerts = 0

    if (alertsResult.success) {
      pendingAlerts = alertsResult.data.filter(a => a.status === 'pending').length
      criticalAlerts = alertsResult.data.filter(a => a.severity === 'critical' && a.status !== 'resolved').length
      resolvedAlerts = alertsResult.data.filter(a => a.status === 'resolved').length
    }

    const metrics: QualityMetric[] = [
      { 
        label: '今日会话数', 
        value: totalConversations, 
        color: 'text-blue-600',
        trend: 'neutral',
      },
      { 
        label: '待处理预警', 
        value: pendingAlerts, 
        color: 'text-amber-600', 
        trend: pendingAlerts > 3 ? 'up' : 'neutral',
        change: pendingAlerts > 3 ? pendingAlerts - 3 : undefined,
      },
      { 
        label: '紧急预警', 
        value: criticalAlerts, 
        color: 'text-red-600',
        trend: criticalAlerts > 0 ? 'up' : 'down',
      },
      { 
        label: '已处理', 
        value: resolvedAlerts, 
        total: pendingAlerts + resolvedAlerts + criticalAlerts,
        color: 'text-emerald-600',
      },
    ]

    return success(metrics)
  } catch (error) {
    console.error('getQualityMetrics error:', error)
    return success([
      { label: '今日会话数', value: 0, color: 'text-blue-600' },
      { label: '待处理预警', value: 0, color: 'text-amber-600' },
      { label: '紧急预警', value: 0, color: 'text-red-600' },
      { label: '已处理', value: 0, color: 'text-emerald-600' },
    ])
  }
}

/**
 * 获取预警统计
 */
export async function getAlertStats(): Promise<ServiceResult<{
  byType: Record<QualityAlertType, number>
  bySeverity: Record<AlertSeverity, number>
  byStatus: Record<AlertStatus, number>
}>> {
  const result = await getQualityAlerts()
  
  if (!result.success) {
    return failure(result.error)
  }

  const alerts = result.data
  const byType: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  alerts.forEach(alert => {
    byType[alert.type] = (byType[alert.type] || 0) + 1
    bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1
    byStatus[alert.status] = (byStatus[alert.status] || 0) + 1
  })

  return success({
    byType: byType as Record<QualityAlertType, number>,
    bySeverity: bySeverity as Record<AlertSeverity, number>,
    byStatus: byStatus as Record<AlertStatus, number>,
  })
}

/**
 * 获取待处理预警数量
 */
export async function getPendingAlertsCount(): Promise<ServiceResult<number>> {
  const result = await getQualityAlerts({ status: 'pending' })
  if (!result.success) return failure(result.error)
  return success(result.data.length)
}

/**
 * 获取最近预警
 */
export async function getRecentAlerts(limit: number = 5): Promise<ServiceResult<QualityAlert[]>> {
  const result = await getQualityAlerts()
  if (!result.success) return failure(result.error)

  const sorted = [...result.data]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  return success(sorted)
}

// ============================================
// 写入函数
// ============================================

export interface ResolveAlertInput {
  alertId: string
  notes?: string
}

/**
 * 标记预警已处理
 */
export async function resolveAlert(input: ResolveAlertInput): Promise<ServiceResult<QualityAlert>> {
  const supabase = createClient()

  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()

    // 尝试在 quality_reviews 表中创建/更新记录
    const reviewData = {
      alert_id: input.alertId,
      alert_type: 'manual_resolve',
      status: 'resolved' as const,
      notes: input.notes || null,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('quality_reviews')
      .upsert(reviewData as never, { onConflict: 'alert_id' })

    if (error) {
      console.error('Resolve alert error:', error)

      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return failure({
          code: 'TABLE_NOT_EXISTS',
          message: 'quality_reviews 表不存在，请联系管理员创建',
        })
      }

      if (error.code === '42501' || error.message.includes('permission denied')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有处理预警的权限',
        })
      }

      return failure(createServiceError(error, '处理预警失败'))
    }

    // 返回更新后的预警（从缓存中更新状态）
    const alertResult = await getQualityAlerts()
    if (alertResult.success) {
      const alert = alertResult.data.find(a => a.id === input.alertId)
      if (alert) {
        return success({ ...alert, status: 'resolved' as const, resolvedAt: new Date().toISOString() })
      }
    }

    // 返回默认的 QualityAlert 对象
    return success({
      id: input.alertId,
      type: 'response_timeout' as QualityAlertType,
      severity: 'low' as AlertSeverity,
      title: '已处理',
      description: '',
      relatedType: 'conversation',
      relatedId: '',
      relatedName: '',
      status: 'resolved' as AlertStatus,
      createdAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('resolveAlert error:', error)
    return failure(createServiceError(error, '处理预警失败'))
  }
}

/**
 * 忽略预警
 */
export async function ignoreAlert(alertId: string, reason?: string): Promise<ServiceResult<void>> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const reviewData = {
      alert_id: alertId,
      alert_type: 'ignored',
      status: 'ignored' as const,
      notes: reason || '用户忽略',
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('quality_reviews')
      .upsert(reviewData as never, { onConflict: 'alert_id' })

    if (error) {
      if (error.code === '42P01') {
        return failure({
          code: 'TABLE_NOT_EXISTS',
          message: 'quality_reviews 表不存在',
        })
      }
      return failure(createServiceError(error, '忽略预警失败'))
    }

    return success(undefined)
  } catch (error) {
    return failure(createServiceError(error, '忽略预警失败'))
  }
}

/**
 * 批量处理预警
 */
export async function batchResolveAlerts(alertIds: string[], notes?: string): Promise<ServiceResult<number>> {
  let successCount = 0

  for (const alertId of alertIds) {
    const result = await resolveAlert({ alertId, notes })
    if (result.success) {
      successCount++
    }
  }

  return success(successCount)
}

// ============================================
// 辅助函数
// ============================================

function filterAlerts(alerts: QualityAlert[], filters?: QualityFilters): QualityAlert[] {
  let result = [...alerts]

  if (filters?.type && filters.type !== 'all') {
    result = result.filter(a => a.type === filters.type)
  }

  if (filters?.severity && filters.severity !== 'all') {
    result = result.filter(a => a.severity === filters.severity)
  }

  if (filters?.status && filters.status !== 'all') {
    result = result.filter(a => a.status === filters.status)
  }

  if (filters?.assignee) {
    result = result.filter(a => a.assigneeId === filters.assignee)
  }

  return result
}

/**
 * 从会话数据生成预警
 */
function generateAlertsFromConversations(conversations: Conversation[]): QualityAlert[] {
  const alerts: QualityAlert[] = []
  const now = new Date()

  conversations.forEach(conv => {
    // 检测逾期会话
    if (conv.isOverdue) {
      alerts.push({
        id: `alert-overdue-${conv.id}`,
        type: 'response_timeout',
        severity: 'high',
        title: '会话响应超时',
        description: `${conv.name} 的会话已超时未回复`,
        relatedType: 'conversation',
        relatedId: conv.id,
        relatedName: conv.name,
        status: 'pending',
        createdAt: now.toISOString(),
      })
    }

    // 检测未读消息过多
    if (conv.unreadCount > 5) {
      alerts.push({
        id: `alert-unread-${conv.id}`,
        type: 'response_timeout',
        severity: 'medium',
        title: '未读消息堆积',
        description: `${conv.name} 有 ${conv.unreadCount} 条未读消息`,
        relatedType: 'conversation',
        relatedId: conv.id,
        relatedName: conv.name,
        status: 'pending',
        createdAt: now.toISOString(),
      })
    }

    // 检测风险状态
    if (conv.riskStatus === 'critical') {
      alerts.push({
        id: `alert-risk-${conv.id}`,
        type: 'service_risk',
        severity: 'critical',
        title: '高风险客户预警',
        description: `${conv.name} 被标记为高风险状态`,
        relatedType: 'conversation',
        relatedId: conv.id,
        relatedName: conv.name,
        status: 'pending',
        createdAt: now.toISOString(),
      })
    } else if (conv.riskStatus === 'attention') {
      alerts.push({
        id: `alert-attention-${conv.id}`,
        type: 'service_risk',
        severity: 'medium',
        title: '客户需关注',
        description: `${conv.name} 需要重点关注`,
        relatedType: 'conversation',
        relatedId: conv.id,
        relatedName: conv.name,
        status: 'pending',
        createdAt: now.toISOString(),
      })
    }
  })

  return alerts
}
