/**
 * 会话中心数据服务层
 * 
 * 负责获取企业微信会话数据
 * 从 Supabase wechat_messages 表聚合会话列表
 */

import { createClient } from '@/lib/supabase/client'
import { createServiceError, success, failure, type ServiceResult } from '@/components/shared/Toast'
import type {
  Conversation,
  Message,
  AIAnalysis,
  MarketingMaterial,
  ConversationType,
  MessageType,
} from '@/types/entities'
import type { Json } from '@/types/database'

// ============================================
// Mock 数据（开发模式 fallback）
// ============================================

const ENABLE_MOCK_FALLBACK = process.env.NODE_ENV === 'development'

const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    name: 'Emily Zhang',
    type: 'student',
    lastMessage: '老师，我的文书进度怎么样了？',
    lastMessageTime: '10:30',
    unreadCount: 2,
    isOverdue: false,
    clientStatus: 'signed',
    tags: ['VIP', '美本'],
    grade: '高二',
    serviceProject: '美本申请',
    serviceStage: '文书准备',
    serviceProgress: 65,
    riskStatus: 'normal',
    nextKeyNode: { label: 'ED截止', date: '2024-11-01' },
    lastFollowUp: '2024-10-24',
    contractDate: '2024-09-20',
    joinDate: '2024-09-15',
    serviceTeam: { consultant: 'Sarah Wu', leadTutor: 'Dr. Mike Ross' },
  },
  {
    id: 'conv-002',
    name: 'Mr. Li (Michael父亲)',
    type: 'parent',
    lastMessage: '麻烦老师多关注一下孩子的申请进度',
    lastMessageTime: '昨天',
    unreadCount: 0,
    isOverdue: true,
    tags: ['家长', '高意向'],
    grade: '高三',
  },
  {
    id: 'conv-003',
    name: '销售团队群',
    type: 'group',
    lastMessage: '[Alex]: 今天的签约目标完成了吗？',
    lastMessageTime: '09:15',
    unreadCount: 5,
    isOverdue: false,
  },
]

const mockMessages: Message[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    senderName: 'Emily Zhang',
    senderId: 'user-emily',
    content: '老师，我的文书进度怎么样了？',
    timestamp: '10:30',
    isMe: false,
    type: 'text',
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    senderName: 'Sarah Wu',
    senderId: 'user-sarah',
    content: 'Emily同学好！你的文书初稿已经完成了，正在做最后的润色。预计明天可以发给你review。',
    timestamp: '10:32',
    isMe: true,
    type: 'text',
  },
]

const mockAIAnalysis: AIAnalysis = {
  intent: '询问服务进度',
  emotion: '略有焦虑',
  strategy: '及时反馈具体进度，给出明确时间节点',
  suggestedReplies: [
    '您好！您的文书初稿已经完成约85%，预计明天下午可以发送给您review。',
    '感谢您的关注！目前文书正在做最后的润色，我会在今天内给您一个详细的进度更新。',
  ],
}

const mockMaterials: MarketingMaterial[] = [
  {
    id: 'mat-001',
    title: '2024美本申请趋势解读',
    type: 'article',
    source: '公众号',
    date: '2024-10-20',
    summary: '今年美本申请有这些新变化...',
  },
  {
    id: 'mat-002',
    title: '文书写作避坑指南',
    type: 'video',
    source: '视频号',
    date: '2024-10-18',
    summary: '分享这个视频给正在准备文书的学生',
  },
]

// ============================================
// 服务函数
// ============================================

/**
 * 获取会话列表（聚合）
 * 
 * 从 wechat_messages 表按 room_id 或 from/to 组合聚合
 */
