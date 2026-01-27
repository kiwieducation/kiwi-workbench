/**
 * 知识库数据服务层
 * 
 * 负责获取知识库数据
 * 优先从 Supabase 获取，失败时显示错误（开发模式可回退 Mock）
 */

import { createClient } from '@/lib/supabase/client'
import { createServiceError, success, failure, type ServiceResult } from '@/components/shared/Toast'
import type {
  KnowledgeFolder,
  KnowledgeFile,
  KnowledgeBreadcrumb,
  KnowledgeFileType,
} from '@/types/entities'

// ============================================
// Mock 数据（仅开发模式 fallback）
// ============================================

const ENABLE_MOCK_FALLBACK = process.env.NODE_ENV === 'development'

const mockFolders: KnowledgeFolder[] = [
  {
    id: 'folder-root',
    name: '全部文件',
    parentId: null,
    icon: 'FolderRoot',
    fileCount: 156,
    createdAt: '2024-01-01',
    updatedAt: '2024-10-24',
    children: [
      {
        id: 'folder-sop',
        name: 'SOP模板库',
        parentId: 'folder-root',
        icon: 'FileTemplate',
        fileCount: 32,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-20',
        children: [
          { id: 'folder-sop-sales', name: '销售SOP', parentId: 'folder-sop', fileCount: 12, createdAt: '2024-01-01', updatedAt: '2024-10-15' },
          { id: 'folder-sop-tutor', name: '导师SOP', parentId: 'folder-sop', fileCount: 8, createdAt: '2024-01-01', updatedAt: '2024-10-18' },
        ],
      },
      {
        id: 'folder-university',
        name: '大学数据库',
        parentId: 'folder-root',
        icon: 'GraduationCap',
        fileCount: 45,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-22',
      },
      {
        id: 'folder-training',
        name: '培训资料',
        parentId: 'folder-root',
        icon: 'BookOpen',
        fileCount: 25,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-19',
      },
    ],
  },
]

const mockFiles: KnowledgeFile[] = [
  {
    id: 'file-001',
    name: '销售咨询标准话术 v2.0.docx',
    folderId: 'folder-sop-sales',
    type: 'document',
    size: 245760,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    tags: ['话术', '销售', '必读'],
    description: '销售团队标准咨询话术',
    createdBy: 'Admin',
    createdAt: '2024-08-15',
    updatedAt: '2024-10-20',
    viewCount: 328,
    downloadCount: 156,
  },
  {
    id: 'file-002',
    name: 'Harvard大学申请指南.pdf',
    folderId: 'folder-university',
    type: 'document',
    size: 2097152,
    mimeType: 'application/pdf',
    tags: ['哈佛', '美本'],
    createdBy: 'Dr. Mike Ross',
    createdAt: '2024-07-20',
    updatedAt: '2024-10-22',
    viewCount: 892,
    downloadCount: 445,
  },
]

// ============================================
// 配置常量
// ============================================

export const fileTypeConfig: Record<KnowledgeFileType, { label: string; icon: string; color: string }> = {
  document: { label: '文档', icon: 'FileText', color: 'text-blue-600' },
  spreadsheet: { label: '表格', icon: 'Table', color: 'text-emerald-600' },
  presentation: { label: '演示', icon: 'Presentation', color: 'text-orange-600' },
  image: { label: '图片', icon: 'Image', color: 'text-purple-600' },
  video: { label: '视频', icon: 'Video', color: 'text-red-600' },
  template: { label: '模板', icon: 'FileTemplate', color: 'text-amber-600' },
  other: { label: '其他', icon: 'File', color: 'text-slate-600' },
}

// ============================================
// 服务函数
// ============================================

/**
 * 获取文件夹列表（构建树结构）
 */
export async function getFolders(): Promise<ServiceResult<KnowledgeFolder[]>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('knowledge_folders')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase knowledge_folders query failed:', error.message)
      
      // 检查是否是表不存在的错误
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        if (ENABLE_MOCK_FALLBACK) {
          console.warn('[DEV] Using mock folders (table not exists)')
          return success(mockFolders)
        }
        return failure({
          code: 'TABLE_NOT_EXISTS',
          message: '知识库文件夹表不存在，请联系管理员创建 knowledge_folders 表',
        })
      }

      // 权限错误
      if (error.code === '42501' || error.message.includes('permission denied')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有访问知识库的权限，请联系管理员配置 RLS 策略',
        })
      }

      if (ENABLE_MOCK_FALLBACK) {
        console.warn('[DEV] Using mock folders due to error:', error.message)
        return success(mockFolders)
      }

      return failure(createServiceError(error, '获取文件夹列表失败'))
    }

    // 转换并构建树结构
    const folders = buildFolderTree(data || [])
    return success(folders)
  } catch (error) {
    console.error('getFolders error:', error)
    if (ENABLE_MOCK_FALLBACK) {
      return success(mockFolders)
    }
    return failure(createServiceError(error, '获取文件夹列表失败'))
  }
}

