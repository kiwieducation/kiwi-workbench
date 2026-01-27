'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/shared/Toast'
import {
  createCustomer,
  updateCustomer,
  customerStageConfig,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from '@/lib/services/customer.service'
import type { SalesCustomer, SalesStage } from '@/types/entities'

interface CustomerFormProps {
  customer?: SalesCustomer | null
  onSuccess: (customer: SalesCustomer) => void
  onCancel: () => void
}

/**
 * 客户表单（新建/编辑）
 */
export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const toast = useToast()
  const isEditing = !!customer

  // 表单状态
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    wechat: customer?.wechat || '',
    source: customer?.source || '',
    stage: customer?.stage || 'new' as SalesStage,
    tags: customer?.tags?.join(', ') || '',
    notes: customer?.notes || '',
    studentName: customer?.studentName || '',
    grade: customer?.grade || '',
    targetCountry: customer?.targetCountry || '',
    budget: customer?.budget || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 更新字段
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // 验证表单
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入客户姓名'
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t)

    if (isEditing && customer) {
      // 更新客户
      const input: UpdateCustomerInput = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        wechat: formData.wechat || undefined,
        source: formData.source || undefined,
        stage: formData.stage,
        tags: tags.length > 0 ? tags : undefined,
        notes: formData.notes || undefined,
        studentName: formData.studentName || undefined,
        grade: formData.grade || undefined,
        targetCountry: formData.targetCountry || undefined,
        budget: formData.budget || undefined,
      }

      const result = await updateCustomer(customer.id, input)

      if (result.success) {
        toast.success('更新成功', '客户信息已更新')
        onSuccess(result.data)
      } else {
        toast.error('更新失败', result.error.message)
      }
    } else {
      // 创建客户
      const input: CreateCustomerInput = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        wechat: formData.wechat || undefined,
        source: formData.source || undefined,
        stage: formData.stage,
        tags: tags.length > 0 ? tags : undefined,
        notes: formData.notes || undefined,
        studentName: formData.studentName || undefined,
        grade: formData.grade || undefined,
        targetCountry: formData.targetCountry || undefined,
        budget: formData.budget || undefined,
      }

      const result = await createCustomer(input)

      if (result.success) {
        toast.success('创建成功', '新客户已添加')
        onSuccess(result.data)
      } else {
        toast.error('创建失败', result.error.message)
      }
    }

    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? '编辑客户' : '新建客户'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4">
            {/* 基本信息 */}
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-slate-700 mb-3">基本信息</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                客户姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                placeholder="输入客户姓名"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">手机号</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                placeholder="输入手机号"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                placeholder="输入邮箱"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">微信号</label>
              <input
                type="text"
                value={formData.wechat}
                onChange={(e) => updateField('wechat', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="输入微信号"
              />
            </div>

            {/* 销售信息 */}
            <div className="col-span-2 mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">销售信息</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户来源</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => updateField('source', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="如：小红书、转介绍、官网"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户阶段</label>
              <select
                value={formData.stage}
                onChange={(e) => updateField('stage', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Object.entries(customerStageConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">标签</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => updateField('tags', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="用逗号分隔，如：VIP, 美本, 高意向"
              />
            </div>

            {/* 学员信息 */}
            <div className="col-span-2 mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">学员信息</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">学员姓名</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => updateField('studentName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="输入学员姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">年级</label>
              <select
                value={formData.grade}
                onChange={(e) => updateField('grade', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">请选择</option>
                <option value="初一">初一</option>
                <option value="初二">初二</option>
                <option value="初三">初三</option>
                <option value="高一">高一</option>
                <option value="高二">高二</option>
                <option value="高三">高三</option>
                <option value="大一">大一</option>
                <option value="大二">大二</option>
                <option value="大三">大三</option>
                <option value="大四">大四</option>
                <option value="研一">研一</option>
                <option value="研二">研二</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">目标国家</label>
              <input
                type="text"
                value={formData.targetCountry}
                onChange={(e) => updateField('targetCountry', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="如：美国、英国、美国/英国"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">预算范围</label>
              <select
                value={formData.budget}
                onChange={(e) => updateField('budget', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">请选择</option>
                <option value="10万以下">10万以下</option>
                <option value="10-30万">10-30万</option>
                <option value="30-50万">30-50万</option>
                <option value="50万+">50万+</option>
              </select>
            </div>

            {/* 备注 */}
            <div className="col-span-2 mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="输入备注信息..."
              />
            </div>
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : isEditing ? '保存' : '创建'}
          </Button>
        </div>
      </div>
    </div>
  )
}
