import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  UserPlus,
  ClipboardList,
  Upload,
  Calendar,
  Sparkles,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getDashboardKPIs,
  getTodoItems,
  getRecentActivities,
  getCurrentUserForDashboard,
} from '@/lib/services/dashboard.service'
import { mockConversations } from '@/lib/mock/data'

/**
 * 个人首页（Dashboard）
 *
 * 对齐 v8.0 PRD + AI Studio 设计母版：
 * - 沉浸式欢迎区域（问候语 + 每日金句 + 在线协作）
 * - KPI 指标卡片
 * - 我的待办（可筛选）
 * - 快捷操作
 * - 近期动态（替代日程，本阶段不接入日程数据）
 * - 最新消息提醒
 */
export default async function DashboardPage() {
  // 从 Supabase 获取真实数据
  const [currentUser, kpis, todoItems, recentActivities] = await Promise.all([
    getCurrentUserForDashboard(),
    getDashboardKPIs(),
    getTodoItems(),
    getRecentActivities(),
  ])

  // 用户名（降级为"同事"）
  const userName = currentUser?.name || '同事'

  // 获取当前时间段问候语
  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  // 格式化日期
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return '今天'
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  // 获取优先级样式
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return '紧急'
      case 'high':
        return '高优'
      case 'medium':
        return '中等'
      default:
        return '常规'
    }
  }

  // 获取最新未读消息
  const unreadConversations = mockConversations.filter(c => c.unreadCount > 0).slice(0, 3)

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* ========== 沉浸式欢迎区域 ========== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}，{userName} 👋
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles size={12} />
              每日金句
            </span>
            <p className="text-slate-500 text-sm italic font-medium">
              "帮助学生实现梦想，是我们共同奋战的最高荣耀！"
            </p>
          </div>
        </div>

        {/* 在线协作状态 */}
        <div className="bg-white p-2 pr-6 pl-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center relative">
            <div className="absolute top-0 right-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <Users className="text-emerald-600" size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
              公司在线协作
            </div>
            <div className="text-lg font-bold text-slate-900 leading-none">
              42{' '}
              <span className="text-sm font-medium text-slate-600">位同事</span>{' '}
              <span className="text-emerald-600 font-bold ml-1">在线</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== KPI 指标卡片 ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const isNegativeGood = kpi.label.includes('逾期')
          const trendColor = kpi.trend === 'up'
            ? (isNegativeGood ? 'text-red-500' : 'text-emerald-600')
            : kpi.trend === 'down'
            ? (isNegativeGood ? 'text-emerald-600' : 'text-red-500')
            : 'text-slate-500'

          return (
            <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="text-slate-500 text-sm font-medium mb-1">
                  {kpi.label}
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {kpi.value}
                </div>
                {kpi.change !== undefined && (
                  <div className={`text-xs font-medium flex items-center gap-1 ${trendColor}`}>
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight size={14} />
                    ) : kpi.trend === 'down' ? (
                      <ArrowDownRight size={14} />
                    ) : null}
                    {kpi.change > 0 ? '+' : ''}
                    {kpi.change} 较昨日
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ========== 主内容区 ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：待办事项 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList size={18} className="text-brand-600" />
                我的待办
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">
                  全部
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">
                  今天
                </Badge>
                <Badge variant="destructive" className="cursor-pointer opacity-80 hover:opacity-100">
                  逾期
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {todoItems.length > 0 ? (
                <>
                  {todoItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-brand-500 transition-colors flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 text-sm truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            截止：{item.due_date ? formatDate(item.due_date) : '无'}
                          </span>
                          {item.related_type && (
                            <span className="text-slate-400">•</span>
                          )}
                          {item.related_type === 'student' && (
                            <span>关联学员</span>
                          )}
                          {item.related_type === 'customer' && (
                            <span>关联客户</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={getPriorityVariant(item.priority)}>
                        {getPriorityLabel(item.priority)}
                      </Badge>
                    </div>
                  ))}
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                    <Link
                      href="/projects"
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      查看全部待办 →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">
                  暂无待办任务
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最新消息提醒 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={18} className="text-brand-600" />
                最新消息
              </CardTitle>
              <Link href="/messages">
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">
                  查看全部
                </Badge>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {unreadConversations.length > 0 ? (
                unreadConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href="/messages"
                    className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs bg-brand-100 text-brand-700">
                          {conv.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.isOverdue && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                          <AlertCircle size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 text-sm truncate">
                          {conv.name}
                        </span>
                        {conv.isOverdue && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0">
                            超时
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-slate-400">{conv.lastMessageTime}</span>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">
                  暂无未读消息
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧栏 */}
        <div className="space-y-6">
          {/* 快捷操作 */}
          <Card>
            <CardHeader className="py-4 px-6">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-600" />
                快捷操作
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 px-6 pb-6">
              {[
                { label: '新建学员', icon: UserPlus, href: '/tutor' },
                { label: '创建任务', icon: ClipboardList, href: '/projects' },
                { label: '上传文件', icon: Upload, href: '/knowledge' },
                { label: '预约会议', icon: Calendar, href: '/projects' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-brand-200 hover:shadow-sm transition-all text-sm font-medium text-slate-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-2">
                      <Icon size={18} />
                    </div>
                    {action.label}
                  </Link>
                )
              })}
            </CardContent>
          </Card>

          {/* 近期动态（替代日程，本阶段不接入日程数据） */}
          <Card>
            <CardHeader className="py-4 px-6">
              <CardTitle className="flex items-center gap-2">
                <Activity size={18} className="text-brand-600" />
                近期动态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              {recentActivities.length > 0 ? (
                <>
                  {recentActivities.map((activity) => {
                    const activityDate = new Date(activity.created_at)
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-12 text-center bg-slate-100 rounded-lg py-1.5 px-2">
                          <div className="text-[10px] text-slate-500 font-medium uppercase">
                            {activityDate.toLocaleDateString('zh-CN', { month: 'short' })}
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            {activityDate.getDate()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900 line-clamp-2">
                            {activity.title}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock size={12} />
                            {activityDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href="/projects"
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      查看全部动态 →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400 text-sm py-4">
                  暂无近期动态
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
