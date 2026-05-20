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
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-zinc-500">Knowledge items</p>
              <p className="mt-1 text-3xl font-bold">{items.length}</p>
            </Card>
            <Card>
              <p className="text-sm text-zinc-500">Tags</p>
              <p className="mt-1 text-3xl font-bold">
                {new Set(items.flatMap((i) => i.tags)).size}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-zinc-500">Quick links</p>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                <Link href="/knowledge" className="text-indigo-600 hover:underline">
                  Browse knowledge →
                </Link>
                <Link href="/chat" className="text-indigo-600 hover:underline">
                  Ask the brain →
                </Link>
              </div>
            </Card>
          </div>
        )}

        <h2 className="mb-3 text-lg font-semibold">Recent knowledge</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
            <span className="text-4xl">📄</span>
            <p className="mt-3 font-medium text-zinc-600 dark:text-zinc-400">No knowledge yet</p>
            <p className="mt-1 text-sm text-zinc-500">Upload your first document to get started.</p>
            <Link
              href="/knowledge"
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Upload knowledge
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/knowledge/${item.id}`}
                  className="block rounded-lg border border-zinc-200 px-4 py-3 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-700"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="ml-2 text-xs text-zinc-400">{formatDate(item.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
