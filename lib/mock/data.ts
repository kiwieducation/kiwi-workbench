/**
 * Mock 数据文件
 * 
 * ⚠️ 注意：这是临时 Mock 数据，后续将从 Supabase 获取
 * 类型定义严格对齐 types/entities.ts
 * 
 * 对齐 v8.0 PRD 数据结构
 */

import type { User, Customer, KPIMetric, TodoItem, TimelineEvent } from '@/types/entities'

// 当前登录用户（Mock）
export const mockCurrentUser: User = {
  id: 'user-001',
  email: 'alex.chen@kiwiedu.com',
  name: 'Alex Chen',
  avatar_url: null,
  role: 'sales',
  department: 'Sales',
  team_id: 'team-001',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
}

// Dashboard KPI 数据
export const mockDashboardKPIs: KPIMetric[] = [
  {
    label: '待处理任务',
    value: 12,
    change: 2,
    trend: 'up',
  },
  {
    label: '跟进中客户',
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

// 待办事项
export const mockTodoItems: TodoItem[] = [
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

// 快捷操作
export const mockQuickActions = [
  { label: '新建学员', icon: 'UserPlus', href: '/tutor/students/new' },
  { label: '创建任务', icon: 'ClipboardList', href: '/projects/tasks/new' },
  { label: '上传文件', icon: 'Upload', href: '/knowledge/upload' },
  { label: '预约会议', icon: 'Calendar', href: '/calendar/new' },
]

// 日程安排
export const mockUpcomingEvents = [
  {
    id: 'event-001',
    title: '内部周会',
    date: '2024-01-22',
    time: '10:00 AM - 11:30 AM',
  },
  {
    id: 'event-002',
    title: 'Emily Zhang 文书讨论',
    date: '2024-01-23',
    time: '2:00 PM - 3:00 PM',
  },
]

// 侧边栏导航配置（对齐 v8.0 模块结构）
export const sidebarNavigation = {
  companyLevel: [
    { title: '个人首页', href: '/', icon: 'LayoutDashboard' },
    { title: '会话中心', href: '/messages', icon: 'MessageSquare' },
    { title: '知识库', href: '/knowledge', icon: 'BookOpen' },
    { title: '项目协作', href: '/projects', icon: 'FolderKanban' },
    { title: '素材中台', href: '/materials', icon: 'Library' },
    { title: '通讯录', href: '/contacts', icon: 'Contact' },
  ],
  departmentLevel: [
    { title: '销售工作台', href: '/sales', icon: 'TrendingUp', roles: ['sales', 'team_leader', 'manager', 'admin'] },
    { title: 'BD工作台', href: '/bd', icon: 'Users', roles: ['bd', 'manager', 'admin'] },
    { title: '市场工作台', href: '/marketing', icon: 'Megaphone', roles: ['marketing', 'manager', 'admin'] },
    { title: '导师工作台', href: '/tutor', icon: 'GraduationCap', roles: ['tutor', 'team_leader', 'manager', 'admin'] },
    { title: '教务工作台', href: '/academic', icon: 'School', roles: ['academic', 'manager', 'admin'] },
    { title: '财务工作台', href: '/finance', icon: 'Wallet', roles: ['finance', 'manager', 'admin'] },
  ],
  management: [
    { title: '质检中心', href: '/quality', icon: 'ShieldCheck', roles: ['manager', 'admin'] },
  ],
  system: [
    { title: '系统设置', href: '/settings', icon: 'Settings', roles: ['admin'] },
  ],
}

// 角色显示名称映射
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

// ============================================
// 企业微信会话中心 Mock 数据
// ============================================

export interface MockConversation {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  type: 'student' | 'parent' | 'internal' | 'group'
  isOverdue?: boolean
  // 客户画像字段
  clientStatus?: 'signed' | 'prospect'
  grade?: string
  serviceProject?: string
  riskStatus?: 'normal' | 'attention' | 'critical'
  serviceStage?: string
  serviceProgress?: number
  tags?: string[]
  source?: string
  joinDate?: string
  contractDate?: string
  lastFollowUp?: string
  nextKeyNode?: { label: string; date: string }
  serviceTeam?: {
    consultant?: string
    leadTutor?: string
    associateTutor?: string
  }
}

export interface MockMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isMe: boolean
  type: 'text' | 'image' | 'file' | 'voice'
}

export const mockConversations: MockConversation[] = [
  {
    id: 'conv-001',
    name: 'Emily Zhang (学生)',
    lastMessage: '老师，申请截止日期是什么时候？',
    lastMessageTime: '10:30',
    unreadCount: 2,
    type: 'student',
    isOverdue: true,
    clientStatus: 'signed',
    grade: '高二',
    serviceProject: '美本VIP申请',
    riskStatus: 'normal',
    serviceStage: '文书润色',
    serviceProgress: 65,
    tags: ['VIP', '高潜力', '转介绍'],
    source: '小红书 @KiwiEdu (市场: Anna)',
    joinDate: '2024-09-15',
    contractDate: '2024-09-20',
    lastFollowUp: '2024-10-24',
    nextKeyNode: { label: 'ED截止', date: '2024-11-01' },
    serviceTeam: {
      consultant: 'Sarah Wu',
      leadTutor: 'Dr. Mike Ross',
      associateTutor: 'Jenny Zhao',
    },
  },
  {
    id: 'conv-002',
    name: 'Mr. Li (家长)',
    lastMessage: '好的，谢谢老师的反馈',
    lastMessageTime: '昨天',
    unreadCount: 0,
    type: 'parent',
    clientStatus: 'prospect',
    grade: '高一',
    serviceProject: '美本/英本规划',
    riskStatus: 'attention',
    serviceStage: '初次咨询',
    serviceProgress: 20,
    tags: ['高净值', '低活跃风险'],
    source: 'BD: 教育展会上海',
    joinDate: '2024-10-01',
    lastFollowUp: '昨天',
    nextKeyNode: { label: '跟进会议', date: '明天' },
  },
  {
    id: 'conv-003',
    name: '销售一组',
    lastMessage: '[会议通知] 下午3点准时开会',
    lastMessageTime: '昨天',
    unreadCount: 5,
    type: 'group',
  },
  {
    id: 'conv-004',
    name: 'Sarah Jenkins (导师)',
    lastMessage: '文书初稿已经准备好，请审核',
    lastMessageTime: '周一',
    unreadCount: 0,
    type: 'internal',
  },
  {
    id: 'conv-005',
    name: 'Michael Chen (学生)',
    lastMessage: '老师，我的推荐信还需要补充材料吗？',
    lastMessageTime: '周一',
    unreadCount: 1,
    type: 'student',
    clientStatus: 'signed',
    grade: '高三',
    serviceProject: '美本常规申请',
    riskStatus: 'attention',
    serviceStage: '推荐信准备',
    serviceProgress: 45,
    tags: ['理工科', 'CS方向'],
    source: '官网咨询',
    joinDate: '2024-08-10',
    contractDate: '2024-08-15',
    lastFollowUp: '上周五',
    nextKeyNode: { label: 'RD截止', date: '2025-01-01' },
    serviceTeam: {
      consultant: 'Alex Chen',
      leadTutor: 'Prof. Wang',
    },
  },
]

export const mockMessages: Record<string, MockMessage[]> = {
  'conv-001': [
    {
      id: 'msg-001',
      conversationId: 'conv-001',
      senderId: 'student-001',
      senderName: 'Emily Zhang',
      content: '老师您好，我想确认一下申请的截止日期',
      timestamp: '10:28',
      isMe: false,
      type: 'text',
    },
    {
      id: 'msg-002',
      conversationId: 'conv-001',
      senderId: 'student-001',
      senderName: 'Emily Zhang',
      content: '是严格按照15号截止吗？',
      timestamp: '10:29',
      isMe: false,
      type: 'text',
    },
    {
      id: 'msg-003',
      conversationId: 'conv-001',
      senderId: 'user-001',
      senderName: 'Alex Chen',
      content: 'Emily你好！是的，Early Decision是15号截止',
      timestamp: '10:30',
      isMe: true,
      type: 'text',
    },
    {
      id: 'msg-004',
      conversationId: 'conv-001',
      senderId: 'user-001',
      senderName: 'Alex Chen',
      content: '我们要在12号之前完成文书定稿',
      timestamp: '10:31',
      isMe: true,
      type: 'text',
    },
  ],
  'conv-002': [
    {
      id: 'msg-005',
      conversationId: 'conv-002',
      senderId: 'parent-001',
      senderName: 'Mr. Li',
      content: '老师好，想了解一下孩子的规划方案',
      timestamp: '昨天 14:00',
      isMe: false,
      type: 'text',
    },
    {
      id: 'msg-006',
      conversationId: 'conv-002',
      senderId: 'user-001',
      senderName: 'Alex Chen',
      content: '李先生您好，已经为您准备好了初步方案，稍后发您',
      timestamp: '昨天 14:30',
      isMe: true,
      type: 'text',
    },
    {
      id: 'msg-007',
      conversationId: 'conv-002',
      senderId: 'parent-001',
      senderName: 'Mr. Li',
      content: '好的，谢谢老师的反馈',
      timestamp: '昨天 15:00',
      isMe: false,
      type: 'text',
    },
  ],
}

// AI 分析建议（对话教练）
export const mockAIAnalysis = {
  'conv-001': {
    intent: '紧急确认申请截止日期',
    emotion: '轻微焦虑',
    strategy: '先安抚情绪，再给出确切时间（12月15日），并建议立即预约会议敲定终稿，体现专业性',
    suggestedReplies: [
      '回复草稿：确认截止日期为12月15日，我们有充足时间完成。',
      'Emily你好，不用担心。正式截止日期是12月15日，我们还有时间润色文书。明天下午4点我们安排一次通话确认终稿如何？',
    ],
  },
}

// 营销素材
export const mockMarketingMaterials = [
  {
    id: 'm1',
    title: '2024英国大学排名深度解析',
    type: 'article' as const,
    source: '公众号',
    date: '今天',
    summary: '用这篇文章向家长解释为什么G5大学越来越难申请，适合担心排名的家长',
  },
  {
    id: 'm2',
    title: '视频：牛津大学一日体验',
    type: 'video' as const,
    source: '视频号',
    date: '昨天',
    summary: '激励缺乏动力的学生，发送此视频提升士气',
  },
  {
    id: 'm3',
    title: '签证政策变更提醒',
    type: 'article' as const,
    source: '公众号',
    date: '2天前',
    summary: '新生必看的重要更新，请立即通知所有英国方向学生',
  },
]

// ============================================
// 销售工作台 - 客户数据
// ============================================

export interface MockCustomer {
  id: string
  name: string
  avatar?: string
  phone: string
  email?: string
  wechat?: string
  tags: string[]
  stage: 'new' | 'following' | 'proposal' | 'signed' | 'lost'
  riskLevel: 'low' | 'medium' | 'high'
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

export const mockCustomers: MockCustomer[] = [
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
  {
    id: 'cust-002',
    name: 'Michael Chen',
    phone: '+86 139****1234',
    email: 'michael.c@example.com',
    tags: ['美本', '高意向'],
    stage: 'following',
    riskLevel: 'medium',
    owner: 'Alex Chen',
    ownerId: 'user-001',
    source: '转介绍',
    lastContact: '1天前',
    nextAction: '发送方案',
    nextActionDate: '2024-10-26',
    createdAt: '2024-10-01',
    updatedAt: '2024-10-23',
    studentName: 'Michael Chen',
    grade: '高三',
    targetCountry: '美国',
    budget: '30-50万',
  },
  {
    id: 'cust-003',
    name: 'Jessica Liu',
    phone: '+86 137****5678',
    tags: ['英硕'],
    stage: 'new',
    riskLevel: 'high',
    owner: 'Alex Chen',
    ownerId: 'user-001',
    source: '官网',
    lastContact: '5天前',
    nextAction: '初次电话',
    createdAt: '2024-10-20',
    updatedAt: '2024-10-20',
    studentName: 'Jessica Liu',
    grade: '大四',
    targetCountry: '英国',
  },
  {
    id: 'cust-004',
    name: 'David Wang',
    phone: '+86 136****9999',
    tags: ['艺术作品集'],
    stage: 'proposal',
    riskLevel: 'low',
    owner: 'Jenny Zhao',
    ownerId: 'user-003',
    source: '讲座',
    lastContact: '3小时前',
    nextAction: '合同审核',
    nextActionDate: '2024-10-25',
    createdAt: '2024-09-28',
    updatedAt: '2024-10-24',
    studentName: 'David Wang',
    grade: '高三',
    targetCountry: '美国/英国',
    budget: '40万+',
  },
  {
    id: 'cust-005',
    name: 'Sophie Li',
    phone: '+86 135****8888',
    tags: ['PhD'],
    stage: 'lost',
    riskLevel: 'low',
    owner: '系统',
    ownerId: 'system',
    source: '广告投放',
    lastContact: '1个月前',
    nextAction: 'N/A',
    createdAt: '2024-08-15',
    updatedAt: '2024-09-20',
    studentName: 'Sophie Li',
    grade: '研二',
    targetCountry: '美国',
  },
  {
    id: 'cust-006',
    name: 'Ryan Wu',
    phone: '+86 134****7777',
    tags: ['高一', '早规划'],
    stage: 'following',
    riskLevel: 'low',
    owner: 'Sarah Wu',
    ownerId: 'user-002',
    source: '小红书',
    lastContact: '今天',
    nextAction: '家长会议',
    nextActionDate: '2024-10-27',
    createdAt: '2024-10-10',
    updatedAt: '2024-10-24',
    studentName: 'Ryan Wu',
    grade: '高一',
    targetCountry: '美国/加拿大',
    budget: '50万+',
  },
  {
    id: 'cust-007',
    name: 'Amanda Chen',
    phone: '+86 133****6666',
    tags: ['转学'],
    stage: 'signed',
    riskLevel: 'medium',
    owner: 'Mike Ross',
    ownerId: 'user-004',
    source: '转介绍',
    lastContact: '昨天',
    nextAction: '签证准备',
    nextActionDate: '2024-11-15',
    createdAt: '2024-08-01',
    updatedAt: '2024-10-23',
    studentName: 'Amanda Chen',
    grade: '大二',
    targetCountry: '美国',
    budget: '40万',
  },
  {
    id: 'cust-008',
    name: 'Kevin Zhang',
    phone: '+86 132****5555',
    tags: ['高一'],
    stage: 'new',
    riskLevel: 'low',
    owner: '待分配',
    ownerId: 'unassigned',
    source: '活动',
    lastContact: '刚刚',
    nextAction: '分配负责人',
    createdAt: '2024-10-24',
    updatedAt: '2024-10-24',
    studentName: 'Kevin Zhang',
    grade: '高一',
    targetCountry: '待定',
  },
]

// 客户详情 - 时间轴事件
export const mockCustomerTimeline: Record<string, TimelineEvent[]> = {
  'cust-001': [
    {
      id: 'evt-001',
      type: 'call',
      title: '咨询电话',
      description: '讨论ED申请策略，客户对文书有些焦虑',
      created_by: 'Sarah Wu',
      created_at: '2024-10-24 10:30',
    },
    {
      id: 'evt-002',
      type: 'note',
      title: '状态更新',
      description: '从"方案制定"更新为"已签约"',
      created_by: '系统',
      created_at: '2024-10-23 16:00',
    },
    {
      id: 'evt-003',
      type: 'contract',
      title: '合同签署',
      description: '通过电子签完成VIP服务合同签署',
      created_by: 'Alex Chen',
      created_at: '2024-09-20 14:00',
    },
    {
      id: 'evt-004',
      type: 'email',
      title: '方案发送',
      description: '发送美本申请初步规划方案',
      created_by: 'Sarah Wu',
      created_at: '2024-09-18 09:00',
    },
  ],
}

// 客户阶段配置
export const customerStageConfig = {
  new: { label: '新咨询', color: 'bg-blue-100 text-blue-700' },
  following: { label: '跟进中', color: 'bg-purple-100 text-purple-700' },
  proposal: { label: '方案制定', color: 'bg-amber-100 text-amber-700' },
  signed: { label: '已签约', color: 'bg-emerald-100 text-emerald-700' },
  lost: { label: '已流失', color: 'bg-slate-100 text-slate-500' },
}

// 风险等级配置
export const riskLevelConfig = {
  low: { label: '正常', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  medium: { label: '需关注', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  high: { label: '高风险', color: 'text-red-600', bgColor: 'bg-red-50' },
}
