import { KnowledgeCard } from './KnowledgeCard'
import type { KnowledgeItem } from '@/types'

export function KnowledgeList({ items }: { items: KnowledgeItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">
        No knowledge yet. Upload a document or paste text to get started.
      </p>
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
