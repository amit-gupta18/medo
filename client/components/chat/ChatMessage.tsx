import { CitationChip } from './CitationChip'
import type { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/lib/utils'

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-[var(--accent)] text-[#0D0C0B] font-medium'
            : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]',
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.citations.map((c) => (
              <CitationChip key={c.id} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
