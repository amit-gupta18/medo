import Link from 'next/link'
import type { Citation } from '@/types'

export function CitationChip({ citation }: { citation: Citation }) {
  return (
    <Link
      href={`/knowledge/${citation.id}`}
      className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
    >
      {citation.title}
    </Link>
  )
}
