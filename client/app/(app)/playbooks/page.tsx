'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { PlaybookCard } from '@/components/playbooks/PlaybookCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { usePlaybooks } from '@/hooks/usePlaybooks'

export default function PlaybooksPage() {
  const { playbooks, loading, list, generate } = usePlaybooks()
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    list()
  }, [list])

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setGenerating(true)
    try {
      await generate(topic.trim())
      setTopic('')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Topbar title="Playbooks" />
      <div className="flex-1 overflow-y-auto p-6">
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
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : playbooks.length === 0 ? (
          <p className="text-center text-zinc-500">
            No playbooks yet. Enter a topic above to generate an SOP from your knowledge.
          </p>
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
