import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDate, truncate } from '@/lib/utils'
import type { KnowledgeItem } from '@/types'

export function KnowledgeCard({ item }: { item: KnowledgeItem }) {
  return (
    <Link href={`/knowledge/${item.id}`}>
      <Card className="h-full transition hover:border-indigo-300 hover:shadow-md">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{truncate(item.content, 100)}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          {item.source} · {formatDate(item.createdAt)}
        </p>
      </Card>
    </Link>
  )
}
