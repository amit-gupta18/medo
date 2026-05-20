'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { IntegrationCard } from '@/components/settings/IntegrationCard'
import { ChannelSelector } from '@/components/settings/ChannelSelector'
import { useAuth } from '@/hooks/useAuth'
import { useIntegrations } from '@/hooks/useIntegrations'
import { useToast } from '@/components/providers/ToastProvider'
import type { SlackChannel } from '@/types'

function SettingsContent() {
  const { user } = useAuth()
  const {
    integrations,
    loading,
    list,
    connect,
    sync,
    disconnect,
    getSlackChannels,
    setSlackChannels,
    getIntegration,
  } = useIntegrations()
  const { toastSuccess, toastError } = useToast()
  const searchParams = useSearchParams()

  const [channelSelectorOpen, setChannelSelectorOpen] = useState(false)
  const [slackChannels, setSlackChannelsState] = useState<SlackChannel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(false)

  useEffect(() => {
    list().catch(() => {})
  }, [list])

  // Show toast when returning from OAuth
  useEffect(() => {
    const connected = searchParams.get('connected')
    if (connected === 'slack') {
      toastSuccess('Slack connected successfully!')
    } else if (connected === 'notion') {
      toastSuccess('Notion connected successfully!')
    }
  }, [searchParams, toastSuccess])

  const slack = getIntegration('SLACK')
  const notion = getIntegration('NOTION')

  const handleOpenChannels = async () => {
    setChannelSelectorOpen(true)
    setChannelsLoading(true)
    try {
      const channels = await getSlackChannels()
      setSlackChannelsState(channels)
    } catch {
      toastError('Failed to load Slack channels')
    } finally {
      setChannelsLoading(false)
    }
  }

  const handleSaveChannels = async (channelIds: string[]) => {
    try {
      await setSlackChannels(channelIds)
      toastSuccess(`${channelIds.length} channels selected for sync`)
    } catch {
      toastError('Failed to save channel selection')
    }
  }

  return (
    <>
      <div className="page-content">
        <div className="max-w-2xl space-y-12">
          {/* Profile section */}
          <div>
            <h2 className="section-heading mt-0">Your profile</h2>
            <Card>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-(--text-tertiary)">Name</dt>
                  <dd>{user?.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-(--text-tertiary)">Email</dt>
                  <dd>{user?.email}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-(--text-tertiary)">Role</dt>
                  <dd>
                    <Badge>{user?.role}</Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-(--text-tertiary)">Org ID</dt>
                  <dd>
                    <code className="text-xs text-(--text-accent)">{user?.orgId}</code>
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          {/* Integrations section */}
          <div>
            <h2 className="section-heading mt-0">Integrations</h2>
            <p className="mb-6 text-(--text-tertiary)">
              Connect your tools to automatically sync knowledge into Brainyfy.
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <div className="grid-2">
                <IntegrationCard
                  type="slack"
                  name="Slack"
                  description="Sync messages from selected channels into your knowledge base."
                  icon="💬"
                  integration={slack}
                  onConnect={() => connect('slack')}
                  onSync={async () => {
                    try {
                      const result = await sync('slack')
                      toastSuccess(`Synced ${result.itemsSynced} items from Slack`)
                    } catch {
                      toastError('Slack sync failed')
                    }
                  }}
                  onDisconnect={async () => {
                    try {
                      await disconnect('slack')
                      toastSuccess('Slack disconnected')
                    } catch {
                      toastError('Failed to disconnect Slack')
                    }
                  }}
                  onConfigure={handleOpenChannels}
                />

                <IntegrationCard
                  type="notion"
                  name="Notion"
                  description="Sync all workspace pages — including private pages you grant access to."
                  icon="📝"
                  integration={notion}
                  onConnect={() => connect('notion')}
                  onSync={async () => {
                    try {
                      const result = await sync('notion')
                      toastSuccess(`Synced ${result.itemsSynced} pages from Notion`)
                    } catch {
                      toastError('Notion sync failed')
                    }
                  }}
                  onDisconnect={async () => {
                    try {
                      await disconnect('notion')
                      toastSuccess('Notion disconnected')
                    } catch {
                      toastError('Failed to disconnect Notion')
                    }
                  }}
                />

                <IntegrationCard
                  type="linear"
                  name="Linear"
                  description="Sync issues and project docs from Linear (coming soon)."
                  icon="🔷"
                  disabled
                  onConnect={() => {}}
                  onSync={async () => {}}
                  onDisconnect={async () => {}}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ChannelSelector
        open={channelSelectorOpen}
        channels={slackChannels}
        loading={channelsLoading}
        selected={(slack?.config?.channels as string[]) || []}
        onSave={handleSaveChannels}
        onClose={() => setChannelSelectorOpen(false)}
      />
    </>
  )
}

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <Suspense fallback={<div className="flex flex-1 items-center justify-center"><Spinner className="h-6 w-6" /></div>}>
        <SettingsContent />
      </Suspense>
    </>
  )
}
