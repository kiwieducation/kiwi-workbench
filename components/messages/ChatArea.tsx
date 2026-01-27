'use client'

import { MoreVertical, Lock, RefreshCw, Copy, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Conversation, Message } from '@/types/entities'

interface ChatAreaProps {
  conversation: Conversation | null
  messages: Message[]
  draft: string
  onDraftChange: (value: string) => void
  onCopyDraft: () => void
}

/**
 * 聊天区域组件
 */
export function ChatArea({
  conversation,
  messages,
  draft,
  onDraftChange,
  onCopyDraft,
}: ChatAreaProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F6F8]">
        <div className="text-center text-slate-400">
          <p>选择一个会话开始</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F6F8]">
      {/* 聊天头部 */}
      <ChatHeader conversation={conversation} />

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 同步状态提示 */}
        <div className="flex justify-center mb-4">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm">
            <RefreshCw size={12} className="animate-spin" /> 正在同步企微数据...
          </span>
        </div>

        {/* 消息气泡 */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* 草稿输入区 */}
      <DraftArea
        draft={draft}
        onDraftChange={onDraftChange}
        onCopyDraft={onCopyDraft}
      />
    </div>
  )
}

// ============================================
// 聊天头部
// ============================================

function ChatHeader({ conversation }: { conversation: Conversation }) {
  return (
    <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-slate-900">{conversation.name}</h3>
        {conversation.isOverdue && (
          <Badge variant="destructive" className="animate-pulse">
            服务超时
          </Badge>
        )}
        {conversation.clientStatus && (
          <Badge variant={conversation.clientStatus === 'signed' ? 'success' : 'secondary'}>
            {conversation.clientStatus === 'signed' ? '已签约' : '未签约'}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
          <Lock size={12} /> 只读模式
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  )
}

// ============================================
// 消息气泡
// ============================================

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[70%] ${message.isMe ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className={`text-xs ${message.isMe ? 'bg-brand-100 text-brand-700' : 'bg-slate-200'}`}>
            {message.senderName.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className={`text-xs text-slate-400 mb-1 ${message.isMe ? 'text-right' : ''}`}>
            {message.senderName} · {message.timestamp}
          </div>
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm ${
              message.isMe
                ? 'bg-brand-600 text-white rounded-tr-sm'
                : 'bg-white text-slate-800 rounded-tl-sm shadow-sm'
            }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 草稿输入区
// ============================================

interface DraftAreaProps {
  draft: string
  onDraftChange: (value: string) => void
  onCopyDraft: () => void
}

function DraftArea({ draft, onDraftChange, onCopyDraft }: DraftAreaProps) {
  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
        <Sparkles size={12} /> 回复草稿区（复制后到企微发送）
      </div>
      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="AI 建议的回复会显示在这里，也可手动编辑..."
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          rows={2}
        />
        <Button onClick={onCopyDraft} disabled={!draft} className="self-end">
          <Copy size={16} className="mr-1" /> 复制
        </Button>
      </div>
    </div>
  )
}
