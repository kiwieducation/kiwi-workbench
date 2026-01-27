'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertList, MetricCards } from '@/components/quality'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/Toast'
import {
  getQualityAlerts,
  getQualityMetrics,
  resolveAlert,
} from '@/lib/services/quality.service'
import {
  alertTypeConfig,
  severityConfig,
  alertStatusConfig,
  type QualityAlert,
  type QualityMetric,
  type QualityAlertType,
  type AlertSeverity,
  type AlertStatus,
} from '@/types/entities'

/**
 * 管理质检中心
 * 
 * 对齐 v8.0 PRD：
 * - KPI 概览卡片（从会话数据聚合）
 * - 多维度筛选
 * - 风控预警列表（基于会话数据生成）
 * - 处理/忽略操作（预留）
 */
export default function QualityPage() {
  const toast = useToast()

  // 数据状态
  const [alerts, setAlerts] = useState<QualityAlert[]>([])
  const [metrics, setMetrics] = useState<QualityMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 筛选
  const [typeFilter, setTypeFilter] = useState<QualityAlertType | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('pending')

  // 加载数据
  useEffect(() => {
    loadData()
  }, [typeFilter, severityFilter, statusFilter])

  const loadData = async () => {
    setIsLoading(true)
    
    const [alertsResult, metricsResult] = await Promise.all([
      getQualityAlerts({
        type: typeFilter,
        severity: severityFilter,
        status: statusFilter,
      }),
      getQualityMetrics(),
    ])
    
    if (alertsResult.success) {
      setAlerts(alertsResult.data)
    } else {
      toast.error('加载预警列表失败', alertsResult.error.message)
      setAlerts([])
    }
    
    if (metricsResult.success) {
      setMetrics(metricsResult.data)
    } else {
      // 指标加载失败不阻塞页面，使用空数据
      setMetrics([])
    }
    
    setIsLoading(false)
  }

  // 刷新数据
  const handleRefresh = () => {
    loadData()
    toast.info('刷新中', '正在重新加载数据')
  }

  // 处理预警
  const handleResolve = async (alert: QualityAlert) => {
    const result = await resolveAlert({ alertId: alert.id })
    if (result.success) {
      toast.success('处理成功', `预警 "${alert.title}" 已标记为已处理`)
      loadData() // 重新加载数据
    } else {
      toast.error('处理失败', result.error.message)
    }
  }

  // 忽略预警
  const handleIgnore = async (alert: QualityAlert) => {
    const { ignoreAlert } = await import('@/lib/services/quality.service')
    const result = await ignoreAlert(alert.id, '用户手动忽略')
    if (result.success) {
      toast.success('已忽略', `预警 "${alert.title}" 已忽略`)
      loadData()
    } else {
      toast.error('操作失败', result.error.message)
    }
  }

  // 重置筛选
  const handleResetFilters = () => {
    setTypeFilter('all')
    setSeverityFilter('all')
    setStatusFilter('pending')
  }

  const hasActiveFilters = typeFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'pending'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50">
      {/* 页面头部 */}
      <PageHeader
        title="管理质检中心"
        description="监控服务质量，及时处理风险预警"
        actions={[
          {
            label: '导出报告',
            icon: Download,
            variant: 'outline',
            onClick: () => console.log('Export'),
          },
          {
            label: '刷新',
            icon: RefreshCw,
            variant: 'outline',
            onClick: handleRefresh,
          },
        ]}
      />

      <div className="p-6 space-y-6">
        {/* KPI 指标卡片 */}
        <MetricCards metrics={metrics} />

        {/* 预警列表 */}
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} className="text-brand-600" />
                风险预警列表
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* 状态筛选 Tab */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  {[
                    { key: 'pending', label: '待处理' },
                    { key: 'processing', label: '处理中' },
                    { key: 'resolved', label: '已解决' },
                    { key: 'all', label: '全部' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key as AlertStatus | 'all')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        statusFilter === tab.key
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          {/* 筛选栏 */}
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            {/* 类型筛选 */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as QualityAlertType | 'all')}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">全部类型</option>
              {Object.entries(alertTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            {/* 严重程度筛选 */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">全部严重程度</option>
              {Object.entries(severityConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                重置筛选
              </button>
            )}

            <div className="flex-1" />

            <span className="text-sm text-slate-500">
              共 <span className="font-medium text-slate-900">{alerts.length}</span> 条预警
            </span>
          </div>

          {/* 预警列表 */}
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <AlertList
                alerts={alerts}
                onAlertClick={(alert) => console.log('Click alert:', alert.id)}
                onResolve={handleResolve}
                emptyTitle={hasActiveFilters ? '没有找到匹配的预警' : '暂无待处理预警'}
                emptyDescription={hasActiveFilters ? '尝试调整筛选条件' : '当前没有需要处理的风险预警'}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
