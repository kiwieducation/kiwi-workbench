'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

/**
 * 登录页
 * 
 * 认证方式：
 * 1. 邮箱密码登录（Supabase Auth）
 * 2. 企业微信登录（TODO: Phase 2）
 * 
 * ⚠️ 安全约束（冻结）：
 * - 仅使用 NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - 严禁使用 Service Role Key
 */
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 创建浏览器端 Supabase 客户端（使用 Anon Key）
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? '邮箱或密码错误' 
          : error.message)
        return
      }

      // 登录成功，跳转首页
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 企业微信登录（预留）
  const handleWeComLogin = () => {
    // TODO: Phase 2 实现企业微信 OAuth
    alert('企业微信登录功能开发中')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-brand-200">
          K
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          柯维留学工作台
        </h1>
        <p className="text-slate-500 text-sm mt-1">企业级工作台</p>
      </div>

      {/* 登录卡片 */}
      <Card className="w-full max-w-md bg-white p-8 shadow-xl shadow-slate-200/50 border-slate-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">欢迎回来</h2>
          <p className="text-slate-500 text-sm mt-1">
            输入您的凭据以访问工作区
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              邮箱地址
            </label>
            <Input
              type="email"
              placeholder="name@kiwiedu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">
                密码
              </label>
              <a
                href="#"
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                忘记密码？
              </a>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              '登录中...'
            ) : (
              <>
                登录
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* 分隔线 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">或通过以下方式继续</span>
          </div>
        </div>

        {/* 企业微信登录 */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleWeComLogin}
        >
          <div className="w-5 h-5 rounded-full bg-[#3975FF] flex items-center justify-center text-white text-[10px] font-bold mr-2">
            W
          </div>
          企业微信登录
        </Button>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-xs text-slate-400">
          还没有账号？{' '}
          <a href="#" className="text-slate-600 hover:text-slate-900 font-medium">
            联系管理员
          </a>
        </div>
      </Card>

      {/* 底部链接 */}
      <div className="mt-8 flex gap-6 text-xs text-slate-400 font-medium">
        <a href="#" className="hover:text-slate-600">隐私政策</a>
        <a href="#" className="hover:text-slate-600">服务条款</a>
        <a href="#" className="hover:text-slate-600">帮助中心</a>
      </div>
    </div>
  )
}
