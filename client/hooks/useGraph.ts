'use client'

import { useCallback, useState } from 'react'
import { apiGet } from '@/lib/api'
import type { GraphData } from '@/types'

export function useGraph() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(false)

  const fetchGraph = useCallback(async () => {
    setLoading(true)
    try {
      const graph = await apiGet<GraphData>('/graph')
      setData(graph)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, fetchGraph }
}
