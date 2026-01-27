import { LucideIcon, SearchX, AlertCircle, FolderOpen, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EmptyStateVariant } from '@/types/entities'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: FolderOpen,
  search: SearchX,
  error: AlertCircle,
  'no-permission': Lock,
}

/**
 * 空状态组件
 * 
 * 用于列表为空、搜索无结果、错误状态等场景
 */
export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant]

  return (
    <div className={`py-16 text-center ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <Icon size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
