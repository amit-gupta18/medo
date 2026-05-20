'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import type { GraphData } from '@/types'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphCanvasProps {
  data: GraphData
}

export function GraphCanvas({ data }: GraphCanvasProps) {
  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n, name: n.label })),
      links: data.links.map((l) => ({
        source: l.source,
        target: l.target,
        similarity: l.similarity,
      })),
    }),
    [data],
  )

  if (data.nodes.length === 0) {
    return (
      <p className="flex h-96 items-center justify-center text-zinc-500">
        No graph connections yet. Upload knowledge to build the graph.
      </p>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy="id"
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}
        backgroundColor="transparent"
      />
    </div>
  )
}
