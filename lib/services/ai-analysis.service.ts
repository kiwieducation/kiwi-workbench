/**
 * AI 分析服务
 * 
 * 负责会话 AI 分析的调度和持久化
 * 策略：优先读库，不存在才触发 AI
 */

import { createClient } from '@/lib/supabase/client'
import { createServiceError, success, failure, type ServiceResult } from '@/components/shared/Toast'
import { getDefaultProvider, type ConversationAnalysis, type AnalysisInput } from '@/lib/ai'
import type { Message } from '@/types/entities'

// ============================================
// 类型定义
// ============================================

export interface StoredAnalysis {
  id: string
  conversationId: string
  idempotencyKey: string
  analysis: ConversationAnalysis
  createdAt: string
  updatedAt: string
}

interface DBAnalysis {
  id: string
  conversation_id: string
  idempotency_key: string
  intent_primary: string
  intent_confidence: number
  intent_secondary: string[] | null
  sentiment_overall: 'positive' | 'neutral' | 'negative' | 'mixed'
  sentiment_score: number
  sentiment_emotions: string[] | null
  key_points: Record<string, unknown>[] | null
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[] | null
  risk_suggestions: string[] | null
  suggested_replies: Record<string, unknown>[] | null
  ai_provider: string
  ai_model: string
  tokens_used: number | null
  processing_time_ms: number | null
  created_at: string
  updated_at: string
}

// ============================================
// 服务函数
// ============================================

/**
 * 获取会话分析（优先读库）
 * 
 * @param conversationId 会话 ID
 * @param messages 会话消息（用于计算幂等键和触发 AI）
 * @param forceRefresh 强制刷新（跳过缓存）
 */
export async function getConversationAnalysis(
  conversationId: string,
  messages: Message[],
  options?: {
    forceRefresh?: boolean
    context?: AnalysisInput['context']
  }
): Promise<ServiceResult<ConversationAnalysis>> {
  const { forceRefresh = false, context } = options || {}

  // 1. 计算幂等键（conversation_id + 最后一条消息的 ID）
  const lastMessageId = messages[messages.length - 1]?.id || 'empty'
  const idempotencyKey = `${conversationId}:${lastMessageId}`

  // 2. 如果不强制刷新，先尝试从数据库读取
  if (!forceRefresh) {
    const cachedResult = await getAnalysisFromDB(idempotencyKey)
    if (cachedResult.success && cachedResult.data) {
      console.log('[AI] Using cached analysis:', idempotencyKey)
      return success(cachedResult.data.analysis)
    }
  }

  // 3. 数据库没有，触发 AI 分析
  console.log('[AI] Triggering AI analysis:', idempotencyKey)
  const aiResult = await triggerAIAnalysis(conversationId, messages, context)
  
  if (!aiResult.success) {
    return failure(aiResult.error)
  }

  // 4. 将分析结果存入数据库
  const saveResult = await saveAnalysisToDB(conversationId, idempotencyKey, aiResult.data)
  if (!saveResult.success) {
    console.warn('[AI] Failed to save analysis to DB:', saveResult.error)
    // 保存失败不影响返回结果
  }

  return success(aiResult.data)
}

/**
 * 从数据库获取分析结果
 */
export async function getAnalysisFromDB(
  idempotencyKey: string
): Promise<ServiceResult<StoredAnalysis | null>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('conversation_analyses')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录不存在
        return success(null)
      }

      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('[AI] conversation_analyses table not exists')
        return success(null)
      }

      return failure(createServiceError(error, '获取分析结果失败'))
    }

    return success(transformDBAnalysis(data as DBAnalysis))
  } catch (error) {
    console.error('getAnalysisFromDB error:', error)
    return success(null) // 出错时返回 null，继续触发 AI
  }
}

/**
 * 获取会话的历史分析记录
 */
export async function getAnalysisHistory(
  conversationId: string,
  limit: number = 10
): Promise<ServiceResult<StoredAnalysis[]>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('conversation_analyses')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      if (error.code === '42P01') {
        return success([])
      }
      return failure(createServiceError(error, '获取分析历史失败'))
    }

    const analyses = (data || []).map(d => transformDBAnalysis(d as DBAnalysis))
    return success(analyses)
  } catch (error) {
    return failure(createServiceError(error, '获取分析历史失败'))
  }
}

