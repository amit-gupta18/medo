'use client'

import { useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { Spinner } from '@/components/ui/Spinner'
import { useGraph } from '@/hooks/useGraph'

export default function GraphPage() {
  const { data, loading, fetchGraph } = useGraph()

  useEffect(() => {
    fetchGraph()
  }, [fetchGraph])

  return (
    <>
      <Topbar title="Knowledge Graph" />
      <div className="flex-1 overflow-hidden p-6">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <GraphCanvas data={data} />
        )}
      </div>
    </>
  )
}
