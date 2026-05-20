'use client'

import { Badge } from '@/components/ui/Badge'
import type { PlaybookStep as PlaybookStepType } from '@/types'

interface PlaybookStepProps {
  step: PlaybookStepType
  onToggle: (completed: boolean) => void
}

export function PlaybookStepRow({ step, onToggle }: PlaybookStepProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4 transition-colors hover:border-(--border-mid)">
      <input
        type="checkbox"
        checked={step.completed}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-(--border-mid) accent-[#C8A96E] cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${step.completed ? 'text-(--text-tertiary) line-through' : 'text-foreground'}`}>
          <span className="text-(--text-tertiary) mr-1.5">{step.order}.</span>
          {step.text}
        </p>
        {step.sourceItem?.title && (
          <Badge className="mt-2">{step.sourceItem.title}</Badge>
        )}
      </div>
    </div>
  )
}
