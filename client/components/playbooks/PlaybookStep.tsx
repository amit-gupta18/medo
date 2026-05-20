'use client'

import { Badge } from '@/components/ui/Badge'
import type { PlaybookStep as PlaybookStepType } from '@/types'

interface PlaybookStepProps {
  step: PlaybookStepType
  onToggle: (completed: boolean) => void
}

export function PlaybookStepRow({ step, onToggle }: PlaybookStepProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <input
        type="checkbox"
        checked={step.completed}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-300"
      />
      <div className="flex-1">
        <p className={`text-sm ${step.completed ? 'text-zinc-400 line-through' : ''}`}>
          {step.order}. {step.text}
        </p>
        {step.sourceItem?.title && (
          <Badge className="mt-2">{step.sourceItem.title}</Badge>
        )}
      </div>
    </div>
  )
}
