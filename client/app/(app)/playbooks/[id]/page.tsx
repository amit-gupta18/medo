'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Topbar } from '@/components/layout/Topbar'
import { PlaybookStepRow } from '@/components/playbooks/PlaybookStep'
import { Spinner } from '@/components/ui/Spinner'
import { usePlaybooks } from '@/hooks/usePlaybooks'
import { useToast } from '@/components/providers/ToastProvider'
import { formatDate } from '@/lib/utils'
import type { Playbook } from '@/types'

export default function PlaybookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { get, toggleStep } = usePlaybooks()
  const { toastError } = useToast()
  const [playbook, setPlaybook] = useState<Playbook | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    get(id)
      .then(setPlaybook)
      .catch(() => toastError('Failed to load playbook'))
      .finally(() => setLoading(false))
  }, [id, get, toastError])

  const handleToggle = async (stepId: string, completed: boolean) => {
    if (!playbook) return
    try {
      await toggleStep(playbook.id, stepId, completed)
      setPlaybook((prev) =>
        prev
          ? {
              ...prev,
              steps: prev.steps.map((s) => (s.id === stepId ? { ...s, completed } : s)),
            }
          : null,
      )
    } catch {
      toastError('Failed to update step')
    }
  }

  return (
    <>
      <Topbar title="Playbooks" />
      <div className="page-content">
        <Link href="/playbooks" className="caption hover:text-[var(--text-secondary)] transition-colors">
          ← Back to playbooks
        </Link>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !playbook ? (
          <div className="empty-state mt-8">
            <span className="text-4xl">📋</span>
            <p className="mt-3 font-medium text-[var(--text-primary)]">Playbook not found.</p>
          </div>
        ) : (
          <article className="mt-6 max-w-2xl">
            <h1 className="page-heading">{playbook.title}</h1>
            <p className="caption mt-2">
              Topic: {playbook.topic} · {formatDate(playbook.createdAt)}
            </p>
            <div className="mt-8 space-y-3">
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
