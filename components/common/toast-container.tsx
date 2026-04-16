'use client'

import { useToast } from '@/context/toast-context'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200'
      case 'error':
        return 'text-red-800 dark:text-red-200'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200'
      case 'info':
      default:
        return 'text-blue-800 dark:text-blue-200'
    }
  }

  const getIcon = (type: string) => {
    const iconClass = `w-5 h-5 flex-shrink-0`
    switch (type) {
      case 'success':
        return <CheckCircle2 className={iconClass} />
      case 'error':
        return <AlertCircle className={iconClass} />
      case 'warning':
        return <AlertTriangle className={iconClass} />
      case 'info':
      default:
        return <Info className={iconClass} />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border rounded-lg p-4 flex items-start gap-3 max-w-sm animate-slideDown pointer-events-auto ${getToastStyles(
            toast.type
          )}`}
        >
          <div className={getIconColor(toast.type)}>{getIcon(toast.type)}</div>
          <div className={`flex-1 ${getTextColor(toast.type)}`}>
            <p className="font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ${getIconColor(
              toast.type
            )}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
