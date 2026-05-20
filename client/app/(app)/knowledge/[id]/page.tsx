'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Topbar } from '@/components/layout/Topbar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useKnowledge } from '@/hooks/useKnowledge'
import { formatDate } from '@/lib/utils'
import type { KnowledgeItem } from '@/types'

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { get, remove } = useKnowledge()
  const [item, setItem] = useState<KnowledgeItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    get(id)
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id, get])

  const handleDelete = async () => {
    if (!item || !confirm('Delete this knowledge item?')) return
    setDeleting(true)
    try {
      await remove(item.id)
      router.push('/knowledge')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Topbar title="Knowledge" />
      <div className="flex-1 overflow-y-auto p-6">
        <Link href="/knowledge" className="text-sm text-indigo-600 hover:underline">
          ← Back to knowledge
        </Link>
        {loading ? (
          <div className="mt-8 flex justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !item ? (
          <p className="mt-8 text-zinc-500">Item not found.</p>
        ) : (
          <article className="mt-6 max-w-3xl">
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {item.source} · {formatDate(item.createdAt)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <div className="mt-6 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-6 text-sm leading-relaxed dark:border-zinc-800 dark:bg-zinc-900">
              {item.content}
            </div>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete item'}
            </Button>
          </article>
        )}
      </div>
    </>
  )
}