export async function getConversationList(options?: {
  page?: number
  pageSize?: number
  type?: ConversationType | 'all'
}): Promise<ServiceResult<{ data: Conversation[]; total: number }>> {
  const supabase = createClient()
  const { page = 1, pageSize = 50, type } = options || {}

  try {
    // 尝试从 wechat_messages 聚合会话
    const { data: roomData, error: roomError } = await supabase
      .from('wechat_messages')
      .select('room_id, from_user_id, to_user_id, content, send_time, msg_type')
      .order('send_time', { ascending: false })
      .limit(500)

    if (roomError) {
      console.error('Supabase wechat_messages query failed:', roomError.message)

      if (roomError.code === '42P01' || roomError.message.includes('does not exist')) {
        if (ENABLE_MOCK_FALLBACK) {
          console.warn('[DEV] Using mock conversations (table not exists)')
          return success({ data: filterByType(mockConversations, type), total: mockConversations.length })
        }
        return failure({
          code: 'TABLE_NOT_EXISTS',
          message: '企业微信消息表不存在，请联系管理员创建 wechat_messages 表',
        })
      }

      if (roomError.code === '42501' || roomError.message.includes('permission denied')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有访问企业微信消息的权限',
        })
      }

      if (ENABLE_MOCK_FALLBACK) {
        return success({ data: filterByType(mockConversations, type), total: mockConversations.length })
      }

      return failure(createServiceError(roomError, '获取会话列表失败'))
    }

    // 聚合会话
    const conversations = aggregateConversations(roomData || [])

    // 筛选类型
    const filtered = filterByType(conversations, type)

    // 分页
    const startIdx = (page - 1) * pageSize
    const paged = filtered.slice(startIdx, startIdx + pageSize)

    return success({ data: paged, total: filtered.length })
  } catch (error) {
    console.error('getConversationList error:', error)
    if (ENABLE_MOCK_FALLBACK) {
      return success({ data: filterByType(mockConversations, type), total: mockConversations.length })
    }
    return failure(createServiceError(error, '获取会话列表失败'))
  }
}

/**
 * 获取会话消息列表（分页）
 */
export async function getConversationMessages(
  conversationId: string,
  options?: { limit?: number; before?: string }
): Promise<ServiceResult<{ data: Message[]; hasMore: boolean }>> {
  const supabase = createClient()
  const { limit = 50, before } = options || {}

  try {
    let query = supabase
      .from('wechat_messages')
      .select('*')
      .order('send_time', { ascending: false })
      .limit(limit + 1)

    // 解析 conversationId
    if (conversationId.startsWith('room_')) {
      const roomId = conversationId.replace('room_', '')
      query = query.eq('room_id', roomId)
    } else if (conversationId.startsWith('dm_')) {
      const parts = conversationId.replace('dm_', '').split('_')
      if (parts.length >= 2) {
        query = query.or(`and(from_user_id.eq.${parts[0]},to_user_id.eq.${parts[1]}),and(from_user_id.eq.${parts[1]},to_user_id.eq.${parts[0]})`)
      }
    } else {
      // Mock conversation ID
      if (ENABLE_MOCK_FALLBACK) {
        const filtered = mockMessages.filter(m => m.conversationId === conversationId)
        return success({ data: filtered, hasMore: false })
      }
    }

    if (before) {
      query = query.lt('send_time', before)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase messages query failed:', error.message)

      if (ENABLE_MOCK_FALLBACK) {
        const filtered = mockMessages.filter(m => m.conversationId === conversationId)
        return success({ data: filtered, hasMore: false })
      }

      return failure(createServiceError(error, '获取消息列表失败'))
    }

    const hasMore = (data?.length || 0) > limit
    const messages = (data || []).slice(0, limit).map(transformMessage)

    return success({ data: messages.reverse(), hasMore })
  } catch (error) {
    console.error('getConversationMessages error:', error)
    if (ENABLE_MOCK_FALLBACK) {
      return success({ data: mockMessages, hasMore: false })
    }
    return failure(createServiceError(error, '获取消息列表失败'))
  }
}

/**
 * 获取单个会话详情
 */
export async function getConversationById(id: string): Promise<ServiceResult<Conversation | null>> {
  const result = await getConversationList({ pageSize: 100 })
  if (!result.success) return failure(result.error)

  const conversation = result.data.data.find(c => c.id === id)
  return success(conversation || null)
}

/**
 * 获取 AI 分析（Mock）
 */
export async function getAIAnalysis(conversationId: string): Promise<ServiceResult<AIAnalysis | null>> {
  // TODO: 接入实际 AI 分析服务
  return success(mockAIAnalysis)
}

/**
 * 获取营销素材（Mock）
 */
export async function getMarketingMaterials(): Promise<ServiceResult<MarketingMaterial[]>> {
  // TODO: 从 Supabase 获取营销素材
  return success(mockMaterials)
}

/**
 * 获取未读会话数
 */
export async function getUnreadConversationsCount(): Promise<ServiceResult<number>> {
  const result = await getConversationList({ pageSize: 100 })
  if (!result.success) return failure(result.error)

  const unread = result.data.data.filter(c => c.unreadCount > 0).length
  return success(unread)
}

