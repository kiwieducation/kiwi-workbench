'use client'

import {
  FileText,
  Table,
  Presentation,
  Image,
  Video,
  File,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatFileSize, fileTypeConfig } from '@/lib/services/knowledge.service'
import type { KnowledgeFile, KnowledgeFileType } from '@/types/entities'

interface FileListProps {
  files: KnowledgeFile[]
  viewMode?: 'list' | 'grid'
  onFileClick?: (file: KnowledgeFile) => void
  onDownload?: (file: KnowledgeFile) => void
  emptyTitle?: string
  emptyDescription?: string
}

const iconMap: Record<KnowledgeFileType, React.ComponentType<{ size?: number; className?: string }>> = {
  document: FileText,
  spreadsheet: Table,
  presentation: Presentation,
  image: Image,
  video: Video,
  template: FileText,
  other: File,
}

/**
 * 文件列表组件
 */
export function FileList({
  files,
  viewMode = 'list',
  onFileClick,
  onDownload,
  emptyTitle = '暂无文件',
  emptyDescription = '当前文件夹为空',
}: FileListProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        variant="default"
        title={emptyTitle}
        description={emptyDescription}
        icon={FileText}
      />
    )
  }

  if (viewMode === 'grid') {
    return <FileGrid files={files} onFileClick={onFileClick} onDownload={onDownload} />
  }

  return <FileTable files={files} onFileClick={onFileClick} onDownload={onDownload} />
}

// ============================================
// 表格视图
// ============================================

interface FileTableProps {
  files: KnowledgeFile[]
  onFileClick?: (file: KnowledgeFile) => void
  onDownload?: (file: KnowledgeFile) => void
}

function FileTable({ files, onFileClick, onDownload }: FileTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
          <tr>
            <th className="px-4 py-3">文件名</th>
            <th className="px-4 py-3 w-24">大小</th>
            <th className="px-4 py-3 w-32">更新时间</th>
            <th className="px-4 py-3 w-24">浏览</th>
            <th className="px-4 py-3 w-20 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {files.map((file) => {
            const config = fileTypeConfig[file.type]
            const Icon = iconMap[file.type]

            return (
              <tr
                key={file.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onFileClick?.(file)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center ${config.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate max-w-md">
                        {file.name}
                      </div>
                      {file.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {file.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {file.updatedAt}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    {file.viewCount}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onDownload?.(file)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                      title="下载"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                      title="更多"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// 网格视图
// ============================================

interface FileGridProps {
  files: KnowledgeFile[]
  onFileClick?: (file: KnowledgeFile) => void
  onDownload?: (file: KnowledgeFile) => void
}

function FileGrid({ files, onFileClick, onDownload }: FileGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {files.map((file) => {
        const config = fileTypeConfig[file.type]
        const Icon = iconMap[file.type]

        return (
          <div
            key={file.id}
            className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer"
            onClick={() => onFileClick?.(file)}
          >
            <div className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 ${config.color}`}>
              <Icon size={24} />
            </div>
            <h4 className="font-medium text-slate-900 text-sm truncate mb-1" title={file.name}>
              {file.name}
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              {formatFileSize(file.size)} · {file.updatedAt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Eye size={10} />
                {file.viewCount}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload?.(file)
                }}
                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
