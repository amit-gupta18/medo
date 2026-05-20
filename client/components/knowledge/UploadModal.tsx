'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'

type Tab = 'paste' | 'file' | 'url'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onUpload: (payload: { content?: string; url?: string; file?: File }) => Promise<void>
}

export function UploadModal({ open, onClose, onUpload }: UploadModalProps) {
  const [tab, setTab] = useState<Tab>('paste')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'paste', label: 'Paste text' },
    { id: 'file', label: 'Upload file' },
    { id: 'url', label: 'Paste URL' },
  ]

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (tab === 'paste' && !content.trim()) throw new Error('Enter some text')
      if (tab === 'url' && !url.trim()) throw new Error('Enter a URL')
      if (tab === 'file' && !file) throw new Error('Choose a file')

      await onUpload({
        content: tab === 'paste' ? content : undefined,
        url: tab === 'url' ? url : undefined,
        file: tab === 'file' ? file! : undefined,
      })
      setContent('')
      setUrl('')
      setFile(null)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add knowledge">
      <div className="mb-4 flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'paste' && (
        <textarea
          className="h-40 w-full rounded-lg border border-zinc-300 p-3 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          placeholder="Paste your notes, SOP, or documentation..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      )}
      {tab === 'file' && (
        <input
          type="file"
          accept=".pdf,.txt,.md"
          className="w-full text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      )}
      {tab === 'url' && <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} />}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner /> : 'Upload'}
        </Button>
      </div>
    </Modal>
  )
}