/**
 * 获取单个文件夹
 */
export async function getFolderById(id: string): Promise<ServiceResult<KnowledgeFolder | null>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('knowledge_folders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return success(null) // Not found
      }
      return failure(createServiceError(error, '获取文件夹失败'))
    }

    return success(transformFolder(data))
  } catch (error) {
    return failure(createServiceError(error, '获取文件夹失败'))
  }
}

/**
 * 获取文件列表
 */
export async function getFilesByFolder(
  folderId: string | null,
  options?: { page?: number; pageSize?: number; search?: string }
): Promise<ServiceResult<{ data: KnowledgeFile[]; total: number }>> {
  const supabase = createClient()
  const { page = 1, pageSize = 50, search } = options || {}

  try {
    let query = supabase
      .from('knowledge_files')
      .select('*', { count: 'exact' })

    // 根据 folderId 筛选
    if (folderId && folderId !== 'folder-root' && folderId !== 'all') {
      query = query.eq('folder_id', folderId)
    }

    // 搜索
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to).order('updated_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase knowledge_files query failed:', error.message)

      if (error.code === '42P01' || error.message.includes('does not exist')) {
        if (ENABLE_MOCK_FALLBACK) {
          console.warn('[DEV] Using mock files (table not exists)')
          const filtered = folderId && folderId !== 'folder-root' && folderId !== 'all'
            ? mockFiles.filter(f => f.folderId === folderId)
            : mockFiles
          return success({ data: filtered, total: filtered.length })
        }
        return failure({
          code: 'TABLE_NOT_EXISTS',
          message: '知识库文件表不存在，请联系管理员创建 knowledge_files 表',
        })
      }

      if (error.code === '42501' || error.message.includes('permission denied')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有访问知识库文件的权限',
        })
      }

      if (ENABLE_MOCK_FALLBACK) {
        const filtered = folderId && folderId !== 'folder-root' && folderId !== 'all'
          ? mockFiles.filter(f => f.folderId === folderId)
          : mockFiles
        return success({ data: filtered, total: filtered.length })
      }

      return failure(createServiceError(error, '获取文件列表失败'))
    }

    const files = (data || []).map(transformFile)
    return success({ data: files, total: count || 0 })
  } catch (error) {
    console.error('getFilesByFolder error:', error)
    if (ENABLE_MOCK_FALLBACK) {
      const filtered = folderId && folderId !== 'folder-root' && folderId !== 'all'
        ? mockFiles.filter(f => f.folderId === folderId)
        : mockFiles
      return success({ data: filtered, total: filtered.length })
    }
    return failure(createServiceError(error, '获取文件列表失败'))
  }
}

/**
 * 搜索文件
 */
export async function searchFiles(query: string): Promise<ServiceResult<KnowledgeFile[]>> {
  const result = await getFilesByFolder(null, { search: query, pageSize: 100 })
  if (result.success) {
    return success(result.data.data)
  }
  return failure(result.error)
}

/**
 * 获取面包屑路径
 */
export async function getBreadcrumbs(folderId: string): Promise<ServiceResult<KnowledgeBreadcrumb[]>> {
  if (!folderId || folderId === 'folder-root' || folderId === 'all') {
    return success([{ id: 'folder-root', name: '全部文件' }])
  }

  const supabase = createClient()
  const breadcrumbs: KnowledgeBreadcrumb[] = [{ id: 'folder-root', name: '全部文件' }]

  try {
    let currentId: string | null = folderId
    const visited = new Set<string>()

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId)

      const { data, error } = await supabase
        .from('knowledge_folders')
        .select('id, name, parent_id')
        .eq('id', currentId)
        .single()

      if (error || !data) break

      const folderData = data as { id: string; name: string; parent_id: string | null }
      breadcrumbs.splice(1, 0, { id: folderData.id, name: folderData.name })
      currentId = folderData.parent_id
    }

    return success(breadcrumbs)
  } catch (error) {
    // 失败时返回基础面包屑
    return success(breadcrumbs)
  }
}

// ============================================
// 写入函数（预留接口，Phase 4 只读）
// ============================================

