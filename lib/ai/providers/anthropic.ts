/**
 * Anthropic AI Provider
 * 
 * 使用 Claude 模型进行会话分析
 */

import type { AIProvider, AnalysisInput, ConversationAnalysis, ProviderConfig } from '../types'

const DEFAULT_MODEL = 'claude-3-haiku-20240307'
const DEFAULT_MAX_TOKENS = 2000
const DEFAULT_TEMPERATURE = 0.3

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private config: ProviderConfig

  constructor(config?: ProviderConfig) {
    this.config = {
      apiKey: config?.apiKey || process.env.ANTHROPIC_API_KEY,
      baseUrl: config?.baseUrl || 'https://api.anthropic.com/v1',
      model: config?.model || DEFAULT_MODEL,
      maxTokens: config?.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: config?.temperature || DEFAULT_TEMPERATURE,
      timeout: config?.timeout || 30000,
    }
  }

  async analyzeConversation(input: AnalysisInput): Promise<ConversationAnalysis> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    const startTime = Date.now()

    // 构建 prompt
    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(input)

    // 调用 Anthropic API
    const response = await fetch(`${this.config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(this.config.timeout!),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      throw new Error('Empty response from Anthropic')
    }

    // 从响应中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Anthropic response')
    }

    const analysis = JSON.parse(jsonMatch[0])
    const processingTime = Date.now() - startTime

    return {
      intent: {
        primary: analysis.intent?.primary || '一般咨询',
        confidence: analysis.intent?.confidence || 0.7,
        secondary: analysis.intent?.secondary || [],
      },
      sentiment: {
        overall: analysis.sentiment?.overall || 'neutral',
        score: analysis.sentiment?.score || 0,
        emotions: analysis.sentiment?.emotions || [],
      },
      keyPoints: analysis.keyPoints || [],
      riskAssessment: {
        level: analysis.riskAssessment?.level || 'low',
        factors: analysis.riskAssessment?.factors || [],
        suggestions: analysis.riskAssessment?.suggestions || [],
      },
      suggestedReplies: analysis.suggestedReplies || [],
      metadata: {
        model: this.config.model!,
        provider: 'anthropic',
        tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        processingTime,
      },
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.config.apiKey) return false

    try {
      // Anthropic 没有简单的健康检查端点，使用一个最小请求
      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'hi' }],
        }),
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  private buildSystemPrompt(): string {
    return `你是一个专业的客户服务分析助手，专门为留学咨询机构分析企业微信会话。

你的任务是分析客户会话并提供以下信息：
1. 意图分析：识别客户的主要和次要意图
2. 情绪分析：评估客户的情绪状态
3. 关键点提取：提取会话中的重要信息
4. 风险评估：识别潜在的服务风险
5. 建议回复：提供专业的回复建议

请以 JSON 格式返回分析结果，结构如下：
{
  "intent": {
    "primary": "主要意图",
    "confidence": 0.85,
    "secondary": ["次要意图1", "次要意图2"]
  },
  "sentiment": {
    "overall": "positive|neutral|negative|mixed",
    "score": 0.5,
    "emotions": ["期待", "焦虑"]
  },
  "keyPoints": [
    {
      "topic": "关键主题",
      "importance": "high|medium|low",
      "context": "上下文说明"
    }
  ],
  "riskAssessment": {
    "level": "low|medium|high|critical",
    "factors": ["风险因素"],
    "suggestions": ["建议措施"]
  },
  "suggestedReplies": [
    {
      "content": "建议回复内容",
      "tone": "专业|亲切|安抚",
      "priority": 1
    }
  ]
}

注意事项：
- 意图置信度范围 0-1
- 情绪分数范围 -1 到 1（-1 最负面，1 最正面）
- 回复建议要符合留学咨询的专业场景
- 只返回 JSON，不要有其他文字`
  }

  private buildUserPrompt(input: AnalysisInput): string {
    let prompt = '请分析以下会话：\n\n'

    // 添加上下文
    if (input.context) {
      prompt += '【客户背景】\n'
      if (input.context.customerName) prompt += `客户姓名：${input.context.customerName}\n`
      if (input.context.customerStage) prompt += `服务阶段：${input.context.customerStage}\n`
      if (input.context.customerTags?.length) prompt += `客户标签：${input.context.customerTags.join(', ')}\n`
      prompt += '\n'
    }

    // 添加消息
    prompt += '【会话内容】\n'
    for (const msg of input.messages) {
      const sender = msg.senderName || (msg.role === 'user' ? '客户' : '顾问')
      prompt += `${sender}：${msg.content}\n`
    }

    return prompt
  }
}
