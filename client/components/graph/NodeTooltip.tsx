import type { GraphNode } from '@/types'

export function NodeTooltip({ node }: { node: GraphNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-semibold">{node.label}</p>
      {node.tags.length > 0 && (
        <p className="mt-1 text-xs text-zinc-500">{node.tags.join(', ')}</p>
      )}
    </div>
  )
}
