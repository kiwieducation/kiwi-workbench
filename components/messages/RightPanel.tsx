'use client'

import {
  UserCircle,
  BrainCircuit,
  FileText,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Send,
  ExternalLink,
  Youtube,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Conversation, MarketingMaterial, RiskStatus, ServiceTeam } from '@/types/entities'
import type { ConversationAnalysis } from '@/lib/ai'

type TabKey = 'profile' | 'ai' | 'feed'

interface RightPanelProps {
  conversation: Conversation | null
  aiAnalysis: ConversationAnalysis | null
  materials: MarketingMaterial[]
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  onUseScript: (script: string) => void
  onRefreshAnalysis?: () => void
  isAnalysisLoading?: boolean
}

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'profile', label: '客户画像', icon: UserCircle },
  { key: 'ai', label: 'AI教练', icon: BrainCircuit },
  { key: 'feed', label: '素材推送', icon: FileText },
]

/**
 * 右侧面板组件（客户画像/AI教练/素材推送）
 */
export function RightPanel({
  conversation,
  aiAnalysis,
  materials,
  activeTab,
  onTabChange,
  onUseScript,
  onRefreshAnalysis,
  isAnalysisLoading,
}: RightPanelProps) {
  return (
    <div className="w-80 border-l border-slate-200 flex flex-col bg-white">
      {/* Tab 切换 */}
      <div className="flex border-b border-slate-200">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'profile' && <ProfileTab conversation={conversation} />}
        {activeTab === 'ai' && (
          <AICoachTab
            analysis={aiAnalysis}
            onUseScript={onUseScript}
            onRefresh={onRefreshAnalysis}
            isLoading={isAnalysisLoading}
          />
        )}
        {activeTab === 'feed' && <MaterialsTab materials={materials} />}
      </div>
    </div>
  )
}

// ============================================
// 客户画像 Tab
// ============================================

function ProfileTab({ conversation }: { conversation: Conversation | null }) {
  if (!conversation) {
    return <div className="p-8 text-center text-slate-400 text-sm">选择会话查看客户画像</div>
  }

  return (
    <div className="divide-y divide-slate-100">
      <BasicInfoSection conversation={conversation} />
      {conversation.serviceProject && <ServiceStatusSection conversation={conversation} />}
      <TimelineSection conversation={conversation} />
      {conversation.serviceTeam && <ServiceTeamSection team={conversation.serviceTeam} />}
    </div>
  )
}

