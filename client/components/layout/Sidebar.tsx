'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◩' },
  { href: '/knowledge', label: 'Knowledge', icon: '📄' },
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/graph', label: 'Graph', icon: '🔗' },
  { href: '/playbooks', label: 'Playbooks', icon: '📋' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'sidebar',
          open
            ? 'fixed inset-y-0 left-0 z-50 md:relative md:z-auto'
            : 'hidden md:flex',
        )}
      >
        <div className="sidebar-logo">
          <div className="logo-mark">🧠</div>
          <span className="logo-text">Brainyfy</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn('nav-item', isActive && 'active')}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
