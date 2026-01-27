import { Database } from './database'

// ============================================
// 数据库表类型（从 Supabase 生成）
// ============================================

// 用户类型
export type User = Database['public']['Tables']['users']['Row']
export type UserRole = User['role']

// 客户类型
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerStage = Customer['stage']

// 学员类型
export type Student = Database['public']['Tables']['students']['Row']
export type StudentStatus = Student['status']

// 任务类型
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskStatus = Task['status']
export type TaskPriority = Task['priority']

// 企业微信消息类型
export type WeChatMessage = Database['public']['Tables']['wechat_messages']['Row']

// 知识库文档类型
export type KnowledgeDocument = Database['public']['Tables']['knowledge_documents']['Row']

// 项目类型
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectStatus = Project['status']

// ============================================
// 业务实体类型（聚合/扩展）
// ============================================

// 会话类型（企业微信会话中心）
export interface Conversation {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  type: ConversationType
  isOverdue?: boolean
  // 客户画像字段
  clientStatus?: ClientStatus
  grade?: string
  serviceProject?: string
  riskStatus?: RiskStatus
  serviceStage?: string
  serviceProgress?: number
  tags?: string[]
  source?: string
  joinDate?: string
  contractDate?: string
  lastFollowUp?: string
  nextKeyNode?: KeyNode
  serviceTeam?: ServiceTeam
}

export type ConversationType = 'student' | 'parent' | 'internal' | 'group'
export type ClientStatus = 'signed' | 'prospect'
export type RiskStatus = 'normal' | 'attention' | 'critical'

export interface KeyNode {
  label: string
  date: string
}

export interface ServiceTeam {
  consultant?: string
  leadTutor?: string
  associateTutor?: string
}

// 消息类型
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isMe: boolean
  type: MessageType
}

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video' | 'link'

// AI 分析结果
export interface AIAnalysis {
  intent: string
  emotion: string
  strategy: string
  suggestedReplies: string[]
}

// 营销素材
export interface MarketingMaterial {
  id: string
  title: string
  type: MaterialType
  source: string
  date: string
  summary: string
}

export type MaterialType = 'article' | 'video'

// 客户详情类型（销售工作台）
export interface SalesCustomer {
  id: string
  name: string
  avatar?: string
  phone: string
  email?: string
  wechat?: string
  tags: string[]
  stage: SalesStage
  riskLevel: RiskLevel
  owner: string
  ownerId: string
  source: string
  lastContact: string
  nextAction: string
  nextActionDate?: string
  createdAt: string
  updatedAt: string
  // 详情页字段
  studentName?: string
  grade?: string
  targetCountry?: string
  budget?: string
  notes?: string
}

export type SalesStage = 'new' | 'following' | 'proposal' | 'signed' | 'lost'
export type RiskLevel = 'low' | 'medium' | 'high'

// 时间轴事件类型
export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string | null
  created_by: string
  created_at: string
  metadata?: Record<string, unknown>
}

export type TimelineEventType = 'note' | 'call' | 'meeting' | 'email' | 'contract' | 'payment'

// 待办事项类型（聚合）
export interface TodoItem {
  id: string
  title: string
  type: TodoType
  source: TodoSource
  priority: TaskPriority
  due_date: string | null
  related_type: string | null
  related_id: string | null
  status: TaskStatus
  created_at: string
}

export type TodoType = 'task' | 'approval' | 'follow_up' | 'notification'
export type TodoSource = 'sales' | 'tutor' | 'finance' | 'project' | 'system'

// KPI指标类型
export interface KPIMetric {
  label: string
  value: string | number
  change?: number
  trend?: TrendDirection
  target?: string | number
  icon?: string
}

export type TrendDirection = 'up' | 'down' | 'neutral'

// 日程事件
export interface ScheduleEvent {
  id: string
  title: string
  date: string
  time: string
}

// ============================================
// UI 组件类型
// ============================================

// 表格列定义
export interface TableColumn<T> {
  key: keyof T | string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, record: T, index: number) => React.ReactNode
  sortable?: boolean
}

// 筛选器选项
export interface FilterOption {
  label: string
  value: string
}

// 筛选器配置
export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'search' | 'date' | 'multi-select'
  options?: FilterOption[]
  placeholder?: string
}

// 分页配置
export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  onChange?: (page: number, pageSize: number) => void
}

// 空状态类型
export type EmptyStateVariant = 'default' | 'search' | 'error' | 'no-permission'

// ============================================
// 配置类型
// ============================================

// 阶段配置
export interface StageConfig {
  label: string
  color: string
}

