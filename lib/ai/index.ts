/**
 * AI 模块入口
 * 
 * 导出类型、Provider 和工具函数
 */

// 导出类型
export type {
  ConversationAnalysis,
  AnalysisInput,
  AIProvider,
  ProviderConfig,
} from './types'

export {
  registerProvider,
  getProvider,
  getDefaultProvider,
  listProviders,
} from './types'

// 导入 Providers
import { MockAIProvider } from './providers/mock'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { registerProvider } from './types'

// 注册所有 Providers
registerProvider('mock', () => new MockAIProvider())
registerProvider('openai', () => new OpenAIProvider())
registerProvider('anthropic', () => new AnthropicProvider())

// 导出 Provider 类（用于自定义配置）
export { MockAIProvider } from './providers/mock'
export { OpenAIProvider } from './providers/openai'
export { AnthropicProvider } from './providers/anthropic'
