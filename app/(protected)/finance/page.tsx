import { PlaceholderPage } from '@/components/shared/PlaceholderPage'
import { Wallet } from 'lucide-react'

export default function FinancePage() {
  return (
    <PlaceholderPage 
      title="财务工作台" 
      description="应收应付管理、回款跟踪、佣金结算"
      icon={Wallet}
    />
  )
}
