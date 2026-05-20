'use client'

import { Button } from '@/components/ui/Button'

interface TopbarProps {
  title: string
  onUpload?: () => void
}

export function Topbar({ title, onUpload }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-lg font-semibold">{title}</h1>
      {onUpload && (
        <Button size="sm" onClick={onUpload}>
          + Add knowledge
        </Button>
      )}
    </header>
  )
}
