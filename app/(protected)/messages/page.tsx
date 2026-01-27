'use client'

import { useState, useEffect } from 'react'
import { ConversationList, ChatArea, RightPanel } from '@/components/messages'
import { useToast } from '@/components/shared/Toast'
import {
  getConversationList,
  getConversationMessages,
  getMarketingMaterials,
} from '@/lib/services/conversation.service'
import { getConversationAnalysis } from '@/lib/services/ai-analysis.service'
import type { Conversation, Message, MarketingMaterial, ConversationType } from '@/types/entities'
import type { ConversationAnalysis } from '@/lib/ai'

type RightTabKey = 'profile' | 'ai' | 'feed'

/**
 * 企业微信会话中心
 * 
 * 对齐 v8.0 PRD + AI Studio 设计母版：
 * - 三栏布局：会话列表 | 聊天区域 | 客户画像/AI教练/素材推送
 * - 只读模式（企微同步）
 * - AI 分析：优先读库，不存在才触发 AI
 */
export default function MessagesPage() {
  const toast = useToast()

  // 数据状态
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [aiAnalysis, setAIAnalysis] = useState<ConversationAnalysis | null>(null)
  const [materials, setMaterials] = useState<MarketingMaterial[]>([])
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  
  // UI 状态
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ConversationType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [rightTab, setRightTab] = useState<RightTabKey>('profile')
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)

  // 加载会话列表
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true)
      const result = await getConversationList({ type: filter })
      
      if (result.success) {
        setConversations(result.data.data)
        // 默认选中第一个
        if (result.data.data.length > 0 && !selectedId) {
          setSelectedId(result.data.data[0].id)
        }
      } else {
        toast.error('加载会话列表失败', result.error.message)
        setConversations([])
      }
      setIsLoading(false)
    }
    loadConversations()
  }, [filter])

  // 加载选中会话的消息
  useEffect(() => {
    if (!selectedId) return
    
    const loadConversationData = async () => {
      setIsMessagesLoading(true)
      setAIAnalysis(null) // 清空旧的分析结果
      
      const [msgsResult, matsResult] = await Promise.all([
        getConversationMessages(selectedId),
        getMarketingMaterials(),
      ])
      
      if (msgsResult.success) {
        setMessages(msgsResult.data.data)
        setHasMoreMessages(msgsResult.data.hasMore)
        
        // 消息加载成功后，异步加载 AI 分析
        loadAIAnalysis(selectedId, msgsResult.data.data)
      } else {
        toast.error('加载消息失败', msgsResult.error.message)
        setMessages([])
      }
      
      if (matsResult.success) {
        setMaterials(matsResult.data)
      }
      
      setIsMessagesLoading(false)
    }
    loadConversationData()
  }, [selectedId])

  // 加载 AI 分析（优先读库，不存在才触发 AI）
  const loadAIAnalysis = async (conversationId: string, msgs: Message[]) => {
    if (msgs.length === 0) return
    
    setIsAnalysisLoading(true)
    
    // 获取选中会话的上下文
    const selectedConv = conversations.find(c => c.id === conversationId)
    
    const result = await getConversationAnalysis(conversationId, msgs, {
      context: selectedConv ? {
        customerName: selectedConv.name,
        customerStage: selectedConv.serviceStage,
        customerTags: selectedConv.tags,
      } : undefined,
    })
    
    if (result.success) {
      setAIAnalysis(result.data)
    } else {
      console.warn('AI analysis failed:', result.error)
      // AI 分析失败不阻塞页面，静默处理
    }
    
    setIsAnalysisLoading(false)
  }

  // 刷新 AI 分析
  const handleRefreshAnalysis = async () => {
    if (!selectedId || messages.length === 0) return
    
    setIsAnalysisLoading(true)
    
    const selectedConv = conversations.find(c => c.id === selectedId)
    
    const result = await getConversationAnalysis(selectedId, messages, {
      forceRefresh: true,
      context: selectedConv ? {
        customerName: selectedConv.name,
        customerStage: selectedConv.serviceStage,
        customerTags: selectedConv.tags,
      } : undefined,
    })
    
    if (result.success) {
      setAIAnalysis(result.data)
      toast.success('分析完成', 'AI 分析已更新')
    } else {
      toast.error('分析失败', result.error.message)
    }
    
    setIsAnalysisLoading(false)
  }

  // 加载更多消息
  const loadMoreMessages = async () => {
    if (!selectedId || !hasMoreMessages || isMessagesLoading) return
    
    const lastMessage = messages[0]
    if (!lastMessage) return
    
    setIsMessagesLoading(true)
    const result = await getConversationMessages(selectedId, { before: lastMessage.timestamp })
    
    if (result.success) {
      setMessages(prev => [...result.data.data, ...prev])
      setHasMoreMessages(result.data.hasMore)
    }
    setIsMessagesLoading(false)
  }

  // 筛选会话（本地搜索）
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    return conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // 选中的会话
  const selectedConversation = conversations.find(c => c.id === selectedId) || null

  // 复制草稿
  const handleCopyDraft = () => {
    if (!draft) return
    navigator.clipboard.writeText(draft)
    toast.success('已复制', '内容已复制到剪贴板')
  }

  // 采纳话术
  const handleUseScript = (script: string) => {
    setDraft(script)
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* 左栏：会话列表 */}
      <ConversationList
        conversations={filteredConversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 中栏：聊天区域 */}
      <ChatArea
        conversation={selectedConversation}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onCopyDraft={handleCopyDraft}
      />

      {/* 右栏：客户画像/AI教练/素材推送 */}
      <RightPanel
        conversation={selectedConversation}
        aiAnalysis={aiAnalysis}
        materials={materials}
        activeTab={rightTab}
        onTabChange={setRightTab}
        onUseScript={handleUseScript}
        onRefreshAnalysis={handleRefreshAnalysis}
        isAnalysisLoading={isAnalysisLoading}
      />
    </div>
  )
}
