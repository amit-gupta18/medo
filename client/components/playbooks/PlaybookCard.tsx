import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { Playbook } from '@/types'

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  return (
    <Link href={`/playbooks/${playbook.id}`} style={{textDecoration: 'none'}}>
      <Card className="card-interactive">
        <h3 className="card-title">{playbook.title}</h3>
        <p className="card-desc mt-1">Topic: {playbook.topic}</p>
        <p className="caption mt-2">
          {playbook.steps.length} steps · {formatDate(playbook.createdAt)}
        </p>
      </Card>
    </Link>
  )
}
