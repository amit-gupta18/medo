'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Topbar } from '@/components/layout/Topbar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useKnowledge } from '@/hooks/useKnowledge'
import { useToast } from '@/components/providers/ToastProvider'
import { formatDate } from '@/lib/utils'
import type { KnowledgeItem } from '@/types'

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { get, remove } = useKnowledge()
  const { toastSuccess, toastError } = useToast()
  const [item, setItem] = useState<KnowledgeItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    get(id)
      .then(setItem)
      .catch(() => toastError('Failed to load knowledge item'))
      .finally(() => setLoading(false))
  }, [id, get, toastError])

  const handleDelete = async () => {
    if (!item || !confirm('Delete this knowledge item?')) return
    setDeleting(true)
    try {
      await remove(item.id)
      toastSuccess('Knowledge item deleted')
      router.push('/knowledge')
    } catch {
      toastError('Failed to delete item')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Topbar title="Knowledge" />
      <div className="page-content">
        <Link
          href="/knowledge"
          className="caption hover:text-(--text-secondary) transition-colors"
        >
          ← Back to knowledge
        </Link>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !item ? (
          <div className="empty-state mt-8">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-medium text-foreground">Item not found.</p>
          </div>
        ) : (
          <article className="mt-6 max-w-3xl">
            <h1 className="page-heading">{item.title}</h1>
            <p className="caption mt-2">
              {item.source} · {formatDate(item.createdAt)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-6 text-sm leading-relaxed text-(--text-secondary) whitespace-pre-wrap">
              {item.content}
            </div>
            <div className="mt-6">
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete item'}
              </Button>
            </div>
          </article>
        )}
      </div>
    </>
  )
}
