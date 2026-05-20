'use client'

import { useEffect, useMemo, useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { KnowledgeList } from '@/components/knowledge/KnowledgeList'
import { TagFilter } from '@/components/knowledge/TagFilter'
import { UploadModal } from '@/components/knowledge/UploadModal'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useKnowledge } from '@/hooks/useKnowledge'
import { useToast } from '@/components/providers/ToastProvider'

export default function KnowledgePage() {
  const { items, loading, list, upload } = useKnowledge()
  const { toastSuccess, toastError } = useToast()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  useEffect(() => {
    list().catch(() => toastError('Failed to load knowledge items'))
  }, [list, toastError])

  const allTags = useMemo(
    () => [...new Set(items.flatMap((i) => i.tags))].sort(),
    [items],
  )

  const filtered = tagFilter ? items.filter((i) => i.tags.includes(tagFilter)) : items

  return (
    <>
      <Topbar title="Knowledge" onUpload={() => setUploadOpen(true)} />
      <div className="page-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-heading mb-2">Knowledge Base</h1>
            <p className="page-subheading mb-0">Manage and explore all data ingested into your organization's brain.</p>
          </div>
        </div>

        <TagFilter tags={allTags} selected={tagFilter} onSelect={setTagFilter} />
        {loading ? (
          <SkeletonList count={6} />
        ) : filtered.length === 0 ? (
          <div className="empty-state py-16">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-medium text-[var(--text-primary)]">
              {tagFilter ? 'No items match this tag' : 'No knowledge uploaded yet'}
            </p>
            <p className="mt-1 text-[var(--text-tertiary)]">
              {tagFilter ? 'Try selecting a different tag.' : 'Click the Upload button to add your first document.'}
            </p>
          </div>
        ) : (
          <KnowledgeList items={filtered} />
        )}
      </div>
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={async (payload) => {
          try {
            await upload(payload)
            toastSuccess('Knowledge uploaded successfully!')
          } catch {
            toastError('Upload failed. Please try again.')
          }
        }}
      />
    </>
  )
}
