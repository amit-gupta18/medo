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
      <div className="page-content">
        <p className="page-subheading">Generate automated SOPs based on your organization's knowledge.</p>

        <form onSubmit={handleGenerate} className="input-group mb-12 max-w-2xl">
          <span className="input-prefix">⚡</span>
          <input
            className="input"
            placeholder="e.g. Onboard a new hire, deploy to production…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="input-suffix">
            <Button type="submit" disabled={generating} size="sm">
              {generating ? <Spinner /> : 'Generate'}
            </Button>
          </div>
        </form>

        {loading ? (
          <SkeletonList count={6} />
        ) : playbooks.length === 0 ? (
          <div className="empty-state">
            <span className="text-4xl">📋</span>
            <p className="mt-3 font-medium text-foreground">
              No playbooks yet
            </p>
            <p className="mt-1 text-(--text-tertiary)">
              Enter a topic above to generate an SOP from your knowledge.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {playbooks.map((pb) => (
              <PlaybookCard key={pb.id} playbook={pb} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
