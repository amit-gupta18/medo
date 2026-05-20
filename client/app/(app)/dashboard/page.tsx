'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { useKnowledge } from '@/hooks/useKnowledge'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { items, list, loading } = useKnowledge()

  useEffect(() => {
    list()
  }, [list])

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6">
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

        <h2 className="mb-3 text-lg font-semibold">Recent knowledge</h2>
        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-zinc-500">Upload your first document to get started.</p>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/knowledge/${item.id}`}
                  className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-indigo-300 dark:border-zinc-800"
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
