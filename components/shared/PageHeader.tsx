import Link from 'next/link'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  title: string
  description?: string
  // 返回按钮
  backHref?: string
  // 状态标签
  badges?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }[]
  // 操作按钮
  actions?: {
    label: string
    icon?: LucideIcon
    variant?: 'default' | 'outline' | 'ghost'
    onClick?: () => void
    href?: string
  }[]
  // 额外内容
  children?: React.ReactNode
  className?: string
}

/**
 * 页面头部组件
 * 
 * 支持：
 * - 标题和描述
 * - 返回按钮
 * - 状态标签
 * - 操作按钮
 */
export function PageHeader({
  title,
  description,
  backHref,
  badges,
  actions,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`px-6 py-5 bg-white border-b border-slate-200 shadow-sm ${className}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          {/* 返回按钮 */}
          {backHref && (
            <Link href={backHref} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-0.5">
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
          )}
          
          <div>
            {/* 标题行 */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {badges && badges.map((badge, i) => (
                <Badge key={i} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </div>
            
            {/* 描述 */}
            {description && (
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        {actions && actions.length > 0 && (
          <div className="flex gap-3">
            {actions.map((action, i) => {
              const Icon = action.icon
              const button = (
                <Button key={i} variant={action.variant || 'default'} onClick={action.onClick}>
                  {Icon && <Icon size={16} className="mr-2" />}
                  {action.label}
                </Button>
              )
              return action.href ? (
                <Link key={i} href={action.href}>{button}</Link>
              ) : button
            })}
          </div>
        )}
      </div>

      {/* 额外内容 */}
      {children}
    </div>
  )
}