/**
 * 触发 AI 分析
 */
async function triggerAIAnalysis(
  conversationId: string,
  messages: Message[],
  context?: AnalysisInput['context']
): Promise<ServiceResult<ConversationAnalysis>> {
  try {
    const provider = getDefaultProvider()

    const input: AnalysisInput = {
      conversationId,
      messages: messages.map(msg => ({
        role: msg.isMe ? 'assistant' : 'user',
        content: msg.content,
        timestamp: msg.timestamp,
        senderName: msg.senderName,
      })),
      context,
    }

    const analysis = await provider.analyzeConversation(input)
    return success(analysis)
  } catch (error) {
    console.error('AI analysis error:', error)
    return failure(createServiceError(error, 'AI 分析失败'))
  }
}

/**
 * 保存分析结果到数据库
 */
async function saveAnalysisToDB(
  conversationId: string,
  idempotencyKey: string,
  analysis: ConversationAnalysis
): Promise<ServiceResult<void>> {
  const supabase = createClient()

  try {
    const insertData = {
      conversation_id: conversationId,
      idempotency_key: idempotencyKey,
      intent_primary: analysis.intent.primary,
      intent_confidence: analysis.intent.confidence,
      intent_secondary: analysis.intent.secondary || null,
      sentiment_overall: analysis.sentiment.overall,
      sentiment_score: analysis.sentiment.score,
      sentiment_emotions: analysis.sentiment.emotions || null,
      key_points: analysis.keyPoints || null,
      risk_level: analysis.riskAssessment.level,
      risk_factors: analysis.riskAssessment.factors || null,
      risk_suggestions: analysis.riskAssessment.suggestions || null,
      suggested_replies: analysis.suggestedReplies || null,
      ai_provider: analysis.metadata.provider,
      ai_model: analysis.metadata.model,
      tokens_used: analysis.metadata.tokensUsed || null,
      processing_time_ms: analysis.metadata.processingTime || null,
    }

    const { error } = await supabase
      .from('conversation_analyses')
      .upsert(insertData as never, { onConflict: 'idempotency_key' })

    if (error) {
      console.error('Save analysis error:', error)
      return failure(createServiceError(error, '保存分析结果失败'))
    }

    return success(undefined)
  } catch (error) {
    return failure(createServiceError(error, '保存分析结果失败'))
  }
}

/**
 * 删除会话的分析记录
 */
export async function deleteAnalysis(conversationId: string): Promise<ServiceResult<void>> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('conversation_analyses')
      .delete()
      .eq('conversation_id', conversationId)

    if (error) {
      return failure(createServiceError(error, '删除分析记录失败'))
    }

    return success(undefined)
  } catch (error) {
    return failure(createServiceError(error, '删除分析记录失败'))
  }
}

// ============================================
// 辅助函数
// ============================================

function transformDBAnalysis(data: DBAnalysis): StoredAnalysis {
  return {
    id: data.id,
    conversationId: data.conversation_id,
    idempotencyKey: data.idempotency_key,
    analysis: {
      intent: {
        primary: data.intent_primary,
        confidence: data.intent_confidence,
        secondary: data.intent_secondary || undefined,
      },
      sentiment: {
        overall: data.sentiment_overall,
        score: data.sentiment_score,
        emotions: data.sentiment_emotions || [],
      },
      keyPoints: (data.key_points || []) as ConversationAnalysis['keyPoints'],
      riskAssessment: {
        level: data.risk_level,
        factors: data.risk_factors || [],
        suggestions: data.risk_suggestions || [],
      },
      suggestedReplies: (data.suggested_replies || []) as ConversationAnalysis['suggestedReplies'],
      metadata: {
        provider: data.ai_provider,
        model: data.ai_model,
        tokensUsed: data.tokens_used || undefined,
        processingTime: data.processing_time_ms || undefined,
      },
    },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
