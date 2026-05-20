import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { Playbook } from '@/types'

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  return (
    <Link href={`/playbooks/${playbook.id}`}>
      <Card className="transition hover:border-indigo-300">
        <h3 className="font-semibold">{playbook.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">Topic: {playbook.topic}</p>
        <p className="mt-2 text-xs text-zinc-400">
          {playbook.steps.length} steps · {formatDate(playbook.createdAt)}
        </p>
      </Card>
    </Link>
  )
}
