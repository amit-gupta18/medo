'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastProps {
  id: string
  message: string
  variant?: ToastVariant
  onDismiss: (id: string) => void
}

const variantStyles: Record<ToastVariant, string> = {
  success:
    'border-emerald-500/30 bg-emerald-950/80 text-emerald-200',
  error:
    'border-red-500/30 bg-red-950/80 text-red-200',
  info:
    'border-indigo-500/30 bg-indigo-950/80 text-indigo-200',
}

const icons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

export function Toast({ id, message, variant = 'info', onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(id), 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300',
        variantStyles[variant],
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
      )}
    >
      <span className="text-lg font-bold">{icons[variant]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onDismiss(id), 300)
        }}
        className="ml-2 text-xs opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
