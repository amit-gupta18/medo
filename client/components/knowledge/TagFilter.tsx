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
        className={cn(
          'rounded-full px-3 py-1 text-sm font-medium transition',
          !selected ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800',
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium transition',
            selected === tag
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800',
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
