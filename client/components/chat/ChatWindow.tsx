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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 md:px-8 py-6">
        {messages.length === 0 && (
          <div className="empty-state">Ask anything about your company knowledge.</div>
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
      <div className="chat-bar">
        <form onSubmit={handleSubmit} className="chat-bar-inner max-w-4xl mx-auto w-full">
          <span className="chat-bar-icon">✨</span>
          <input
            className="chat-bar-input"
            placeholder="Ask your org brain..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading} className="chat-bar-send">
            ↑
          </button>
        </form>
      </div>
    </div>
  )
}
