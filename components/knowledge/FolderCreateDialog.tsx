'use client'

import { useState } from 'react'
import { X, FolderPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/shared/Toast'
import { createFolder, type CreateFolderInput } from '@/lib/services/knowledge.service'
import type { KnowledgeFolder } from '@/types/entities'

interface FolderCreateDialogProps {
  parentId: string | null
  onSuccess: (folder: KnowledgeFolder) => void
  onCancel: () => void
}

/**
 * 新建文件夹弹窗
 */
export function FolderCreateDialog({ parentId, onSuccess, onCancel }: FolderCreateDialogProps) {
  const toast = useToast()

  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.warning('请输入名称', '请输入文件夹名称')
      return
    }

    setIsCreating(true)

    const input: CreateFolderInput = {
      name: name.trim(),
      parentId: parentId === 'folder-root' ? null : parentId,
    }

    const result = await createFolder(input)

    if (result.success) {
      toast.success('创建成功', `文件夹 "${name}" 已创建`)
      onSuccess(result.data)
    } else {
      toast.error('创建失败', result.error.message)
    }

    setIsCreating(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreate()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">新建文件夹</h2>
          <button
            onClick={onCancel}
            disabled={isCreating}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            文件夹名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCreating}
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
            placeholder="输入文件夹名称"
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onCancel} disabled={isCreating}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
            {isCreating ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                <FolderPlus size={16} className="mr-2" />
                创建
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
