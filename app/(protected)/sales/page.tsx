import Link from 'next/link'
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockCustomers, customerStageConfig } from '@/lib/mock/data'

/**
 * 销售工作台首页
 * 
 * 对齐 v8.0 PRD：
 * - KPI 卡片
 * - 快捷入口
 * - 销售漏斗概览
 */
export default function SalesPage() {
  // 统计各阶段客户数
  const stageStats = {
    new: mockCustomers.filter(c => c.stage === 'new').length,
    following: mockCustomers.filter(c => c.stage === 'following').length,
    proposal: mockCustomers.filter(c => c.stage === 'proposal').length,
    signed: mockCustomers.filter(c => c.stage === 'signed').length,
    lost: mockCustomers.filter(c => c.stage === 'lost').length,
  }

  const kpis = [
    { label: '本月新增客户', value: 28, change: 12, trend: 'up', icon: Users },
    { label: '跟进中客户', value: stageStats.following + stageStats.proposal, change: 5, trend: 'up', icon: TrendingUp },
    { label: '本月签约', value: 6, change: 2, trend: 'up', icon: FileText },
    { label: '本月业绩', value: '¥128万', change: 18, trend: 'up', icon: DollarSign },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">销售工作台</h1>
          <p className="text-sm text-slate-500 mt-1">管理客户资源，跟踪销售进度</p>
        </div>
        <Link href="/sales/customers">
          <Button>
            <Users size={16} className="mr-2" />
            客户列表
          </Button>
        </Link>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <Icon size={20} className="text-brand-600" />
                  </div>
                  <div className={`text-xs font-medium flex items-center gap-1 ${
                    kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {kpi.change}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                <div className="text-sm text-slate-500">{kpi.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 销售漏斗 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>销售漏斗</span>
            <Link href="/sales/customers" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center">
              查看详情 <ChevronRight size={16} />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4 h-48">
            {[
              { key: 'new', count: stageStats.new },
              { key: 'following', count: stageStats.following },
              { key: 'proposal', count: stageStats.proposal },
              { key: 'signed', count: stageStats.signed },
            ].map((item, idx) => {
              const config = customerStageConfig[item.key as keyof typeof customerStageConfig]
              const maxCount = Math.max(stageStats.new, stageStats.following, stageStats.proposal, stageStats.signed, 1)
              const height = Math.max((item.count / maxCount) * 100, 20)
              
              return (
                <div key={item.key} className="flex-1 flex flex-col items-center">
                  <div className="text-2xl font-bold text-slate-900 mb-2">{item.count}</div>
                  <div 
                    className={`w-full rounded-t-lg ${config.color.replace('text-', 'bg-').replace('-700', '-500').replace('-100', '-200')}`}
                    style={{ height: `${height}%` }}
                  />
                  <div className="mt-3 text-sm font-medium text-slate-600">{config.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/sales/customers">
          <Card className="hover:shadow-md hover:border-brand-200 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">客户管理</h3>
                <p className="text-sm text-slate-500">查看和管理所有客户</p>
              </div>
              <ChevronRight size={20} className="ml-auto text-slate-400" />
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md hover:border-brand-200 transition-all cursor-pointer h-full opacity-60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <FileText size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">合同管理</h3>
              <p className="text-sm text-slate-500">合同签署与跟踪</p>
            </div>
            <ChevronRight size={20} className="ml-auto text-slate-400" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:border-brand-200 transition-all cursor-pointer h-full opacity-60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">业绩看板</h3>
              <p className="text-sm text-slate-500">个人与团队业绩</p>
            </div>
            <ChevronRight size={20} className="ml-auto text-slate-400" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
