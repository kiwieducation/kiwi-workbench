/**
 * 销售客户数据服务层
 * 
 * 负责获取客户数据
 * 优先从 Supabase 获取，失败时回退到 Mock 数据
 */

import { createClient } from '@/lib/supabase/client'
import { createServiceError, success, failure, type ServiceResult } from '@/components/shared/Toast'
import type {
  SalesCustomer,
  SalesStage,
  RiskLevel,
  TimelineEvent,
  KPIMetric,
  StageConfig,
  RiskConfig,
  Customer,
} from '@/types/entities'

// ============================================
// 配置常量
// ============================================

export const customerStageConfig: Record<SalesStage, StageConfig> = {
  new: { label: '新咨询', color: 'bg-blue-100 text-blue-700' },
  following: { label: '跟进中', color: 'bg-purple-100 text-purple-700' },
  proposal: { label: '方案制定', color: 'bg-amber-100 text-amber-700' },
  signed: { label: '已签约', color: 'bg-emerald-100 text-emerald-700' },
  lost: { label: '已流失', color: 'bg-slate-100 text-slate-500' },
}

export const riskLevelConfig: Record<RiskLevel, RiskConfig> = {
  low: { label: '正常', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  medium: { label: '需关注', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  high: { label: '高风险', color: 'text-red-600', bgColor: 'bg-red-50' },
}

// ============================================
// Mock 数据（Supabase 查询失败时的 fallback）
// ============================================

const mockCustomers: SalesCustomer[] = [
  {
    id: 'cust-001',
    name: 'Emily Zhang',
    phone: '+86 138****0001',
    email: 'emily.z@example.com',
    wechat: 'emily_dream_big',
    tags: ['VIP', '高二', '美本'],
    stage: 'signed',
    riskLevel: 'low',
    owner: 'Sarah Wu',
    ownerId: 'user-002',
    source: '小红书',
    lastContact: '2小时前',
    nextAction: '文书审核',
    nextActionDate: '2024-11-01',
    createdAt: '2024-09-15',
    updatedAt: '2024-10-24',
    studentName: 'Emily Zhang',
    grade: '高二',
    targetCountry: '美国',
    budget: '50万+',
  },
  // 更多 mock 数据...
]

const mockTimeline: Record<string, TimelineEvent[]> = {
  'cust-001': [
    {
      id: 'evt-001',
      type: 'call',
      title: '咨询电话',
      description: '讨论ED申请策略，客户对文书有些焦虑',
      created_by: 'Sarah Wu',
      created_at: '2024-10-24 10:30',
    },
  ],
}

// ============================================
// 筛选条件类型
// ============================================

export interface CustomerFilters {
  search?: string
  stage?: SalesStage | 'all'
  owner?: string
  riskLevel?: RiskLevel | 'all'
  page?: number
  pageSize?: number
}

// ============================================
// 服务函数
// ============================================

/**
 * 获取客户列表
 * 
 * 优先从 Supabase 获取，失败时回退到 Mock
 */
export async function getCustomers(filters?: CustomerFilters): Promise<ServiceResult<{ data: SalesCustomer[]; total: number }>> {
  const supabase = createClient()
  const { search, stage, owner, riskLevel, page = 1, pageSize = 20 } = filters || {}

  try {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })

    // 应用搜索
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // 应用阶段筛选
    if (stage && stage !== 'all') {
      query = query.eq('stage', stage)
    }

    // 应用负责人筛选
    if (owner) {
      query = query.eq('assigned_to', owner)
    }

    // 应用风险等级筛选
    if (riskLevel && riskLevel !== 'all') {
      query = query.eq('risk_level', riskLevel)
    }

    // 分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to).order('updated_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.warn('Supabase query failed, using mock data:', error.message)
      // 回退到 Mock 数据
      return success({ data: mockCustomers, total: mockCustomers.length })
    }

    // 转换为 SalesCustomer 格式
    const customers: SalesCustomer[] = (data || []).map(transformCustomer)

    return success({ data: customers, total: count || 0 })
  } catch (error) {
    console.error('getCustomers error:', error)
    // 回退到 Mock 数据
    return success({ data: mockCustomers, total: mockCustomers.length })
  }
}

/**
 * 根据 ID 获取客户详情
 */
