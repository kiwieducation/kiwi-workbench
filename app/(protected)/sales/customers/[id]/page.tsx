'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Edit2,
  Plus,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  User,
  GraduationCap,
  Globe,
  Wallet,
  History,
  ClipboardList,
  Folder,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  mockCustomers,
  mockCustomerTimeline,
  customerStageConfig,
  riskLevelConfig,
} from '@/lib/mock/data'

/**
 * 销售工作台 - 客户详情页
 * 
 * 对齐 v8.0 PRD + AI Studio 设计母版：
 * - Hero 区：客户基本信息、状态、操作按钮
 * - 左栏：时间轴、任务列表、文件列表
 * - 右栏：联系方式、关键属性、服务团队、系统信息
 */
export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks' | 'files'>('timeline')

  // 查找客户数据
  const customer = mockCustomers.find(c => c.id === customerId)
  const timeline = mockCustomerTimeline[customerId] || []

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <User size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">客户不存在</h3>
          <p className="text-sm text-slate-500 mb-4">请检查客户ID是否正确</p>
          <Link href="/sales/customers">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              返回客户列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const stageConfig = customerStageConfig[customer.stage]
  const riskConfig = riskLevelConfig[customer.riskLevel]

  // 时间轴图标
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone size={14} />
      case 'note':
        return <FileText size={14} />
      case 'contract':
        return <CheckCircle2 size={14} />
      case 'email':
        return <Mail size={14} />
      case 'meeting':
        return <Calendar size={14} />
      default:
        return <Clock size={14} />
    }
  }

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-500'
      case 'contract':
        return 'bg-emerald-500'
      case 'email':
        return 'bg-purple-500'
      case 'meeting':
        return 'bg-amber-500'
      default:
        return 'bg-slate-400'
    }
  }

  // 风险图标
  const getRiskIcon = () => {
    switch (customer.riskLevel) {
      case 'high':
        return <AlertCircle size={14} className="text-red-500" />
      case 'medium':
        return <AlertTriangle size={14} className="text-amber-500" />
      default:
        return <CheckCircle2 size={14} className="text-emerald-500" />
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50">
      {/* ========== 顶部导航 ========== */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sales/customers" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stageConfig.color}`}>
                  {stageConfig.label}
                </span>
                <span className="text-xs text-slate-400">ID: {customer.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Edit2 size={16} className="mr-2" />
              编辑
            </Button>
            <Button>
              <Plus size={16} className="mr-2" />
              添加跟进
            </Button>
          </div>
        </div>
      </div>

      {/* ========== 主内容区 ========== */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左栏：2/3 宽度 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero 卡片 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-brand-100 text-brand-700 text-xl">
                      {customer.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${stageConfig.color}`}>
                        {stageConfig.label}
                      </span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${riskConfig.bgColor}`}>
                        {getRiskIcon()}
                        <span className={`text-xs font-medium ${riskConfig.color}`}>{riskConfig.label}</span>
                      </div>
                    </div>
                    {customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {customer.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500">来源</div>
                        <div className="font-medium text-slate-900">{customer.source}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">负责人</div>
                        <div className="font-medium text-slate-900">{customer.owner}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">最近跟进</div>
                        <div className="font-medium text-slate-900">{customer.lastContact}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">下一步动作</div>
                        <div className="font-medium text-brand-600">{customer.nextAction}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 标签页内容 */}
            <Card>
              <div className="border-b border-slate-200">
                <div className="flex">
                  {[
                    { key: 'timeline', label: '时间轴', icon: History },
                    { key: 'tasks', label: '任务', icon: ClipboardList },
                    { key: 'files', label: '文件', icon: Folder },
                  ].map(tab => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.key
                            ? 'border-brand-500 text-brand-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <CardContent className="p-6">
                {/* 时间轴 Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {timeline.length > 0 ? (
                      <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                        {timeline.map((event) => (
                          <div key={event.id} className="relative pl-8">
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${getTimelineColor(event.type)} flex items-center justify-center text-white`}>
                              {getTimelineIcon(event.type)}
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-slate-900">{event.title}</h4>
                                <span className="text-xs text-slate-400">{event.created_at}</span>
                              </div>
                              {event.description && (
                                <p className="text-sm text-slate-600">{event.description}</p>
                              )}
                              <div className="text-xs text-slate-400 mt-2">
                                操作人：{event.created_by}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <History size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">暂无跟进记录</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 任务 Tab */}
                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-900">待办任务</h4>
                      <Button variant="outline" size="sm">
                        <Plus size={14} className="mr-1" /> 新建任务
                      </Button>
                    </div>
                    <div className="text-center py-8 text-slate-400">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">暂无待办任务</p>
                    </div>
                  </div>
                )}

                {/* 文件 Tab */}
                {activeTab === 'files' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-900">相关文件</h4>
                      <Button variant="outline" size="sm">
                        <Plus size={14} className="mr-1" /> 上传文件
                      </Button>
                    </div>
                    <div className="text-center py-8 text-slate-400">
                      <Folder size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">暂无相关文件</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右栏：1/3 宽度 */}
          <div className="space-y-6">
            {/* 联系方式 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">联系方式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">电话</div>
                    <div className="text-sm font-medium text-slate-900">{customer.phone}</div>
                  </div>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Mail size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">邮箱</div>
                      <div className="text-sm font-medium text-slate-900">{customer.email}</div>
                    </div>
                  </div>
                )}
                {customer.wechat && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <MessageSquare size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">微信</div>
                      <div className="text-sm font-medium text-slate-900">{customer.wechat}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 关键属性 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">关键属性</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.studentName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User size={14} /> 学员姓名
                    </span>
                    <span className="font-medium text-slate-900">{customer.studentName}</span>
                  </div>
                )}
                {customer.grade && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <GraduationCap size={14} /> 年级
                    </span>
                    <span className="font-medium text-slate-900">{customer.grade}</span>
                  </div>
                )}
                {customer.targetCountry && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Globe size={14} /> 目标国家
                    </span>
                    <span className="font-medium text-slate-900">{customer.targetCountry}</span>
                  </div>
                )}
                {customer.budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Wallet size={14} /> 预算
                    </span>
                    <span className="font-medium text-slate-900">{customer.budget}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 系统信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">系统信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">创建时间</span>
                  <span className="text-slate-900">{customer.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">最后更新</span>
                  <span className="text-slate-900">{customer.updatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">客户来源</span>
                  <span className="text-slate-900">{customer.source}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
