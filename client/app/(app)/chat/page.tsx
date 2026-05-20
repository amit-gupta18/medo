'use client'

import { Topbar } from '@/components/layout/Topbar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useChat } from '@/hooks/useChat'
import { useToast } from '@/components/providers/ToastProvider'
import { useCallback } from 'react'

export default function ChatPage() {
  const { messages, loading, send } = useChat()
  const { toastError } = useToast()

  const handleSend = useCallback(
    async (msg: string) => {
      try {
        await send(msg)
      } catch {
        toastError('Failed to get an answer. Please try again.')
      }
    },
    [send, toastError],
  )

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Chat" />
      <ChatWindow messages={messages} loading={loading} onSend={handleSend} />
    </div>
  )
}
