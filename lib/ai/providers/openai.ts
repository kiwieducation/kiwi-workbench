/**
 * OpenAI AI Provider
 * 
 * 使用 OpenAI GPT 模型进行会话分析
 */

import type { AIProvider, AnalysisInput, ConversationAnalysis, ProviderConfig } from '../types'

const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_MAX_TOKENS = 2000
const DEFAULT_TEMPERATURE = 0.3

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private config: ProviderConfig

  constructor(config?: ProviderConfig) {
    this.config = {
      apiKey: config?.apiKey || process.env.OPENAI_API_KEY,
      baseUrl: config?.baseUrl || 'https://api.openai.com/v1',
      model: config?.model || DEFAULT_MODEL,
      maxTokens: config?.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: config?.temperature || DEFAULT_TEMPERATURE,
      timeout: config?.timeout || 30000,
    }
  }

  async analyzeConversation(input: AnalysisInput): Promise<ConversationAnalysis> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const startTime = Date.now()

    // 构建 prompt
    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(input)

    // 调用 OpenAI API
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(this.config.timeout!),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    // 解析 JSON 响应
    const analysis = JSON.parse(content)
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
        provider: 'openai',
        tokensUsed: data.usage?.total_tokens,
        processingTime,
      },
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.config.apiKey) return false

    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
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
- 关注时间节点、费用、进度等敏感话题`
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
