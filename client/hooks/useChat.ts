'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'
import type { ChatMessage, Citation } from '@/types'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const send = async (question: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await apiPost<{ answer: string; citations: Citation[] }>('/chat', {
        question,
      })
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, send }
}
