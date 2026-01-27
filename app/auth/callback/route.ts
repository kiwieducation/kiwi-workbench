import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Supabase Auth 回调处理
 * 
 * 用于处理：
 * - OAuth 登录回调（如企业微信）
 * - 邮箱确认回调
 * - 密码重置回调
 * 
 * 安全约束：
 * - 仅使用 Anon Key
 * - 在服务端处理 token 交换
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
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
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            // Next.js 16 兼容写法：使用 set 空值 + maxAge=0 代替 delete
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果出错，重定向到登录页
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
