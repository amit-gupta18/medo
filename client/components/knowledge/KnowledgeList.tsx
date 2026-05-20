import { KnowledgeCard } from './KnowledgeCard'
import type { KnowledgeItem } from '@/types'

export function KnowledgeList({ items }: { items: KnowledgeItem[] }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="text-4xl">📄</span>
        <p className="mt-3 font-medium text-foreground">No knowledge yet</p>
        <p className="mt-1 text-(--text-tertiary)">Upload a document or paste text to get started.</p>
      </div>
    )
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <KnowledgeCard key={item.id} item={item} />
      ))}
    </div>
  )
}
