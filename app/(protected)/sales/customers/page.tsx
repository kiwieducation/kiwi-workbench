'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Phone,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/Toast'
import { CustomerForm, StageDropdown } from '@/components/customers'
import {
  getCustomers,
  customerStageConfig,
  riskLevelConfig,
  archiveCustomer,
  type CustomerFilters,
} from '@/lib/services/customer.service'
import type { SalesCustomer, SalesStage, RiskLevel } from '@/types/entities'

/**
 * 销售工作台 - 客户列表页
 * 
 * 对齐 v8.0 PRD + AI Studio 设计母版：
 * - 表格列表展示
 * - 多维度筛选（阶段、负责人、风险等级）
 * - 批量操作
 * - 新建/编辑/阶段更新
 * 
 * 数据源：Supabase customers 表
 */
export default function CustomersPage() {
  const toast = useToast()
  
  // 数据状态
  const [customers, setCustomers] = useState<SalesCustomer[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // UI 状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'team'>('my')
  const [stageFilter, setStageFilter] = useState<SalesStage | 'all'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // 表单状态
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<SalesCustomer | null>(null)

  // 加载客户数据
  const loadCustomers = async () => {
    setIsLoading(true)
    
    const filters: CustomerFilters = {
      search: searchQuery || undefined,
      stage: stageFilter,
      page,
      pageSize,
    }
    
    const result = await getCustomers(filters)
    
    if (result.success) {
      setCustomers(result.data.data)
      setTotal(result.data.total)
    } else {
      toast.error('加载客户列表失败', result.error.message)
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    loadCustomers()
  }, [searchQuery, stageFilter, page])

  // 搜索防抖
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
      setPage(1) // 搜索时重置页码
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // 选择操作
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === customers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(customers.map(c => c.id)))
    }
  }

  // 风险图标
  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return <AlertCircle size={14} className="text-red-500" />
      case 'medium':
        return <AlertTriangle size={14} className="text-amber-500" />
      default:
        return <CheckCircle2 size={14} className="text-emerald-500" />
    }
  }

  // 计算分页
  const totalPages = Math.ceil(total / pageSize)

  // 新建客户
  const handleCreate = () => {
    setEditingCustomer(null)
    setShowForm(true)
  }

  // 编辑客户
  const handleEdit = (customer: SalesCustomer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  // 表单成功回调
  const handleFormSuccess = (customer: SalesCustomer) => {
    setShowForm(false)
    setEditingCustomer(null)
    loadCustomers() // 重新加载数据
  }

  // 删除客户（归档）
  const handleArchive = async (customer: SalesCustomer) => {
    if (!confirm(`确定要将 ${customer.name} 标记为已流失吗？`)) return

    const result = await archiveCustomer(customer.id)
    if (result.success) {
      toast.success('操作成功', `${customer.name} 已标记为已流失`)
      loadCustomers()
    } else {
      toast.error('操作失败', result.error.message)
    }
  }

  // 阶段更新回调
  const handleStageUpdate = (updatedCustomer: SalesCustomer) => {
    setCustomers(prev =>
      prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50">
      {/* 表单弹窗 */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingCustomer(null)
          }}
        />
      )}

      {/* ========== 头部区域 ========== */}
      <div className="px-6 py-5 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">客户列表</h1>
            <p className="text-sm text-slate-500 mt-1">管理您的客户资源，跟踪销售进度</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              导出
            </Button>
            <Button onClick={handleCreate}>
              <Plus size={16} className="mr-2" />
              新建客户
            </Button>
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="flex flex-col gap-4">
          {/* Tab 切换 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[
                { key: 'all', label: '全部客户' },
                { key: 'my', label: '我的客户' },
                { key: 'team', label: '团队公海' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 搜索框 */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索姓名、手机号..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 筛选条件 */}
          <div className="flex items-center gap-3">
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value as SalesStage | 'all')
                setPage(1) // 筛选时重置页码
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">全部阶段</option>
              <option value="new">新咨询</option>
              <option value="following">跟进中</option>
              <option value="proposal">方案制定</option>
              <option value="signed">已签约</option>
              <option value="lost">已流失</option>
            </select>

            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-brand-300">
              <span className="font-medium">负责人</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-brand-300">
              <span className="font-medium">风险等级</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-brand-300">
              <Filter size={14} />
              <span className="font-medium">更多筛选</span>
            </button>

            {(searchQuery || stageFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStageFilter('all')
                }}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                重置筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== 表格区域 ========== */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
            </div>
          ) : customers.length > 0 ? (
            <>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4 w-14">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === customers.length && customers.length > 0}
                        onChange={toggleAll}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th className="px-4 py-4">客户信息</th>
                    <th className="px-4 py-4">阶段</th>
                    <th className="px-4 py-4">负责人</th>
                    <th className="px-4 py-4">最近跟进</th>
                    <th className="px-4 py-4">风险</th>
                    <th className="px-4 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {customers.map((customer) => {
                    const stageConfig = customerStageConfig[customer.stage]
                    const riskConfig = riskLevelConfig[customer.riskLevel]
                    
                    return (
                      <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(customer.id)}
                            onChange={() => toggleSelection(customer.id)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/sales/customers/${customer.id}`} className="flex items-center gap-3 group">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                                {customer.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                                {customer.name}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <Phone size={10} />
                                {customer.phone}
                              </div>
                            </div>
                          </Link>
                          {customer.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {customer.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <StageDropdown customer={customer} onUpdate={handleStageUpdate} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-slate-200">
                                {customer.owner.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-700">{customer.owner}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-slate-900">{customer.lastContact}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Calendar size={10} />
                            {customer.nextAction}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`flex items-center gap-1.5 ${riskConfig.color}`}>
                            {getRiskIcon(customer.riskLevel)}
                            <span className="text-xs font-medium">{riskConfig.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                              title="编辑"
                            >
                              <Edit size={14} />
                            </button>
                            <Link href={`/sales/customers/${customer.id}`}>
                              <Button variant="ghost" size="sm">
                                查看
                              </Button>
                            </Link>
                            {customer.stage !== 'lost' && (
                              <button
                                onClick={() => handleArchive(customer)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="标记流失"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* 分页器 */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="text-sm text-slate-500">
                  共 <span className="font-medium text-slate-900">{total}</span> 条记录
                  {selectedIds.size > 0 && (
                    <span className="ml-2">
                      （已选择 <span className="font-medium text-brand-600">{selectedIds.size}</span> 条）
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                          page === pageNum
                            ? 'bg-brand-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              variant="search"
              title="暂无客户数据"
              description={searchQuery ? '没有找到匹配的客户，尝试调整搜索条件' : '点击右上角"新建客户"添加第一个客户'}
              icon={Users}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