// 风险配置
export interface RiskConfig {
  label: string
  color: string
  bgColor: string
}

// ============================================
// 权限类型
// ============================================

export type Permission = 
  | 'sales:view'
  | 'sales:edit'
  | 'sales:delete'
  | 'students:view'
  | 'students:edit'
  | 'students:delete'
  | 'finance:view'
  | 'finance:edit'
  | 'quality:view'
  | 'settings:manage'

export type DataScope = 'own' | 'department' | 'company'

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'sales:view', 'sales:edit', 'sales:delete',
    'students:view', 'students:edit', 'students:delete',
    'finance:view', 'finance:edit',
    'quality:view',
    'settings:manage',
  ],
  manager: [
    'sales:view', 'sales:edit',
    'students:view', 'students:edit',
    'finance:view',
    'quality:view',
  ],
  team_leader: [
    'sales:view', 'sales:edit',
    'students:view', 'students:edit',
  ],
  sales: [
    'sales:view', 'sales:edit',
  ],
  tutor: [
    'students:view', 'students:edit',
  ],
  bd: [
    'sales:view',
  ],
  marketing: [
    'sales:view',
  ],
  finance: [
    'finance:view', 'finance:edit',
  ],
  academic: [
    'students:view',
  ],
}

// ============================================
// 知识库类型
// ============================================

export interface KnowledgeFolder {
  id: string
  name: string
  parentId: string | null
  icon?: string
  children?: KnowledgeFolder[]
  fileCount?: number
  createdAt: string
  updatedAt: string
}

export interface KnowledgeFile {
  id: string
  name: string
  folderId: string
  type: KnowledgeFileType
  size: number
  mimeType: string
  url?: string
  tags: string[]
  description?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  viewCount: number
  downloadCount: number
}

export type KnowledgeFileType = 
  | 'document'   // Word/PDF
  | 'spreadsheet' // Excel
  | 'presentation' // PPT
  | 'image'
  | 'video'
  | 'template'   // SOP模板
  | 'other'

export interface KnowledgeBreadcrumb {
  id: string
  name: string
}

// ============================================
// 质检中心类型
// ============================================

export interface QualityAlert {
  id: string
  type: QualityAlertType
  severity: AlertSeverity
  title: string
  description: string
  relatedType: 'conversation' | 'customer' | 'student' | 'task'
  relatedId: string
  relatedName: string
  assignee?: string
  assigneeId?: string
  status: AlertStatus
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
}

export type QualityAlertType = 
  | 'response_timeout'      // 响应超时
  | 'follow_up_overdue'     // 跟进逾期
  | 'service_risk'          // 服务风险
  | 'negative_sentiment'    // 负面情绪
  | 'complaint'             // 投诉预警
  | 'task_overdue'          // 任务逾期
  | 'contract_expiring'     // 合同即将到期

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'ignored'

export interface QualityMetric {
  label: string
  value: number
  total?: number
  change?: number
  trend?: TrendDirection
  color?: string
}

export interface QualityFilters {
  type?: QualityAlertType | 'all'
  severity?: AlertSeverity | 'all'
  status?: AlertStatus | 'all'
  assignee?: string
  dateRange?: [string, string]
}

// 质检配置
export const alertTypeConfig: Record<QualityAlertType, { label: string; icon: string; color: string }> = {
  response_timeout: { label: '响应超时', icon: 'Clock', color: 'text-amber-600' },
  follow_up_overdue: { label: '跟进逾期', icon: 'Calendar', color: 'text-orange-600' },
  service_risk: { label: '服务风险', icon: 'AlertTriangle', color: 'text-red-600' },
  negative_sentiment: { label: '负面情绪', icon: 'Frown', color: 'text-purple-600' },
  complaint: { label: '投诉预警', icon: 'MessageSquareWarning', color: 'text-red-700' },
  task_overdue: { label: '任务逾期', icon: 'ClipboardList', color: 'text-amber-700' },
  contract_expiring: { label: '合同到期', icon: 'FileText', color: 'text-blue-600' },
}

export const severityConfig: Record<AlertSeverity, { label: string; color: string; bgColor: string }> = {
  low: { label: '低', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  medium: { label: '中', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  high: { label: '高', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  critical: { label: '紧急', color: 'text-red-600', bgColor: 'bg-red-100' },
}

export const alertStatusConfig: Record<AlertStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'text-amber-600' },
  processing: { label: '处理中', color: 'text-blue-600' },
  resolved: { label: '已解决', color: 'text-emerald-600' },
  ignored: { label: '已忽略', color: 'text-slate-400' },
}
