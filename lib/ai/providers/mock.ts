/**
 * Mock AI Provider
 * 
 * 用于开发和测试，返回模拟的分析结果
 */

import type { AIProvider, AnalysisInput, ConversationAnalysis } from '../types'

export class MockAIProvider implements AIProvider {
  name = 'mock'

  async analyzeConversation(input: AnalysisInput): Promise<ConversationAnalysis> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    // 根据消息内容生成模拟分析
    const lastMessage = input.messages[input.messages.length - 1]
    const content = lastMessage?.content || ''
    
    // 简单的情绪判断
    const sentiment = this.analyzeSentiment(content)
    const intent = this.analyzeIntent(content)
    const keyPoints = this.extractKeyPoints(content)
    const risk = this.assessRisk(content, sentiment)

    return {
      intent: {
        primary: intent.primary,
        confidence: intent.confidence,
        secondary: intent.secondary,
      },
      sentiment: {
        overall: sentiment.overall,
        score: sentiment.score,
        emotions: sentiment.emotions,
      },
      keyPoints,
      riskAssessment: {
        level: risk.level,
        factors: risk.factors,
        suggestions: risk.suggestions,
      },
      suggestedReplies: this.generateSuggestedReplies(intent.primary, sentiment.overall),
      metadata: {
        model: 'mock-v1',
        provider: 'mock',
        tokensUsed: Math.floor(Math.random() * 500) + 100,
        processingTime: Math.floor(Math.random() * 500) + 200,
      },
    }
  }

  async healthCheck(): Promise<boolean> {
    return true
  }

  // ============================================
  // 私有辅助方法
  // ============================================

  private analyzeSentiment(content: string): {
    overall: 'positive' | 'neutral' | 'negative' | 'mixed'
    score: number
    emotions: string[]
  } {
    const lowerContent = content.toLowerCase()
    
    // 正面关键词
    const positiveKeywords = ['谢谢', '感谢', '太好了', '满意', '期待', '开心', '喜欢', '棒', '优秀']
    // 负面关键词
    const negativeKeywords = ['不满', '失望', '担心', '焦虑', '着急', '问题', '投诉', '退', '差']
    // 紧急关键词
    const urgentKeywords = ['急', '马上', '立刻', '赶紧', '截止', '来不及']

    const positiveCount = positiveKeywords.filter(k => lowerContent.includes(k)).length
    const negativeCount = negativeKeywords.filter(k => lowerContent.includes(k)).length
    const urgentCount = urgentKeywords.filter(k => lowerContent.includes(k)).length

    const emotions: string[] = []
    if (positiveCount > 0) emotions.push('积极', '期待')
    if (negativeCount > 0) emotions.push('担忧', '不满')
    if (urgentCount > 0) emotions.push('紧迫', '焦虑')
    if (emotions.length === 0) emotions.push('平静')

    let overall: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral'
    let score = 0

    if (positiveCount > negativeCount) {
      overall = 'positive'
      score = Math.min(0.3 + positiveCount * 0.2, 1)
    } else if (negativeCount > positiveCount) {
      overall = 'negative'
      score = Math.max(-0.3 - negativeCount * 0.2, -1)
    } else if (positiveCount > 0 && negativeCount > 0) {
      overall = 'mixed'
      score = 0
    }

    return { overall, score, emotions }
  }

  private analyzeIntent(content: string): {
    primary: string
    confidence: number
    secondary: string[]
  } {
    const lowerContent = content.toLowerCase()

    // 意图识别规则
    const intents = [
      { keywords: ['截止', '日期', '时间', '什么时候', '多久'], intent: '询问时间节点', confidence: 0.85 },
      { keywords: ['费用', '价格', '多少钱', '收费', '预算'], intent: '咨询费用', confidence: 0.9 },
      { keywords: ['进度', '怎么样', '到哪了', '状态'], intent: '询问进度', confidence: 0.85 },
      { keywords: ['文书', '申请', '材料', '资料'], intent: '询问申请材料', confidence: 0.8 },
      { keywords: ['推荐', '建议', '哪个好', '怎么选'], intent: '寻求建议', confidence: 0.8 },
      { keywords: ['问题', '不对', '错了', '修改'], intent: '反馈问题', confidence: 0.85 },
      { keywords: ['谢谢', '感谢', '辛苦'], intent: '表达感谢', confidence: 0.9 },
      { keywords: ['你好', '在吗', '请问'], intent: '打招呼', confidence: 0.95 },
    ]

    let primary = '一般咨询'
    let confidence = 0.6
    const secondary: string[] = []

    for (const rule of intents) {
      const matchCount = rule.keywords.filter(k => lowerContent.includes(k)).length
      if (matchCount > 0) {
        if (rule.confidence > confidence) {
          if (primary !== '一般咨询') secondary.push(primary)
          primary = rule.intent
          confidence = rule.confidence
        } else {
          secondary.push(rule.intent)
        }
      }
    }

    return { primary, confidence, secondary: secondary.slice(0, 2) }
  }

  private extractKeyPoints(content: string): ConversationAnalysis['keyPoints'] {
    const keyPoints: ConversationAnalysis['keyPoints'] = []

    // 时间相关
    if (/截止|deadline|ddl|\d+月|\d+号/i.test(content)) {
      keyPoints.push({
        topic: '时间节点',
        importance: 'high',
        context: '客户关注具体时间安排',
      })
    }

    // 费用相关
    if (/费用|价格|收费|钱|预算/i.test(content)) {
      keyPoints.push({
        topic: '费用咨询',
        importance: 'high',
        context: '客户关注服务费用',
      })
    }

    // 进度相关
    if (/进度|状态|怎么样|到哪/i.test(content)) {
      keyPoints.push({
        topic: '进度跟进',
        importance: 'medium',
        context: '客户关心当前进展',
      })
    }

    // 文书相关
    if (/文书|essay|ps|cv|推荐信/i.test(content)) {
      keyPoints.push({
        topic: '文书材料',
        importance: 'high',
        context: '涉及申请核心材料',
      })
    }

    // 默认关键点
    if (keyPoints.length === 0) {
      keyPoints.push({
        topic: '日常沟通',
        importance: 'low',
        context: '常规客户互动',
      })
    }

    return keyPoints
  }

  private assessRisk(
    content: string,
    sentiment: { overall: string; score: number }
  ): ConversationAnalysis['riskAssessment'] {
    const factors: string[] = []
    const suggestions: string[] = []
    let level: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // 负面情绪
    if (sentiment.overall === 'negative') {
      factors.push('客户情绪偏负面')
      suggestions.push('注意安抚客户情绪')
      level = 'medium'
    }

    // 紧急关键词
    if (/急|马上|立刻|来不及/i.test(content)) {
      factors.push('客户表达紧迫感')
      suggestions.push('优先处理，及时响应')
      level = level === 'medium' ? 'high' : 'medium'
    }

    // 投诉关键词
    if (/投诉|不满|差评|退款/i.test(content)) {
      factors.push('潜在投诉风险')
      suggestions.push('升级处理，主管介入')
      level = 'high'
    }

    // 流失风险
    if (/考虑|其他|别家|不想/i.test(content)) {
      factors.push('客户可能流失')
      suggestions.push('了解原因，挽留客户')
      level = level === 'low' ? 'medium' : level
    }

    if (factors.length === 0) {
      factors.push('无明显风险因素')
      suggestions.push('保持正常服务节奏')
    }

    return { level, factors, suggestions }
  }

  private generateSuggestedReplies(
    intent: string,
    sentiment: string
  ): ConversationAnalysis['suggestedReplies'] {
    const replies: ConversationAnalysis['suggestedReplies'] = []

    // 根据意图生成建议回复
    switch (intent) {
      case '询问时间节点':
        replies.push({
          content: '您好！关于时间安排，让我帮您确认一下具体的截止日期，稍后给您详细说明。',
          tone: '专业',
          priority: 1,
        })
        break
      case '询问进度':
        replies.push({
          content: '您好！目前您的申请进度正在顺利推进中，我来给您详细汇报一下当前状态。',
          tone: '亲切',
          priority: 1,
        })
        break
      case '咨询费用':
        replies.push({
          content: '您好！感谢您的咨询。关于费用方面，我来给您详细介绍一下我们的服务套餐和价格。',
          tone: '专业',
          priority: 1,
        })
        break
      case '反馈问题':
        replies.push({
          content: '非常感谢您的反馈！我已经记录下您提到的问题，会尽快处理并给您回复。',
          tone: '诚恳',
          priority: 1,
        })
        break
      default:
        replies.push({
          content: '您好！感谢您的消息，我来为您解答。',
          tone: '亲切',
          priority: 1,
        })
    }

    // 如果情绪负面，添加安抚性回复
    if (sentiment === 'negative') {
      replies.push({
        content: '非常理解您的心情，我们一定会尽全力为您解决。请放心，您的问题我们会优先处理。',
        tone: '安抚',
        priority: 2,
      })
    }

    return replies
  }
}
