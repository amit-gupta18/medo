import { useCallback, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import type { Integration, SlackChannel } from '@/types'

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(false)

  const list = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<Integration[]>('/integrations')
      setIntegrations(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const connect = useCallback((type: 'slack' | 'notion') => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
    window.location.href = `${apiBase}/integrations/${type}/connect`
  }, [])

  const sync = useCallback(async (type: 'slack' | 'notion') => {
    const result = await apiPost<{ success: boolean; itemsSynced: number }>(
      `/integrations/${type}/sync`,
    )
    await list()
    return result
  }, [list])

  const disconnect = useCallback(async (type: 'slack' | 'notion') => {
    await apiDelete(`/integrations/${type}`)
    await list()
  }, [list])

  const getSlackChannels = useCallback(async () => {
    return apiGet<SlackChannel[]>('/integrations/slack/channels')
  }, [])

  const setSlackChannels = useCallback(async (channelIds: string[]) => {
    await apiPost('/integrations/slack/channels', channelIds)
    await list()
  }, [list])

  const getIntegration = useCallback(
    (type: string) => integrations.find((i) => i.type === type.toUpperCase()),
    [integrations],
  )

  return {
    integrations,
    loading,
    list,
    connect,
    sync,
    disconnect,
    getSlackChannels,
    setSlackChannels,
    getIntegration,
  }
}
