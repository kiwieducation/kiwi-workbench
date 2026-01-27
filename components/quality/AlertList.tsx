'use client'

import Link from 'next/link'
import {
  Clock,
  Calendar,
  AlertTriangle,
  Frown,
  MessageSquareWarning,
  ClipboardList,
  FileText,
  MoreHorizontal,
  User,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  alertTypeConfig,
  severityConfig,
  alertStatusConfig,
  type QualityAlert,
  type QualityAlertType,
} from '@/types/entities'

interface AlertListProps {
  alerts: QualityAlert[]
  onAlertClick?: (alert: QualityAlert) => void
  onResolve?: (alert: QualityAlert) => void
  emptyTitle?: string
  emptyDescription?: string
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Clock: Clock,
  Calendar: Calendar,
  AlertTriangle: AlertTriangle,
  Frown: Frown,
  MessageSquareWarning: MessageSquareWarning,
  ClipboardList: ClipboardList,
  FileText: FileText,
}

/**
 * 预警列表组件
 */
export function AlertList({
  alerts,
  onAlertClick,
  onResolve,
  emptyTitle = '暂无预警',
  emptyDescription = '当前没有需要处理的预警',
}: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        variant="default"
        title={emptyTitle}
        description={emptyDescription}
        icon={AlertTriangle}
      />
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onClick={() => onAlertClick?.(alert)}
          onResolve={() => onResolve?.(alert)}
        />
      ))}
    </div>
  )
}

interface AlertItemProps {
  alert: QualityAlert
  onClick?: () => void
  onResolve?: () => void
}

function AlertItem({ alert, onClick, onResolve }: AlertItemProps) {
  const typeConfig = alertTypeConfig[alert.type]
  const severity = severityConfig[alert.severity]
  const status = alertStatusConfig[alert.status]
  const Icon = iconMap[typeConfig.icon] || AlertTriangle

  return (
    <div
      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
        alert.status === 'resolved' ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* 图标 */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${severity.bgColor}`}>
          <Icon size={20} className={severity.color} />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 truncate">{alert.title}</h4>
            <Badge variant="outline" className={`text-[10px] ${severity.color}`}>
              {severity.label}
            </Badge>
            <Badge variant="secondary" className={`text-[10px] ${status.color}`}>
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mb-2">{alert.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {alert.createdAt}
            </span>
            {alert.assignee && (
              <span className="flex items-center gap-1">
                <User size={12} />
                {alert.assignee}
              </span>
            )}
            <Link
              href={`/${alert.relatedType === 'conversation' ? 'messages' : 
                      alert.relatedType === 'customer' ? 'sales/customers/' + alert.relatedId : 
                      'projects'}`}
              className="flex items-center gap-1 text-brand-600 hover:text-brand-700"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={12} />
              {alert.relatedName}
            </Link>
          </div>
        </div>

        {/* 操作 */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {alert.status === 'pending' && (
            <button
              onClick={onResolve}
              className="px-3 py-1.5 text-xs font-medium bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors"
            >
              处理
            </button>
          )}
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 预警卡片组件（用于仪表板）
// ============================================

interface AlertCardProps {
  alert: QualityAlert
  onClick?: () => void
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const typeConfig = alertTypeConfig[alert.type]
  const severity = severityConfig[alert.severity]
  const Icon = iconMap[typeConfig.icon] || AlertTriangle

  return (
    <div
      className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-brand-200 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${severity.bgColor}`}>
          <Icon size={16} className={severity.color} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 text-sm truncate">{alert.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{alert.relatedName}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${severity.color}`}>
          {severity.label}
        </Badge>
      </div>
    </div>
  )
}
