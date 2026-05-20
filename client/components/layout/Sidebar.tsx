'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/knowledge', label: 'Knowledge' },
  { href: '/chat', label: 'Chat' },
  { href: '/graph', label: 'Graph' },
  { href: '/playbooks', label: 'Playbooks' },
  { href: '/settings', label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-full w-56 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-5 dark:border-zinc-800">
        <p className="text-lg font-bold text-indigo-600">Brainyfy</p>
        <p className="mt-1 truncate text-xs text-zinc-500">Company Brain</p>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded-lg px-3 py-2 text-sm font-medium transition',
              pathname.startsWith(item.href)
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <p className="truncate text-sm font-medium">{user?.name}</p>
        <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </aside>
  )
}
