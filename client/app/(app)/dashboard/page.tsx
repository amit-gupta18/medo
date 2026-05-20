'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useKnowledge } from '@/hooks/useKnowledge'
import { useToast } from '@/components/providers/ToastProvider'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { items, list, loading } = useKnowledge()
  const { toastError } = useToast()

  useEffect(() => {
    list().catch(() => toastError('Failed to load dashboard data'))
  }, [list, toastError])

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-content">
        <h1 className="page-heading">Dashboard</h1>
        <p className="page-subheading">Overview of your brain's connected data</p>

        {loading ? (
          <div className="grid-3 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid-3 mb-8">
            <Card>
              <div className="caption">Knowledge items</div>
              <div className="stat-value mt-2">{items.length}</div>
            </Card>
            <Card>
              <div className="caption">Tags</div>
              <div className="stat-value mt-2">
                {new Set(items.flatMap((i) => i.tags)).size}
              </div>
            </Card>
            <Card>
              <div className="caption">Quick links</div>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <Link href="/knowledge" className="text-(--text-accent) hover:underline">
                  Browse knowledge →
                </Link>
                <Link href="/chat" className="text-(--text-accent) hover:underline">
                  Ask the brain →
                </Link>
              </div>
            </Card>
          </div>
        )}

        <h2 className="section-heading mt-0">Recent knowledge</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-(--bg-elevated)" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span className="text-4xl">📄</span>
            <p className="mt-3 font-medium text-foreground">No knowledge yet</p>
            <p className="mt-1 text-(--text-tertiary)">Upload your first document to get started.</p>
            <Link
              href="/knowledge"
              className="btn btn-primary mt-6"
            >
              Upload knowledge
            </Link>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            {items.slice(0, 5).map((item) => (
              <div key={item.id} className="knowledge-row">
                <div className="knowledge-row-icon">
                  {item.source === 'NOTION' ? '📝' : item.source === 'SLACK' ? '💬' : item.source === 'URL' ? '🔗' : '📄'}
                </div>
                <div className="knowledge-row-body">
                  <div className="knowledge-row-title">
                    <Link href={`/knowledge/${item.id}`} className="hover:underline text-inherit">{item.title}</Link>
                  </div>
                  <div className="knowledge-row-meta">
                    <span className={`badge badge-${item.source === 'UPLOAD' ? 'blue' : item.source === 'NOTION' ? 'accent' : 'default'}`}>
                      {item.source}
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
