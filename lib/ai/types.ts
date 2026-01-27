/**
 * AI Provider 接口定义
 * 
 * 支持可插拔的 AI 服务提供商
 * 当前支持：OpenAI, Anthropic, Azure OpenAI, Mock
 */

// ============================================
// 类型定义
// ============================================

/**
 * 会话分析结果
 */
export interface ConversationAnalysis {
  // 意图分析
  intent: {
    primary: string           // 主要意图
    confidence: number        // 置信度 0-1
    secondary?: string[]      // 次要意图
  }
  
  // 情绪分析
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative' | 'mixed'
    score: number             // -1 到 1
    emotions: string[]        // 具体情绪标签：焦虑、期待、不满等
  }
  
  // 关键点提取
  keyPoints: {
    topic: string             // 关键主题
    importance: 'high' | 'medium' | 'low'
    context?: string          // 上下文说明
  }[]
  
  // 风险评估
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: string[]         // 风险因素
    suggestions: string[]     // 建议措施
  }
  
  // 建议回复
  suggestedReplies: {
    content: string
    tone: string              // 语气：专业、亲切、正式等
    priority: number          // 优先级 1-3
  }[]
  
  // 元数据
  metadata: {
    model: string             // 使用的模型
    provider: string          // 提供商
    tokensUsed?: number       // 消耗的 token 数
    processingTime?: number   // 处理时间 ms
  }
}

/**
 * 分析请求输入
 */
export interface AnalysisInput {
  conversationId: string
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: string
    senderName?: string
  }[]
  context?: {
    customerName?: string
    customerStage?: string
    customerTags?: string[]
    previousAnalysis?: Partial<ConversationAnalysis>
  }
}

/**
 * AI Provider 接口
 */
export interface AIProvider {
  name: string
  
  /**
   * 分析会话
   */
  analyzeConversation(input: AnalysisInput): Promise<ConversationAnalysis>
  
  /**
   * 检查服务可用性
   */
  healthCheck(): Promise<boolean>
}

/**
 * Provider 配置
 */
export interface ProviderConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
}

// ============================================
// Provider 注册表
// ============================================

const providerRegistry = new Map<string, () => AIProvider>()

/**
 * 注册 Provider
 */
export function registerProvider(name: string, factory: () => AIProvider): void {
  providerRegistry.set(name, factory)
}

/**
 * 获取 Provider
 */
export function getProvider(name: string): AIProvider | null {
  const factory = providerRegistry.get(name)
  return factory ? factory() : null
}

/**
 * 获取默认 Provider
 */
export function getDefaultProvider(): AIProvider {
  // 优先级：环境变量配置 > OpenAI > Anthropic > Mock
  const preferredProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'openai'
  
  const provider = getProvider(preferredProvider)
  if (provider) return provider
  
  // 回退到 Mock
  const mockProvider = getProvider('mock')
  if (mockProvider) return mockProvider
  
  throw new Error('No AI provider available')
}

/**
 * 列出所有注册的 Provider
 */
export function listProviders(): string[] {
  return Array.from(providerRegistry.keys())
}
