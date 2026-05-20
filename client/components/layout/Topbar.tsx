'use client'

import { useSidebar } from '@/components/providers/SidebarProvider'

interface TopbarProps {
  title: string
  onUpload?: () => void
}

export function Topbar({ title, onUpload }: TopbarProps) {
  const { toggle } = useSidebar()

  return (
    <div className="topbar">
      <div className="flex items-center gap-2">
        <button className="icon-btn md:hidden" onClick={toggle} aria-label="Toggle navigation">
          ☰
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-right">
        {onUpload && (
          <button className="btn btn-sm btn-primary" onClick={onUpload}>
            + Add to brain
          </button>
        )}
        <div className="topbar-user">
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>demo@acme.com</span>
          <div className="avatar">D</div>
        </div>
      </div>
    </div>
  )
}
