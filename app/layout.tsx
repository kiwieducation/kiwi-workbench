import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '柯维留学工作台',
  description: '企业级内部工作台系统 - Kiwi Education Workbench',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
