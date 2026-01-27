'use client'

import { useState, useRef } from 'react'
import { X, Upload, File, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/shared/Toast'
import { uploadFile, type UploadFileInput } from '@/lib/services/knowledge.service'
import type { KnowledgeFile } from '@/types/entities'

interface FileUploadDialogProps {
  folderId: string | null
  onSuccess: (file: KnowledgeFile) => void
  onCancel: () => void
}

/**
 * 文件上传弹窗
 */
export function FileUploadDialog({ folderId, onSuccess, onCancel }: FileUploadDialogProps) {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // 选择文件
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // 默认使用文件名作为标题
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  // 拖拽上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('请选择文件', '请先选择要上传的文件')
      return
    }

    if (!title.trim()) {
      toast.warning('请输入标题', '请输入文件标题')
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    const input: UploadFileInput = {
      folderId: folderId === 'folder-root' ? null : folderId,
      title: title.trim(),
      description: description.trim() || undefined,
      file: selectedFile,
      tags: tags.split(',').map(t => t.trim()).filter(t => t) || undefined,
    }

    // 模拟进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    const result = await uploadFile(input)

    clearInterval(progressInterval)
    setUploadProgress(100)

    if (result.success) {
      toast.success('上传成功', `${selectedFile.name} 已上传`)
      onSuccess(result.data)
    } else {
      toast.error('上传失败', result.error.message)
    }

    setIsUploading(false)
  }

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">上传文件</h2>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 文件选择区域 */}
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              selectedFile
                ? 'border-brand-300 bg-brand-50'
                : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <File size={32} className="text-brand-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">{formatSize(selectedFile.size)}</p>
                </div>
              </div>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-700 font-medium">点击选择文件或拖拽到此处</p>
                <p className="text-sm text-slate-500 mt-1">支持 PDF、Word、Excel、图片等格式</p>
              </>
            )}
          </div>

          {/* 上传进度 */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">上传中...</span>
                <span className="text-brand-600">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              文件标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
              placeholder="输入文件标题"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none disabled:bg-slate-50"
              placeholder="输入文件描述（可选）"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">标签</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
              placeholder="用逗号分隔，如：模板, 重要, 必读"
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
            {isUploading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                上传
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
