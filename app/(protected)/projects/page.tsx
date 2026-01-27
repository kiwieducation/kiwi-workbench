import { PlaceholderPage } from '@/components/shared/PlaceholderPage'
import { FolderKanban } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <PlaceholderPage 
      title="项目协作中心" 
      description="跨部门项目管理，任务分配与跟踪，防推诿机制"
      icon={FolderKanban}
    />
  )
}
