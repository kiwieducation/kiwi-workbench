'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

// ============================================
// Toast 类型定义
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  // 便捷方法
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

// ============================================
// Toast Context
// ============================================

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// ============================================
// Toast Provider
// ============================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast: Toast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // 自动消失
    const duration = toast.duration ?? (toast.type === 'error' ? 5000 : 3000)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // 便捷方法
  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message })
  }, [showToast])

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

// ============================================
// Toast Container
// ============================================

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  )
}

// ============================================
// Toast Item
// ============================================

const toastStyles: Record<ToastType, { bg: string; icon: typeof CheckCircle2; iconColor: string }> = {
  success: { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-600' },
  error: { bg: 'bg-red-50 border-red-200', icon: AlertCircle, iconColor: 'text-red-600' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600' },
  info: { bg: 'bg-blue-50 border-blue-200', icon: Info, iconColor: 'text-blue-600' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const style = toastStyles[toast.type]
  const Icon = style.icon

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right ${style.bg}`}
    >
      <Icon size={20} className={style.iconColor} />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// ============================================
// 统一错误处理工具
// ============================================

export interface ServiceError {
  code: string
  message: string
  details?: unknown
}

export function createServiceError(error: unknown, defaultMessage: string = '操作失败'): ServiceError {
  if (error instanceof Error) {
    return {
      code: 'ERROR',
      message: error.message || defaultMessage,
      details: error,
    }
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    return {
      code: String(err.code || 'ERROR'),
      message: String(err.message || defaultMessage),
      details: err,
    }
  }
  
  return {
    code: 'UNKNOWN',
    message: defaultMessage,
    details: error,
  }
}

// 服务返回类型
export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError }

// 创建成功结果
export function success<T>(data: T): ServiceResult<T> {
  return { success: true, data }
}

// 创建失败结果
export function failure<T>(error: ServiceError): ServiceResult<T> {
  return { success: false, error }
}
