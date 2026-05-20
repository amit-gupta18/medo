'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'
import type { Integration } from '@/types'

interface IntegrationCardProps {
  type: 'slack' | 'notion' | 'linear'
  name: string
  description: string
  icon: string
  integration?: Integration
  disabled?: boolean
  onConnect: () => void
  onSync: () => Promise<void>
  onDisconnect: () => Promise<void>
  onConfigure?: () => void
}

export function IntegrationCard({
  type,
  name,
  description,
  icon,
  integration,
  disabled,
  onConnect,
  onSync,
  onDisconnect,
  onConfigure,
}: IntegrationCardProps) {
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const connected = !!integration
  const isSyncing = syncing || integration?.syncStatus === 'SYNCING'

  const handleSync = async () => {
    setSyncing(true)
    try {
      await onSync()
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${name}? This will not delete existing knowledge items.`)) return
    setDisconnecting(true)
    try {
      await onDisconnect()
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="card-title">{name}</h3>
            {connected ? (
              <Badge>{integration.teamName || 'Connected'}</Badge>
            ) : disabled ? (
              <Badge>Coming soon</Badge>
            ) : null}
          </div>
          <p className="card-desc mt-1">{description}</p>

          {connected && integration.lastSyncedAt && (
            <p className="caption mt-2">
              Last synced: {formatDate(integration.lastSyncedAt)}
            </p>
          )}

          {integration?.syncStatus === 'ERROR' && integration.errorMessage && (
            <p className="caption text-(--red) mt-2">
              Error: {integration.errorMessage}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {disabled ? (
          <Button size="sm" disabled>
            Coming soon
          </Button>
        ) : !connected ? (
          <Button size="sm" onClick={onConnect}>
            Connect {name}
          </Button>
        ) : (
          <>
            {onConfigure && (
              <Button size="sm" variant="secondary" onClick={onConfigure}>
                Configure
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? <><Spinner /> Syncing…</> : 'Sync now'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
