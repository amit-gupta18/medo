'use client'

import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <>
      <Topbar title="Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl space-y-6">
          <Card>
            <h2 className="font-semibold">Your profile</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Name</dt>
                <dd>{user?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Email</dt>
                <dd>{user?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Role</dt>
                <dd>
                  <Badge>{user?.role}</Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold">Organization</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Org ID: <code className="text-xs">{user?.orgId}</code>
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Member management and integrations (Slack, Notion) are planned for a future release.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
