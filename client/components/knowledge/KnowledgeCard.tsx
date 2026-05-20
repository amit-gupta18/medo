import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDate, truncate } from '@/lib/utils'
import type { KnowledgeItem } from '@/types'

export function KnowledgeCard({ item }: { item: KnowledgeItem }) {
  return (
    <Link href={`/knowledge/${item.id}`} style={{textDecoration: 'none'}}>
      <Card className="card-interactive h-full flex flex-col">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-desc mt-1 flex-1">{truncate(item.content, 100)}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <p className="caption mt-3">
          {item.source} · {formatDate(item.createdAt)}
        </p>
      </Card>
    </Link>
  )
}
