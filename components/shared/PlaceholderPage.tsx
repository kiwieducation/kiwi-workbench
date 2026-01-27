import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: LucideIcon
}

/**
 * 占位页组件
 * 用于尚未实现的模块，保证导航闭环
 */
export function PlaceholderPage({ 
  title, 
  description = '该模块正在开发中，敬请期待',
  icon: Icon = Construction 
}: PlaceholderPageProps) {
  return (
    <div className="p-6 h-full flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon size={32} className="text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-500 text-sm">{description}</p>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Phase 2 / Phase 3 实现
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