export async function getCustomerById(id: string): Promise<ServiceResult<SalesCustomer>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.warn('Supabase query failed, using mock data:', error.message)
      const mockCustomer = mockCustomers.find(c => c.id === id)
      if (mockCustomer) {
        return success(mockCustomer)
      }
      return failure({ code: 'NOT_FOUND', message: '客户不存在' })
    }

    return success(transformCustomer(data))
  } catch (error) {
    console.error('getCustomerById error:', error)
    const mockCustomer = mockCustomers.find(c => c.id === id)
    if (mockCustomer) {
      return success(mockCustomer)
    }
    return failure(createServiceError(error, '获取客户详情失败'))
  }
}

/**
 * 获取客户时间轴
 */
export async function getCustomerTimeline(customerId: string): Promise<ServiceResult<TimelineEvent[]>> {
  // TODO: 从 Supabase 获取客户时间轴
  // 目前使用 Mock 数据
  return success(mockTimeline[customerId] || [])
}

/**
 * 获取阶段统计
 */
export async function getStageStats(): Promise<ServiceResult<Record<SalesStage, number>>> {
  const supabase = createClient()

  try {
    const stages: SalesStage[] = ['new', 'following', 'proposal', 'signed', 'lost']
    const stats: Record<SalesStage, number> = {} as Record<SalesStage, number>

    for (const stage of stages) {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('stage', stage)

      if (error) {
        console.warn(`Failed to get count for stage ${stage}:`, error.message)
        stats[stage] = 0
      } else {
        stats[stage] = count || 0
      }
    }

    return success(stats)
  } catch (error) {
    console.error('getStageStats error:', error)
    // 返回默认值
    return success({
      new: 0,
      following: 0,
      proposal: 0,
      signed: 0,
      lost: 0,
    })
  }
}

/**
 * 获取销售 KPI
 */
export async function getSalesKPIs(): Promise<ServiceResult<KPIMetric[]>> {
  const statsResult = await getStageStats()
  
  if (!statsResult.success) {
    return failure(statsResult.error)
  }

  const stats = statsResult.data
  
  return success([
    { label: '本月新增客户', value: 28, change: 12, trend: 'up', icon: 'Users' },
    { label: '跟进中客户', value: stats.following + stats.proposal, change: 5, trend: 'up', icon: 'TrendingUp' },
    { label: '本月签约', value: stats.signed, change: 2, trend: 'up', icon: 'FileText' },
    { label: '本月业绩', value: '¥128万', change: 18, trend: 'up', icon: 'DollarSign' },
  ])
}

// ============================================
// 辅助函数
// ============================================

/**
 * 转换数据库记录为 SalesCustomer
 */
function transformCustomer(data: Customer): SalesCustomer {
  return {
    id: data.id,
    name: data.name,
    phone: data.phone || '',
    email: data.email || undefined,
    wechat: data.wechat || undefined,
    tags: data.tags || [],
    stage: data.stage as SalesStage,
    riskLevel: (data.risk_level as RiskLevel) || 'low',
    owner: data.assigned_to || '未分配',
    ownerId: data.assigned_to || '',
    source: data.source || '',
    lastContact: formatRelativeTime(data.updated_at),
    nextAction: data.next_action || '',
    nextActionDate: data.next_action_date || undefined,
    createdAt: formatDate(data.created_at),
    updatedAt: formatDate(data.updated_at),
    studentName: data.student_name || undefined,
    grade: data.grade || undefined,
    targetCountry: data.target_country || undefined,
    budget: data.budget || undefined,
    notes: data.notes || undefined,
  }
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(dateStr)
}

// ============================================
// 写入函数
// ============================================

/**
 * 创建客户输入类型
 */
export interface CreateCustomerInput {
  name: string
  phone?: string
  email?: string
  wechat?: string
  source?: string
  stage?: SalesStage
  tags?: string[]
  notes?: string
  studentName?: string
  grade?: string
  targetCountry?: string
  budget?: string
  assignedTo?: string
}

/**
 * 更新客户输入类型
 */
export interface UpdateCustomerInput {
  name?: string
  phone?: string
  email?: string
  wechat?: string
  source?: string
  stage?: SalesStage
  riskLevel?: RiskLevel
  tags?: string[]
  notes?: string
  nextAction?: string
  nextActionDate?: string
  studentName?: string
  grade?: string
  targetCountry?: string
  budget?: string
  assignedTo?: string
}

/**
 * 创建新客户
 */
