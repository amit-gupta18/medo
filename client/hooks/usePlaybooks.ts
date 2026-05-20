'use client'

import { useCallback, useState } from 'react'
import { apiGet, apiPatch, apiPost } from '@/lib/api'
import type { Playbook } from '@/types'

export function usePlaybooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [loading, setLoading] = useState(false)

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<Playbook[]>('/playbooks')
      setPlaybooks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(async (id: string) => {
    return apiGet<Playbook>(`/playbooks/${id}`)
  }, [])

  const generate = useCallback(async (topic: string) => {
    const pb = await apiPost<Playbook>('/playbooks/generate', { topic })
    setPlaybooks((prev) => [pb, ...prev])
    return pb
  }, [])

  const toggleStep = useCallback(
    async (playbookId: string, stepId: string, completed: boolean) => {
      return apiPatch(`/playbooks/${playbookId}/steps/${stepId}`, { completed })
    },
    [],
  )

  return { playbooks, loading, list, get, generate, toggleStep }
}