function BasicInfoSection({ conversation }: { conversation: Conversation }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-brand-100 text-brand-700">
            {conversation.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-slate-900">{conversation.name}</h4>
          {conversation.grade && (
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <GraduationCap size={12} /> {conversation.grade}
            </span>
          )}
        </div>
      </div>
      {conversation.tags && (
        <div className="flex flex-wrap gap-1.5">
          {conversation.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceStatusSection({ conversation }: { conversation: Conversation }) {
  const getRiskStyle = (status?: RiskStatus) => {
    switch (status) {
      case 'critical': return { color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle size={14} className="text-red-500" />, label: '风险' }
      case 'attention': return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle size={14} className="text-amber-500" />, label: '关注' }
      default: return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={14} className="text-emerald-500" />, label: '正常' }
    }
  }

  const risk = getRiskStyle(conversation.riskStatus)

  return (
    <div className="p-4 space-y-3">
      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">服务状态</h5>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">申请方向</span>
          <span className="font-medium text-slate-900">{conversation.serviceProject}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">服务阶段</span>
          <span className="font-medium text-slate-900">{conversation.serviceStage}</span>
        </div>
        {conversation.serviceProgress !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">服务进度</span>
              <span className="font-bold text-brand-600">{conversation.serviceProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${conversation.serviceProgress}%` }} />
            </div>
          </div>
        )}
        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${risk.color}`}>
          <div className="flex items-center gap-2">{risk.icon}<span className="text-xs font-bold">风险等级</span></div>
          <span className="text-xs font-bold">{risk.label}</span>
        </div>
      </div>
    </div>
  )
}

function TimelineSection({ conversation }: { conversation: Conversation }) {
  const items = [
    conversation.nextKeyNode && { label: conversation.nextKeyNode.label, date: conversation.nextKeyNode.date, active: true },
    conversation.lastFollowUp && { label: '最近跟进', date: conversation.lastFollowUp },
    conversation.contractDate && { label: '签约时间', date: conversation.contractDate },
    conversation.joinDate && { label: '添加时间', date: conversation.joinDate },
  ].filter(Boolean) as { label: string; date: string; active?: boolean }[]

  return (
    <div className="p-4">
      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">关键时间轴</h5>
      <div className="relative border-l-2 border-slate-100 ml-2 space-y-4">
        {items.map((item, i) => (
          <div key={i} className="ml-4 relative">
            <div className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${item.active ? 'bg-brand-500' : 'bg-slate-200'}`} />
            <div className={`text-xs ${item.active ? 'font-bold text-brand-600' : 'font-medium text-slate-500'}`}>{item.label}</div>
            <div className={`text-xs ${item.active ? 'text-slate-500' : 'text-slate-400'}`}>{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceTeamSection({ team }: { team: ServiceTeam }) {
  const members = [
    team.consultant && { name: team.consultant, role: '顾问', color: 'bg-blue-100 text-blue-700', short: '顾' },
    team.leadTutor && { name: team.leadTutor, role: '主导师', color: 'bg-purple-100 text-purple-700', short: '主' },
    team.associateTutor && { name: team.associateTutor, role: '协作导师', color: 'bg-slate-100 text-slate-700', short: '协' },
  ].filter(Boolean) as { name: string; role: string; color: string; short: string }[]

  return (
    <div className="p-4">
      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">服务团队</h5>
      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className={`text-[10px] ${m.color}`}>{m.short}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-700">{m.name}</span>
            <span className="text-xs text-slate-400">{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// AI 教练 Tab
// ============================================

interface AICoachTabProps {
  analysis: ConversationAnalysis | null
  onUseScript: (s: string) => void
  onRefresh?: () => void
  isLoading?: boolean
}

function AICoachTab({ analysis, onUseScript, onRefresh, isLoading }: AICoachTabProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-500">AI 分析中...</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="p-8 text-center text-slate-400">
        <BrainCircuit size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">暂无AI分析建议</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-3 text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 mx-auto"
          >
            <RefreshCw size={12} /> 触发分析
          </button>
        )}
      </div>
    )
  }

  // 情绪图标
  const sentimentIcon = {
    positive: <TrendingUp size={14} className="text-emerald-500" />,
    negative: <TrendingDown size={14} className="text-red-500" />,
    neutral: <Minus size={14} className="text-slate-400" />,
    mixed: <AlertCircle size={14} className="text-amber-500" />,
  }[analysis.sentiment.overall]

  const sentimentLabel = {
    positive: '积极',
    negative: '消极',
    neutral: '中性',
    mixed: '复杂',
  }[analysis.sentiment.overall]

  // 风险颜色
  const riskColors = {
    low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className="p-4 space-y-4">
      {/* 刷新按钮 */}
      {onRefresh && (
        <div className="flex justify-end">
          <button
            onClick={onRefresh}
            className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1"
          >
            <RefreshCw size={12} /> 重新分析
          </button>
        </div>
      )}

      {/* 意图分析 */}
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit size={16} className="text-purple-600" />
          <h4 className="text-sm font-bold text-purple-800">意图分析</h4>
          <span className="text-xs text-purple-500 ml-auto">
            置信度 {Math.round(analysis.intent.confidence * 100)}%
          </span>
        </div>
        <p className="text-sm text-purple-700 font-medium">{analysis.intent.primary}</p>
        {analysis.intent.secondary && analysis.intent.secondary.length > 0 && (
          <div className="flex gap-1 mt-2">
            {analysis.intent.secondary.map((intent, i) => (
              <span key={i} className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                {intent}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 情绪分析 */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          {sentimentIcon}
          <h4 className="text-sm font-bold text-slate-700">情绪状态</h4>
          <span className="text-xs text-slate-500 ml-auto">{sentimentLabel}</span>
        </div>
        {analysis.sentiment.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {analysis.sentiment.emotions.map((emotion, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {emotion}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 关键点 */}
      {analysis.keyPoints.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">关键信息</h4>
          <div className="space-y-2">
            {analysis.keyPoints.map((point, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border text-sm ${
                  point.importance === 'high'
                    ? 'bg-red-50 border-red-100 text-red-700'
                    : point.importance === 'medium'
                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                    : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}
              >
                <div className="font-medium">{point.topic}</div>
                {point.context && <div className="text-xs opacity-75 mt-0.5">{point.context}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 风险评估 */}
      <div className={`p-3 rounded-xl border ${riskColors[analysis.riskAssessment.level]}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={14} />
          <span className="text-xs font-bold">风险等级：{analysis.riskAssessment.level.toUpperCase()}</span>
        </div>
        {analysis.riskAssessment.factors.length > 0 && (
          <ul className="text-xs space-y-1 ml-5 list-disc">
            {analysis.riskAssessment.factors.map((factor, i) => (
              <li key={i}>{factor}</li>
            ))}
          </ul>
        )}
        {analysis.riskAssessment.suggestions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-current/10">
            <div className="text-xs font-medium mb-1">建议：</div>
            <ul className="text-xs space-y-1 ml-5 list-disc">
              {analysis.riskAssessment.suggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 推荐话术 */}
      {analysis.suggestedReplies.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">推荐话术</h4>
          <div className="space-y-2">
            {analysis.suggestedReplies.map((reply, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-slate-400">语气：{reply.tone}</span>
                  {reply.priority === 1 && (
                    <span className="text-xs bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded">推荐</span>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-2">{reply.content}</p>
                <button
                  onClick={() => onUseScript(reply.content)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-slate-50 text-slate-600 py-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <Copy size={12} /> 采纳话术
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 元数据 */}
      <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-100">
        由 {analysis.metadata.provider}/{analysis.metadata.model} 提供
        {analysis.metadata.processingTime && ` · ${analysis.metadata.processingTime}ms`}
      </div>
    </div>
  )
}

// ============================================
// 素材推送 Tab
// ============================================

function MaterialsTab({ materials }: { materials: MarketingMaterial[] }) {
  return (
    <div>
      <div className="px-4 py-3 bg-orange-50/50 border-b border-orange-100">
        <h4 className="text-xs font-bold text-orange-800 flex items-center gap-1">
          <Sparkles size={12} /> 公众号/视频号更新
        </h4>
      </div>
      <div className="divide-y divide-slate-100">
        {materials.map((item) => (
          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex gap-3 mb-2">
              <div className={`w-14 h-10 rounded flex items-center justify-center flex-shrink-0 ${item.type === 'video' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                {item.type === 'video' ? <Youtube size={16} className="text-white" /> : <FileText size={16} className="text-slate-500" />}
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{item.title}</h5>
                <span className="text-[10px] text-slate-400">{item.source} · {item.date}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded mb-2 border border-slate-100">
              <span className="font-semibold text-slate-400 mr-1">话术：</span>{item.summary}
            </p>
            <div className="flex gap-2">
              <button className="flex-1 text-[10px] font-medium bg-white border border-slate-200 py-1.5 rounded text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-colors flex items-center justify-center gap-1">
                <ExternalLink size={10} /> 预览
              </button>
              <button className="flex-1 text-[10px] font-bold bg-brand-50 border border-brand-100 py-1.5 rounded text-brand-700 hover:bg-brand-100 transition-colors flex items-center justify-center gap-1">
                <Send size={10} /> 发送素材
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
