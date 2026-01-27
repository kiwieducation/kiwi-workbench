'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { QualityMetric } from '@/types/entities'

interface MetricCardsProps {
  metrics: QualityMetric[]
}

/**
 * 质检指标卡片组件
 */
export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <MetricCard key={idx} metric={metric} />
      ))}
    </div>
  )
}

interface MetricCardProps {
  metric: QualityMetric
}

function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="text-slate-500 text-sm font-medium mb-1">
          {metric.label}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className={`text-3xl font-bold ${metric.color || 'text-slate-900'}`}>
              {metric.value}
            </span>
            {metric.total !== undefined && (
              <span className="text-lg text-slate-400 ml-1">/ {metric.total}</span>
            )}
          </div>
          {metric.change !== undefined && metric.trend && (
            <div className={`text-xs font-medium flex items-center gap-1 ${
              metric.trend === 'up' ? 'text-red-500' : 
              metric.trend === 'down' ? 'text-emerald-600' : 
              'text-slate-500'
            }`}>
              {metric.trend === 'up' ? (
                <ArrowUpRight size={14} />
              ) : metric.trend === 'down' ? (
                <ArrowDownRight size={14} />
              ) : null}
              {metric.change > 0 ? '+' : ''}{metric.change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
