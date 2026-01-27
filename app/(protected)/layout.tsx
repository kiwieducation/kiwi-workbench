import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { ProtectedLayoutClient } from './ProtectedLayoutClient'

/**
 * 受保护路由组布局
 * 
 * 功能：
 * 1. 服务端验证用户登录状态
 * 2. 客户端渲染 Shell + Providers
 * 
 * ⚠️ 安全约束（冻结）：
 * - 使用 Anon Key + Cookies
 * - 不使用 Service Role Key
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Server Component 中不能设置 cookies
        },
        remove(name: string, options: CookieOptions) {
          // Server Component 中不能删除 cookies
        },
      },
    }
  )

  // 验证登录状态
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未登录则重定向到登录页
  if (!user) {
    redirect('/login')
  }

  // 渲染客户端布局（包含 Providers）
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
}
