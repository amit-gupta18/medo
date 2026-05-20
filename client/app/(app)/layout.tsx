'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { SidebarProvider, useSidebar } from '@/components/providers/SidebarProvider'

function AppShell({ children }: { children: React.ReactNode }) {
  const { open, close } = useSidebar()
  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={close} />
      <main className="main">
        {children}
      </main>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ToastProvider>
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </SidebarProvider>
  )
}
