'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Upload,
  Plus,
  FolderPlus,
  Grid,
  List,
  ChevronRight,
  Home,
  Filter,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderTree, FileList, FileUploadDialog, FolderCreateDialog } from '@/components/knowledge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/Toast'
import {
  getFolders,
  getFilesByFolder,
  searchFiles,
  getBreadcrumbs,
} from '@/lib/services/knowledge.service'
import type { KnowledgeFolder, KnowledgeFile, KnowledgeBreadcrumb } from '@/types/entities'

/**
 * 企业知识库
 * 
 * 对齐 v8.0 PRD：
 * - 目录树导航（从 Supabase knowledge_folders 读取）
 * - 文件列表（从 Supabase knowledge_files 读取）
 * - 搜索功能
 * - 上传文件（接入 Supabase Storage）
 * - 新建文件夹
 */
export default function KnowledgePage() {
  const toast = useToast()

  // 数据状态
  const [folders, setFolders] = useState<KnowledgeFolder[]>([])
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [total, setTotal] = useState(0)
  const [breadcrumbs, setBreadcrumbs] = useState<KnowledgeBreadcrumb[]>([])
  
  // UI 状态
  const [selectedFolderId, setSelectedFolderId] = useState<string>('folder-root')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [isFoldersLoading, setIsFoldersLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 弹窗状态
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)

  // 加载目录树
  const loadFolders = async () => {
    setIsFoldersLoading(true)
    const result = await getFolders()
    
    if (result.success) {
      setFolders(result.data)
      setError(null)
    } else {
      toast.error('加载文件夹失败', result.error.message)
      setError(result.error.message)
      setFolders([])
    }
    setIsFoldersLoading(false)
  }

  useEffect(() => {
    loadFolders()
  }, [])

  // 加载文件列表和面包屑
  useEffect(() => {
    if (searchQuery) return // 搜索时由另一个 effect 处理

    const loadFiles = async () => {
      setIsLoading(true)
      setIsSearching(false)
      
      const [filesResult, breadcrumbsResult] = await Promise.all([
        getFilesByFolder(selectedFolderId),
        getBreadcrumbs(selectedFolderId),
      ])
      
      if (filesResult.success) {
        setFiles(filesResult.data.data)
        setTotal(filesResult.data.total)
      } else {
        toast.error('加载文件列表失败', filesResult.error.message)
        setFiles([])
        setTotal(0)
      }
      
      if (breadcrumbsResult.success) {
        setBreadcrumbs(breadcrumbsResult.data)
      }
      
      setIsLoading(false)
    }
    
    loadFiles()
  }, [selectedFolderId, searchQuery])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // 搜索文件
  useEffect(() => {
    if (!searchQuery) {
      setIsSearching(false)
      return
    }

    const doSearch = async () => {
      setIsSearching(true)
      setIsLoading(true)
      
      const result = await searchFiles(searchQuery)
      
      if (result.success) {
        setFiles(result.data)
        setTotal(result.data.length)
      } else {
        toast.error('搜索失败', result.error.message)
        setFiles([])
        setTotal(0)
      }
      
      setIsLoading(false)
    }

    doSearch()
  }, [searchQuery])

  // 选择文件夹
  const handleFolderSelect = (folder: KnowledgeFolder) => {
    setSearchInput('')
    setSearchQuery('')
    setSelectedFolderId(folder.id)
  }

  // 点击面包屑
  const handleBreadcrumbClick = (id: string) => {
    setSearchInput('')
    setSearchQuery('')
    setSelectedFolderId(id)
  }

  // 文件点击
  const handleFileClick = (file: KnowledgeFile) => {
    if (file.url) {
      window.open(file.url, '_blank')
    } else {
      toast.info('文件预览', `即将预览：${file.name}`)
    }
  }

  // 下载文件
  const handleDownload = (file: KnowledgeFile) => {
    if (file.url) {
      window.open(file.url, '_blank')
    } else {
      toast.warning('下载失败', '文件地址不可用')
    }
  }

  // 新建文件夹
  const handleCreateFolder = () => {
    setShowFolderDialog(true)
  }

  // 文件夹创建成功
  const handleFolderCreated = (folder: KnowledgeFolder) => {
    setShowFolderDialog(false)
    loadFolders() // 重新加载目录树
    toast.success('创建成功', `文件夹 "${folder.name}" 已创建`)
  }

  // 上传文件
  const handleUploadClick = () => {
    setShowUploadDialog(true)
  }

  // 文件上传成功
  const handleFileUploaded = (file: KnowledgeFile) => {
    setShowUploadDialog(false)
    // 重新加载当前文件夹的文件列表
    loadFiles()
  }

  // 加载文件列表
  const loadFiles = async () => {
    setIsLoading(true)
    const result = await getFilesByFolder(selectedFolderId)
    if (result.success) {
      setFiles(result.data.data)
      setTotal(result.data.total)
    }
    setIsLoading(false)
  }

  // 新建文档（预留）
  const handleNewDocClick = () => {
    toast.info('功能开发中', '在线新建文档功能即将上线')
  }

  // 渲染错误状态
  if (error && folders.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50/50">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">加载知识库失败</h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50">
      {/* 上传文件弹窗 */}
      {showUploadDialog && (
        <FileUploadDialog
          folderId={selectedFolderId}
          onSuccess={handleFileUploaded}
          onCancel={() => setShowUploadDialog(false)}
        />
      )}

      {/* 新建文件夹弹窗 */}
      {showFolderDialog && (
        <FolderCreateDialog
          parentId={selectedFolderId}
          onSuccess={handleFolderCreated}
          onCancel={() => setShowFolderDialog(false)}
        />
      )}

      {/* ========== 左侧：目录树 ========== */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">知识库</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isFoldersLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <FolderTree
              folders={folders}
              selectedId={selectedFolderId}
              onSelect={handleFolderSelect}
            />
          )}
        </div>
        <div className="p-3 border-t border-slate-100">
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleCreateFolder}>
            <FolderPlus size={14} className="mr-2" />
            新建文件夹
          </Button>
        </div>
      </div>

      {/* ========== 右侧：文件列表 ========== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 头部工具栏 */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            {/* 面包屑导航 */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => handleBreadcrumbClick('folder-root')}
                className="text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <Home size={14} />
              </button>
              {!isSearching && breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center">
                  <ChevronRight size={14} className="text-slate-300 mx-1" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-slate-900">{crumb.name}</span>
                  ) : (
                    <button
                      onClick={() => handleBreadcrumbClick(crumb.id)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      {crumb.name}
                    </button>
                  )}
                </div>
              ))}
              {isSearching && (
                <>
                  <ChevronRight size={14} className="text-slate-300 mx-1" />
                  <span className="font-medium text-slate-900">搜索结果</span>
                  <Badge variant="secondary" className="ml-2">{files.length} 个文件</Badge>
                </>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleUploadClick}>
                <Upload size={14} className="mr-2" />
                上传文件
              </Button>
              <Button size="sm" onClick={handleNewDocClick}>
                <Plus size={14} className="mr-2" />
                新建文档
              </Button>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索文件名、标签..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              <Filter size={14} />
              筛选
            </button>

            {/* 视图切换 */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 文件列表 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <Card className="m-6 border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <FileList
                files={files}
                viewMode={viewMode}
                onFileClick={handleFileClick}
                onDownload={handleDownload}
                emptyTitle={isSearching ? '没有找到匹配的文件' : '暂无文件'}
                emptyDescription={isSearching ? '尝试使用其他关键词搜索' : '上传文件或创建新文档'}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
