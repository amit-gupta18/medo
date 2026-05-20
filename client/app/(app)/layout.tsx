'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/providers/ToastProvider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
