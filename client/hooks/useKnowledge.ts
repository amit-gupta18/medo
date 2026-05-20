'use client'

import { useCallback, useState } from 'react'
import { apiDelete, apiGet, apiUpload } from '@/lib/api'
import type { KnowledgeItem } from '@/types'

export function useKnowledge() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(false)

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<KnowledgeItem[]>('/knowledge')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(async (id: string) => {
    return apiGet<KnowledgeItem>(`/knowledge/${id}`)
  }, [])

  const upload = useCallback(
    async (payload: { content?: string; url?: string; file?: File }) => {
      const form = new FormData()
      if (payload.content) form.append('content', payload.content)
      if (payload.url) form.append('url', payload.url)
      if (payload.file) form.append('file', payload.file)
      const item = await apiUpload<KnowledgeItem>('/knowledge', form)
      setItems((prev) => [item, ...prev])
      return item
    },
    [],
  )

  const remove = useCallback(async (id: string) => {
    await apiDelete(`/knowledge/${id}`)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return { items, loading, list, get, upload, remove }
}
