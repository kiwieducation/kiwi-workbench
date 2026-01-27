'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  GraduationCap,
  Stamp,
  BookOpen,
  Megaphone,
  FolderRoot,
} from 'lucide-react'
import type { KnowledgeFolder } from '@/types/entities'

interface FolderTreeProps {
  folders: KnowledgeFolder[]
  selectedId: string | null
  onSelect: (folder: KnowledgeFolder) => void
  expandedIds?: Set<string>
  onToggleExpand?: (id: string) => void
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FolderRoot: FolderRoot,
  FileTemplate: FileText,
  GraduationCap: GraduationCap,
  Stamp: Stamp,
  BookOpen: BookOpen,
  Megaphone: Megaphone,
}

/**
 * 目录树组件
 */
export function FolderTree({
  folders,
  selectedId,
  onSelect,
  expandedIds: externalExpandedIds,
  onToggleExpand: externalOnToggle,
}: FolderTreeProps) {
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
    new Set(['folder-root'])
  )

  const expandedIds = externalExpandedIds || internalExpandedIds
  const toggleExpand = externalOnToggle || ((id: string) => {
    setInternalExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  })

  return (
    <div className="py-2">
      {folders.map(folder => (
        <FolderItem
          key={folder.id}
          folder={folder}
          level={0}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggle={toggleExpand}
        />
      ))}
    </div>
  )
}

interface FolderItemProps {
  folder: KnowledgeFolder
  level: number
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (folder: KnowledgeFolder) => void
  onToggle: (id: string) => void
}

function FolderItem({
  folder,
  level,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
}: FolderItemProps) {
  const isExpanded = expandedIds.has(folder.id)
  const isSelected = selectedId === folder.id
  const hasChildren = folder.children && folder.children.length > 0

  const IconComponent = folder.icon && iconMap[folder.icon] 
    ? iconMap[folder.icon] 
    : isExpanded ? FolderOpen : Folder

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors ${
          isSelected ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(folder)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(folder.id)
            }}
            className="p-0.5 hover:bg-slate-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-slate-400" />
            ) : (
              <ChevronRight size={14} className="text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <IconComponent
          size={16}
          className={isSelected ? 'text-brand-600' : 'text-slate-500'}
        />
        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
        {folder.fileCount !== undefined && (
          <span className="text-xs text-slate-400">{folder.fileCount}</span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map(child => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
