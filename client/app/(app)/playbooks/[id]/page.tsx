'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Topbar } from '@/components/layout/Topbar'
import { PlaybookStepRow } from '@/components/playbooks/PlaybookStep'
import { Spinner } from '@/components/ui/Spinner'
import { usePlaybooks } from '@/hooks/usePlaybooks'
import { formatDate } from '@/lib/utils'
import type { Playbook } from '@/types'

export default function PlaybookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { get, toggleStep } = usePlaybooks()
  const [playbook, setPlaybook] = useState<Playbook | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    get(id)
      .then(setPlaybook)
      .finally(() => setLoading(false))
  }, [id, get])

  const handleToggle = async (stepId: string, completed: boolean) => {
    if (!playbook) return
    await toggleStep(playbook.id, stepId, completed)
    setPlaybook((prev) =>
      prev
        ? {
            ...prev,
            steps: prev.steps.map((s) => (s.id === stepId ? { ...s, completed } : s)),
          }
        : null,
    )
  }

  return (
    <>
      <Topbar title="Playbook" />
      <div className="flex-1 overflow-y-auto p-6">
        <Link href="/playbooks" className="text-sm text-indigo-600 hover:underline">
          ← Back to playbooks
        </Link>
        {loading ? (
          <div className="mt-8 flex justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !playbook ? (
          <p className="mt-8 text-zinc-500">Playbook not found.</p>
        ) : (
          <article className="mt-6 max-w-2xl">
            <h1 className="text-2xl font-bold">{playbook.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Topic: {playbook.topic} · {formatDate(playbook.createdAt)}
            </p>
            <div className="mt-6 space-y-3">
              {playbook.steps.map((step) => (
                <PlaybookStepRow
                  key={step.id}
                  step={step}
                  onToggle={(completed) => handleToggle(step.id, completed)}
                />
              ))}
            </div>
          </article>
        )}
      </div>
    </>
  )
}