// ============================================
// 兼容旧接口
// ============================================

export async function getConversations(filter?: ConversationType | 'all'): Promise<Conversation[]> {
  const result = await getConversationList({ type: filter, pageSize: 100 })
  return result.success ? result.data.data : []
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const result = await getConversationMessages(conversationId)
  return result.success ? result.data.data : []
}

// ============================================
// 辅助函数
// ============================================

interface DBMessage {
  id: string
  msg_id: string
  from_user_id: string
  to_user_id: string | null
  room_id: string | null
  msg_type: string
  content: Json
  send_time: string
  synced_at: string
  created_at: string
}

function filterByType(conversations: Conversation[], type?: ConversationType | 'all'): Conversation[] {
  if (!type || type === 'all') return conversations
  if (type === 'internal') {
    return conversations.filter(c => c.type === 'internal' || c.type === 'group')
  }
  return conversations.filter(c => c.type === type)
}

function aggregateConversations(messages: Partial<DBMessage>[]): Conversation[] {
  const conversationMap = new Map<string, {
    id: string
    lastMessage: Partial<DBMessage>
    messageCount: number
  }>()

  messages.forEach(msg => {
    let convId: string
    let convType: ConversationType = 'student'

    if (msg.room_id) {
      convId = `room_${msg.room_id}`
      convType = 'group'
    } else if (msg.from_user_id && msg.to_user_id) {
      const sorted = [msg.from_user_id, msg.to_user_id].sort()
      convId = `dm_${sorted[0]}_${sorted[1]}`
    } else {
      convId = `msg_${msg.from_user_id || 'unknown'}`
    }

    const existing = conversationMap.get(convId)
    if (!existing || new Date(msg.send_time || '') > new Date(existing.lastMessage.send_time || '')) {
      conversationMap.set(convId, {
        id: convId,
        lastMessage: msg,
        messageCount: (existing?.messageCount || 0) + 1,
      })
    } else if (existing) {
      existing.messageCount++
    }
  })

  return Array.from(conversationMap.values()).map(conv => {
    const msg = conv.lastMessage
    const content = extractTextContent(msg.content)

    return {
      id: conv.id,
      name: msg.room_id ? `群聊 ${msg.room_id.slice(0, 8)}` : `用户 ${msg.from_user_id?.slice(0, 8) || 'Unknown'}`,
      type: (msg.room_id ? 'group' : 'student') as ConversationType,
      lastMessage: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
      lastMessageTime: formatMessageTime(msg.send_time || ''),
      unreadCount: 0,
      isOverdue: false,
    }
  })
}

function transformMessage(data: DBMessage): Message {
  return {
    id: data.id,
    conversationId: data.room_id ? `room_${data.room_id}` : `dm_${data.from_user_id}_${data.to_user_id}`,
    senderName: data.from_user_id?.slice(0, 8) || 'Unknown',
    senderId: data.from_user_id,
    content: extractTextContent(data.content),
    timestamp: formatMessageTime(data.send_time),
    isMe: false,
    type: mapMessageType(data.msg_type),
  }
}

function extractTextContent(content: Json | undefined): string {
  if (content === null || content === undefined) return '[空消息]'
  if (typeof content === 'string') return content
  if (typeof content === 'number' || typeof content === 'boolean') return String(content)
  if (Array.isArray(content)) return JSON.stringify(content)

  if (content.text) return String(content.text)
  if (content.content) return String(content.content)
  if (content.message) return String(content.message)

  const msgType = content.msgtype || content.type
  switch (msgType) {
    case 'image': return '[图片]'
    case 'voice': return '[语音]'
    case 'video': return '[视频]'
    case 'file': return '[文件]'
    case 'link': return '[链接]'
    case 'miniprogram': return '[小程序]'
    case 'location': return '[位置]'
    default: return '[消息]'
  }
}

function mapMessageType(type: string): MessageType {
  switch (type?.toLowerCase()) {
    case 'text': return 'text'
    case 'image': return 'image'
    case 'voice': return 'voice'
    case 'video': return 'video'
    case 'file': return 'file'
    case 'link': return 'link'
    default: return 'text'
  }
}

function formatMessageTime(timeStr: string): string {
  if (!timeStr) return ''

  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  } catch {
    return timeStr
  }
}
