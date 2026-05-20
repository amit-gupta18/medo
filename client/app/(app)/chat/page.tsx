'use client'

import { Topbar } from '@/components/layout/Topbar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useChat } from '@/hooks/useChat'

export default function ChatPage() {
  const { messages, loading, send } = useChat()

  return (
    <>
      <Topbar title="Chat" />
      <ChatWindow messages={messages} loading={loading} onSend={send} />
    </>
  )
}
