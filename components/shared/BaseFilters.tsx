'use client'

import { Search, Filter, ChevronDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { FilterConfig, FilterOption } from '@/types/entities'

interface BaseFiltersProps {
  // 搜索配置
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  // Tab 配置
  tabs?: { key: string; label: string }[]
  activeTab?: string
  onTabChange?: (key: string) => void
  // 下拉筛选配置
  filters?: FilterConfig[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  // 重置
  showReset?: boolean
  onReset?: () => void
  // 额外操作
  extra?: React.ReactNode
}

/**
 * 基础筛选器组件
 * 
 * 支持：
 * - Tab 切换
 * - 搜索框
 * - 下拉筛选
 * - 重置按钮
 */
export function BaseFilters({
  searchPlaceholder = '搜索...',
  searchValue = '',
  onSearchChange,
  tabs,
  activeTab,
  onTabChange,
  filters,
  filterValues = {},
  onFilterChange,
  showReset,
  onReset,
  extra,
}: BaseFiltersProps) {
  const hasActiveFilters = Object.values(filterValues).some(v => v && v !== 'all')

  return (
    <div className="space-y-4">
      {/* 上排：Tab + 搜索 */}
      <div className="flex items-center justify-between gap-4">
        {/* Tab 切换 */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
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
        )}

        {/* 搜索框 */}
        {onSearchChange && (
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* 额外操作 */}
        {extra}
      </div>

      {/* 下排：筛选条件 */}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-3">
          {filters.map(filter => (
            <div key={filter.key}>
              {filter.type === 'select' && filter.options && (
                <select
                  value={filterValues[filter.key] || 'all'}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* 更多筛选按钮 */}
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-brand-300">
            <Filter size={14} />
            <span className="font-medium">更多筛选</span>
          </button>

          {/* 重置按钮 */}
          {showReset && (hasActiveFilters || searchValue) && (
            <button
              onClick={onReset}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              重置筛选
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// 辅助组件：筛选标签
// ============================================

interface FilterTagsProps {
  tags: { key: string; label: string; value: string }[]
  onRemove: (key: string) => void
  onClearAll?: () => void
}

export function FilterTags({ tags, onRemove, onClearAll }: FilterTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tags.map(tag => (
        <Badge key={tag.key} variant="secondary" className="flex items-center gap-1 pr-1">
          <span>{tag.label}: {tag.value}</span>
          <button
            onClick={() => onRemove(tag.key)}
            className="ml-1 p-0.5 rounded hover:bg-slate-300"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
      {onClearAll && tags.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          清除全部
        </button>
      )}
    </div>
  )
}
