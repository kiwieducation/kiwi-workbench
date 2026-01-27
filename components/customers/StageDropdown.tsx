'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useToast } from '@/components/shared/Toast'
import { updateCustomerStage, customerStageConfig } from '@/lib/services/customer.service'
import type { SalesStage, SalesCustomer } from '@/types/entities'

interface StageDropdownProps {
  customer: SalesCustomer
  onUpdate: (customer: SalesCustomer) => void
}

/**
 * 客户阶段下拉选择器
 */
export function StageDropdown({ customer, onUpdate }: StageDropdownProps) {
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const currentConfig = customerStageConfig[customer.stage]

  const handleSelect = async (stage: SalesStage) => {
    if (stage === customer.stage) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    const result = await updateCustomerStage(customer.id, stage)

    if (result.success) {
      toast.success('更新成功', `已将 ${customer.name} 更新为"${customerStageConfig[stage].label}"`)
      onUpdate(result.data)
    } else {
      toast.error('更新失败', result.error.message)
    }

    setIsUpdating(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${currentConfig.color} ${
          isUpdating ? 'opacity-50 cursor-wait' : 'hover:opacity-80 cursor-pointer'
        }`}
      >
        {isUpdating ? '更新中...' : currentConfig.label}
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 下拉菜单 */}
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[120px]">
            {Object.entries(customerStageConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleSelect(key as SalesStage)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${
                  key === customer.stage ? 'text-brand-600 font-medium' : 'text-slate-700'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
                <span className="flex-1 text-left">{config.label}</span>
                {key === customer.stage && <Check size={14} className="text-brand-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