export async function createCustomer(input: CreateCustomerInput): Promise<ServiceResult<SalesCustomer>> {
  const supabase = createClient()

  try {
    const insertData = {
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      wechat: input.wechat || null,
      source: input.source || null,
      stage: input.stage || 'new',
      tags: input.tags || null,
      notes: input.notes || null,
      student_name: input.studentName || null,
      grade: input.grade || null,
      target_country: input.targetCountry || null,
      budget: input.budget || null,
      assigned_to: input.assignedTo || null,
      risk_level: 'low',
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      console.error('Create customer error:', error)
      
      if (error.code === '42501' || error.message.includes('permission denied')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有创建客户的权限，请联系管理员',
        })
      }

      if (error.code === '23505') {
        return failure({
          code: 'DUPLICATE',
          message: '该客户已存在（手机号或邮箱重复）',
        })
      }

      return failure(createServiceError(error, '创建客户失败'))
    }

    return success(transformCustomer(data as Customer))
  } catch (error) {
    console.error('createCustomer error:', error)
    return failure(createServiceError(error, '创建客户失败'))
  }
}

/**
 * 更新客户信息
 */
export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<ServiceResult<SalesCustomer>> {
  const supabase = createClient()

  try {
    const updateData: Record<string, unknown> = {}

    // 只更新有值的字段
    if (input.name !== undefined) updateData.name = input.name
    if (input.phone !== undefined) updateData.phone = input.phone || null
    if (input.email !== undefined) updateData.email = input.email || null
    if (input.wechat !== undefined) updateData.wechat = input.wechat || null
    if (input.source !== undefined) updateData.source = input.source || null
    if (input.stage !== undefined) updateData.stage = input.stage
    if (input.riskLevel !== undefined) updateData.risk_level = input.riskLevel
    if (input.tags !== undefined) updateData.tags = input.tags
    if (input.notes !== undefined) updateData.notes = input.notes || null
    if (input.nextAction !== undefined) updateData.next_action = input.nextAction || null
    if (input.nextActionDate !== undefined) updateData.next_action_date = input.nextActionDate || null
    if (input.studentName !== undefined) updateData.student_name = input.studentName || null
    if (input.grade !== undefined) updateData.grade = input.grade || null
    if (input.targetCountry !== undefined) updateData.target_country = input.targetCountry || null
    if (input.budget !== undefined) updateData.budget = input.budget || null
    if (input.assignedTo !== undefined) updateData.assigned_to = input.assignedTo || null

    const { data, error } = await supabase
      .from('customers')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update customer error:', error)

      if (error.code === '42501' || error.message.includes('permission denied')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有编辑客户的权限',
        })
      }

      if (error.code === 'PGRST116') {
        return failure({
          code: 'NOT_FOUND',
          message: '客户不存在',
        })
      }

      return failure(createServiceError(error, '更新客户失败'))
    }

    return success(transformCustomer(data as Customer))
  } catch (error) {
    console.error('updateCustomer error:', error)
    return failure(createServiceError(error, '更新客户失败'))
  }
}

/**
 * 更新客户阶段
 */
export async function updateCustomerStage(id: string, stage: SalesStage): Promise<ServiceResult<SalesCustomer>> {
  return updateCustomer(id, { stage })
}

/**
 * 更新客户风险等级
 */
export async function updateCustomerRiskLevel(id: string, riskLevel: RiskLevel): Promise<ServiceResult<SalesCustomer>> {
  return updateCustomer(id, { riskLevel })
}

/**
 * 删除客户（软删除，标记为 lost）
 */
export async function archiveCustomer(id: string): Promise<ServiceResult<void>> {
  const result = await updateCustomer(id, { stage: 'lost' })
  if (!result.success) return failure(result.error)
  return success(undefined)
}

/**
 * 分配客户负责人
 */
export async function assignCustomer(id: string, assigneeId: string): Promise<ServiceResult<SalesCustomer>> {
  return updateCustomer(id, { assignedTo: assigneeId })
}

/**
 * 批量更新客户阶段
 */
export async function batchUpdateStage(ids: string[], stage: SalesStage): Promise<ServiceResult<number>> {
  const supabase = createClient()

  try {
    const { error, count } = await supabase
      .from('customers')
      .update({ stage } as never)
      .in('id', ids)

    if (error) {
      return failure(createServiceError(error, '批量更新失败'))
    }

    return success(count || 0)
  } catch (error) {
    return failure(createServiceError(error, '批量更新失败'))
  }
}

/**
 * 添加客户时间轴事件
 */
export async function addTimelineEvent(
  customerId: string,
  event: Omit<TimelineEvent, 'id' | 'created_at'>
): Promise<ServiceResult<TimelineEvent>> {
  // TODO: 需要创建 customer_timeline 表
  // 目前返回预留接口
  return failure({
    code: 'NOT_IMPLEMENTED',
    message: '时间轴功能需要创建 customer_timeline 表',
  })
}
