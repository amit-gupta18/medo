'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { SlackChannel } from '@/types'

interface ChannelSelectorProps {
  open: boolean
  channels: SlackChannel[]
  loading: boolean
  selected: string[]
  onSave: (channelIds: string[]) => Promise<void>
  onClose: () => void
}

export function ChannelSelector({
  open,
  channels,
  loading,
  selected: initialSelected,
  onSave,
  onClose,
}: ChannelSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelected(new Set(initialSelected))
  }, [initialSelected])

  if (!open) return null

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave([...selected])
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-1 text-lg font-bold">Select Slack Channels</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Choose which channels to sync into your knowledge base.
        </p>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : channels.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            No channels found. Make sure the Slack bot is invited to channels.
          </p>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {channels.map((ch) => (
              <label
                key={ch.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={selected.has(ch.id)}
                  onChange={() => toggle(ch.id)}
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
                />
                <span className="font-medium">#{ch.name}</span>
                {ch.topic && (
                  <span className="truncate text-xs text-zinc-400">{ch.topic}</span>
                )}
              </label>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || selected.size === 0}>
            {saving ? 'Saving…' : `Save (${selected.size} channels)`}
          </Button>
        </div>
      </div>
    </>
  )
}
