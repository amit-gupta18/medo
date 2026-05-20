'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { PlaybookCard } from '@/components/playbooks/PlaybookCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { SkeletonList } from '@/components/ui/Skeleton'
import { usePlaybooks } from '@/hooks/usePlaybooks'
import { useToast } from '@/components/providers/ToastProvider'

export default function PlaybooksPage() {
  const { playbooks, loading, list, generate } = usePlaybooks()
  const { toastSuccess, toastError } = useToast()
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    list().catch(() => toastError('Failed to load playbooks'))
  }, [list, toastError])

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setGenerating(true)
    try {
      await generate(topic.trim())
      toastSuccess('Playbook generated successfully!')
      setTopic('')
    } catch {
      toastError('Failed to generate playbook. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Topbar title="Playbooks" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <form onSubmit={handleGenerate} className="mb-8 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            placeholder="e.g. Onboard a new hire, deploy to production…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Button type="submit" disabled={generating}>
            {generating ? <Spinner /> : 'Generate SOP'}
          </Button>
        </form>

        {loading ? (
          <SkeletonList count={6} />
        ) : playbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
            <span className="text-4xl">📋</span>
            <p className="mt-3 font-medium text-zinc-600 dark:text-zinc-400">
              No playbooks yet
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Enter a topic above to generate an SOP from your knowledge.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((pb) => (
              <PlaybookCard key={pb.id} playbook={pb} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
