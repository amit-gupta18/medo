'use client'

import { FormEvent, useRef, useEffect, useState } from 'react'
import { ChatMessage } from './ChatMessage'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatWindowProps {
  messages: ChatMessageType[]
  loading: boolean
  onSend: (question: string) => void
}

export function ChatWindow({ messages, loading, onSend }: ChatWindowProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-zinc-500">Ask anything about your company knowledge.</p>
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <Spinner />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <input
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          placeholder="Ask your org brain..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          Send
        </Button>
      </form>
    </div>
  )
}
