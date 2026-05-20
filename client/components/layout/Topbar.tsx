'use client'

import { Button } from '@/components/ui/Button'

interface TopbarProps {
  title: string
  onUpload?: () => void
  onToggleSidebar?: () => void
}

export function Topbar({ title, onUpload, onToggleSidebar }: TopbarProps) {
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        {onUpload && (
          <button className="btn btn-sm btn-primary" onClick={onUpload}>
            + Add to brain
          </button>
        )}
        <div className="topbar-user">
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            demo@acme.com
          </span>
          <div className="avatar">D</div>
        </div>
      </div>
    </div>
  )
}
