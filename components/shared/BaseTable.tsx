'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from './EmptyState'
import type { TableColumn, PaginationConfig } from '@/types/entities'

interface BaseTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: keyof T | ((record: T) => string)
  selectable?: boolean
  selectedKeys?: Set<string>
  onSelectChange?: (keys: Set<string>) => void
  pagination?: PaginationConfig
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  onRowClick?: (record: T) => void
  className?: string
}

/**
 * 基础表格组件
 */
export function BaseTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys = new Set(),
  onSelectChange,
  pagination,
  emptyTitle = '暂无数据',
  emptyDescription,
  emptyIcon,
  onRowClick,
  className = '',
}: BaseTableProps<T>) {
  const getRowKey = (record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return String(record[rowKey])
  }

  const handleSelectAll = () => {
    if (!onSelectChange) return
    if (selectedKeys.size === data.length) {
      onSelectChange(new Set())
    } else {
      onSelectChange(new Set(data.map(getRowKey)))
    }
  }

  const handleSelectRow = (key: string) => {
    if (!onSelectChange) return
    const newKeys = new Set(selectedKeys)
    if (newKeys.has(key)) {
      newKeys.delete(key)
    } else {
      newKeys.add(key)
    }
    onSelectChange(newKeys)
  }

  const getCellValue = (record: T, key: string): unknown => {
    if (key.includes('.')) {
      return key.split('.').reduce<unknown>((obj, k) => {
        if (obj && typeof obj === 'object') {
          return (obj as Record<string, unknown>)[k]
        }
        return undefined
      }, record)
    }
    return record[key as keyof T]
  }

  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const keyStr = String(column.key)
    const value = getCellValue(record, keyStr)
    
    if (column.render) {
      return column.render(value, record, index)
    }
    return String(value ?? '-')
  }

  return (
    <Card className={`overflow-hidden border-0 shadow-sm ring-1 ring-slate-200 ${className}`}>
      {data.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  {selectable && (
                    <th className="px-6 py-4 w-14">
                      <input
                        type="checkbox"
                        checked={selectedKeys.size === data.length && data.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                  )}
                  {columns.map(column => (
                    <th
                      key={String(column.key)}
                      className={`px-4 py-4 ${column.width ? `w-[${column.width}]` : ''} ${
                        column.align === 'right' ? 'text-right' : 
                        column.align === 'center' ? 'text-center' : ''
                      }`}
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.map((record, index) => {
                  const key = getRowKey(record)
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(record)}
                      className={`hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      {selectable && (
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedKeys.has(key)}
                            onChange={() => handleSelectRow(key)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                      )}
                      {columns.map(column => (
                        <td
                          key={String(column.key)}
                          className={`px-4 py-4 ${
                            column.align === 'right' ? 'text-right' : 
                            column.align === 'center' ? 'text-center' : ''
                          }`}
                        >
                          {renderCell(column, record, index)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="text-sm text-slate-500">
                共 <span className="font-medium text-slate-900">{pagination.total}</span> 条记录
                {selectable && selectedKeys.size > 0 && (
                  <span className="ml-2">
                    （已选择 <span className="font-medium text-brand-600">{selectedKeys.size}</span> 条）
                  </span>
                )}
              </div>
              <Pagination {...pagination} />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          variant="search"
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
        />
      )}
    </Card>
  )
}

function Pagination({ current, pageSize, total, onChange }: PaginationConfig) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange?.(1, pageSize)}
        disabled={current === 1}
        className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        onClick={() => onChange?.(current - 1, pageSize)}
        disabled={current === 1}
        className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let page: number
        if (totalPages <= 5) {
          page = i + 1
        } else if (current <= 3) {
          page = i + 1
        } else if (current >= totalPages - 2) {
          page = totalPages - 4 + i
        } else {
          page = current - 2 + i
        }
        return (
          <button
            key={page}
            onClick={() => onChange?.(page, pageSize)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
              current === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        )
      })}

      <button
        onClick={() => onChange?.(current + 1, pageSize)}
        disabled={current === totalPages}
        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={() => onChange?.(totalPages, pageSize)}
        disabled={current === totalPages}
        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  )
}
