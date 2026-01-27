'use client'

import { Search, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Conversation, ConversationType } from '@/types/entities'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  filter: ConversationType | 'all'
  onFilterChange: (filter: ConversationType | 'all') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const filterOptions: { key: ConversationType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'student', label: '学生' },
  { key: 'parent', label: '家长' },
  { key: 'internal', label: '内部' },
]

/**
 * 会话列表组件
 */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  return (
    <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
      {/* 筛选和搜索 */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map(f => (
            <Badge
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="搜索会话..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedId === conv.id}
            onClick={() => onSelect(conv.id)}
          />
        ))}
        {conversations.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            暂无会话
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// 会话列表项
// ============================================

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-3 flex gap-3 cursor-pointer border-b border-slate-100 hover:bg-slate-100 transition-colors relative ${
        isSelected ? 'bg-brand-50/50 border-l-4 border-l-brand-500' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-xs bg-slate-200">
            {conversation.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        {conversation.isOverdue && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <AlertCircle size={10} className="text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-medium text-slate-900 truncate">{conversation.name}</h4>
          <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{conversation.lastMessageTime}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{conversation.lastMessage}</p>
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {conversation.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {conversation.unreadCount > 0 && (
        <div className="absolute right-3 top-3">
          <span className="w-5 h-5 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        </div>
      )}
      {conversation.isOverdue && (
        <div className="absolute right-2 bottom-2">
          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
            服务超时
          </span>
        </div>
      )}
    </div>
  )
}
