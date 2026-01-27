/**
 * 认证相关页面布局
 * 
 * 特点：
 * - 无侧边栏/顶部栏
 * - 居中布局
 * - 简洁背景
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {children}
    </div>
  )
}