export interface CreateFolderInput {
  name: string
  parentId: string | null
  icon?: string
}

/**
 * 创建文件夹
 */
export async function createFolder(input: CreateFolderInput): Promise<ServiceResult<KnowledgeFolder>> {
  const supabase = createClient()

  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()

    const insertData = {
      name: input.name,
      parent_id: input.parentId === 'folder-root' ? null : input.parentId,
      icon: input.icon || null,
      created_by: user?.id || null,
    }

    const { data, error } = await supabase
      .from('knowledge_folders')
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      console.error('Create folder error:', error)

      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return failure({
          code: 'TABLE_NOT_EXISTS',
          message: '知识库文件夹表不存在，请联系管理员创建 knowledge_folders 表',
        })
      }

      if (error.code === '42501' || error.message.includes('permission denied')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有创建文件夹的权限',
        })
      }

      return failure(createServiceError(error, '创建文件夹失败'))
    }

    return success(transformFolder(data as DBFolder))
  } catch (error) {
    console.error('createFolder error:', error)
    return failure(createServiceError(error, '创建文件夹失败'))
  }
}

export interface UploadFileInput {
  folderId: string | null
  title: string
  description?: string
  file: File
  tags?: string[]
}

/**
 * 上传文件到 Supabase Storage 并创建记录
 */
export async function uploadFile(input: UploadFileInput): Promise<ServiceResult<KnowledgeFile>> {
  const supabase = createClient()

  try {
    // 1. 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return failure({
        code: 'NOT_AUTHENTICATED',
        message: '请先登录',
      })
    }

    // 2. 生成文件路径
    const fileExt = input.file.name.split('.').pop() || 'bin'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `knowledge/${user.id}/${fileName}`

    // 3. 上传到 Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, input.file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)

      if (uploadError.message.includes('Bucket not found')) {
        return failure({
          code: 'BUCKET_NOT_EXISTS',
          message: 'Storage bucket 不存在，请联系管理员创建 "files" bucket',
        })
      }

      if (uploadError.message.includes('permission denied') || uploadError.message.includes('not authorized')) {
        return failure({
          code: 'PERMISSION_DENIED',
          message: '没有上传文件的权限，请检查 Storage 策略',
        })
      }

      return failure(createServiceError(uploadError, '上传文件失败'))
    }

    // 4. 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    const fileUrl = urlData?.publicUrl || null

    // 5. 插入文件记录
    const fileType = mapFileTypeFromMime(input.file.type)
    const insertData = {
      folder_id: input.folderId === 'folder-root' ? null : input.folderId,
      title: input.title || input.file.name,
      description: input.description || null,
      file_path: filePath,
      file_url: fileUrl,
      file_type: fileType,
      mime_type: input.file.type,
      size: input.file.size,
      tags: input.tags || null,
      view_count: 0,
      download_count: 0,
      created_by: user.id,
    }

    const { data, error } = await supabase
      .from('knowledge_files')
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      console.error('Create file record error:', error)

      // 尝试删除已上传的文件
      await supabase.storage.from('files').remove([filePath])

      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return failure({
          code: 'TABLE_NOT_EXISTS',
          message: '知识库文件表不存在，请联系管理员创建 knowledge_files 表',
        })
      }

      return failure(createServiceError(error, '创建文件记录失败'))
    }

    return success(transformFile(data as DBFile))
  } catch (error) {
    console.error('uploadFile error:', error)
    return failure(createServiceError(error, '上传文件失败'))
  }
}

/**
 * 删除文件
 */
export async function deleteFile(fileId: string): Promise<ServiceResult<void>> {
  const supabase = createClient()

  try {
    // 1. 获取文件信息
    const { data: fileData, error: fetchError } = await supabase
      .from('knowledge_files')
      .select('file_path')
      .eq('id', fileId)
      .single()

    if (fetchError) {
      return failure(createServiceError(fetchError, '获取文件信息失败'))
    }

    // 2. 删除 Storage 中的文件
    const filePath = (fileData as { file_path: string | null })?.file_path
    if (filePath) {
      await supabase.storage.from('files').remove([filePath])
    }

    // 3. 删除数据库记录
    const { error: deleteError } = await supabase
      .from('knowledge_files')
      .delete()
      .eq('id', fileId)

    if (deleteError) {
      return failure(createServiceError(deleteError, '删除文件失败'))
    }

    return success(undefined)
  } catch (error) {
    return failure(createServiceError(error, '删除文件失败'))
  }
}

/**
 * 删除文件夹（需要先清空内容）
 */
