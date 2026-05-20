'use client'

import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: string[]
  selected: string | null
  onSelect: (tag: string | null) => void
}

export function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
  if (tags.length === 0) return null
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn('btn btn-sm', !selected ? 'btn-primary' : 'btn-ghost border border-[var(--border-subtle)]')}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          className={cn('btn btn-sm', selected === tag ? 'btn-primary' : 'btn-ghost border border-[var(--border-subtle)]')}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