export async function deleteFolder(folderId: string): Promise<ServiceResult<void>> {
  const supabase = createClient()

  try {
    // 检查是否有子文件夹或文件
    const { count: filesCount } = await supabase
      .from('knowledge_files')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', folderId)

    if (filesCount && filesCount > 0) {
      return failure({
        code: 'NOT_EMPTY',
        message: '文件夹不为空，请先删除其中的文件',
      })
    }

    const { count: subFoldersCount } = await supabase
      .from('knowledge_folders')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', folderId)

    if (subFoldersCount && subFoldersCount > 0) {
      return failure({
        code: 'NOT_EMPTY',
        message: '文件夹不为空，请先删除子文件夹',
      })
    }

    // 删除文件夹
    const { error } = await supabase
      .from('knowledge_folders')
      .delete()
      .eq('id', folderId)

    if (error) {
      return failure(createServiceError(error, '删除文件夹失败'))
    }

    return success(undefined)
  } catch (error) {
    return failure(createServiceError(error, '删除文件夹失败'))
  }
}

/**
 * 从 MIME 类型映射文件类型
 */
function mapFileTypeFromMime(mimeType: string): string {
  if (mimeType.includes('word') || mimeType.includes('pdf') || mimeType.includes('text')) {
    return 'document'
  }
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'spreadsheet'
  }
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return 'presentation'
  }
  if (mimeType.startsWith('image/')) {
    return 'image'
  }
  if (mimeType.startsWith('video/')) {
    return 'video'
  }
  return 'other'
}

// ============================================
// 辅助函数
// ============================================

interface DBFolder {
  id: string
  name: string
  parent_id: string | null
  icon: string | null
  sort_order: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface DBFile {
  id: string
  folder_id: string | null
  title: string
  description: string | null
  file_path: string | null
  file_url: string | null
  file_type: string
  mime_type: string | null
  size: number
  tags: string[] | null
  view_count: number
  download_count: number
  created_by: string | null
  created_at: string
  updated_at: string
}

function transformFolder(data: DBFolder): KnowledgeFolder {
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id,
    icon: data.icon || undefined,
    createdAt: formatDate(data.created_at),
    updatedAt: formatDate(data.updated_at),
  }
}

function transformFile(data: DBFile): KnowledgeFile {
  return {
    id: data.id,
    name: data.title,
    folderId: data.folder_id || '',
    type: mapFileType(data.file_type, data.mime_type),
    size: data.size || 0,
    mimeType: data.mime_type || 'application/octet-stream',
    url: data.file_url || data.file_path || undefined,
    tags: data.tags || [],
    description: data.description || undefined,
    createdBy: data.created_by || 'Unknown',
    createdAt: formatDate(data.created_at),
    updatedAt: formatDate(data.updated_at),
    viewCount: data.view_count || 0,
    downloadCount: data.download_count || 0,
  }
}

function buildFolderTree(folders: DBFolder[]): KnowledgeFolder[] {
  const folderMap = new Map<string, KnowledgeFolder>()
  const roots: KnowledgeFolder[] = []

  // 首先转换所有文件夹
  folders.forEach(f => {
    folderMap.set(f.id, { ...transformFolder(f), children: [] })
  })

  // 构建树结构
  folders.forEach(f => {
    const folder = folderMap.get(f.id)!
    if (f.parent_id && folderMap.has(f.parent_id)) {
      const parent = folderMap.get(f.parent_id)!
      if (!parent.children) parent.children = []
      parent.children.push(folder)
    } else {
      roots.push(folder)
    }
  })

  // 如果没有数据，返回一个虚拟根节点
  if (roots.length === 0) {
    return [{
      id: 'folder-root',
      name: '全部文件',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [],
    }]
  }

  return roots
}

function mapFileType(fileType: string, mimeType: string | null): KnowledgeFileType {
  const type = fileType?.toLowerCase() || ''
  const mime = mimeType?.toLowerCase() || ''

  if (type === 'document' || mime.includes('word') || mime.includes('pdf') || mime.includes('text')) {
    return 'document'
  }
  if (type === 'spreadsheet' || mime.includes('excel') || mime.includes('spreadsheet')) {
    return 'spreadsheet'
  }
  if (type === 'presentation' || mime.includes('powerpoint') || mime.includes('presentation')) {
    return 'presentation'
  }
  if (type === 'image' || mime.startsWith('image/')) {
    return 'image'
  }
  if (type === 'video' || mime.startsWith('video/')) {
    return 'video'
  }
  if (type === 'template') {
    return 'template'
  }
  return 'other'
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN')
  } catch {
    return dateStr
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
