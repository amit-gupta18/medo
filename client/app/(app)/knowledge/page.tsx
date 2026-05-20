'use client'

import { useEffect, useMemo, useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { KnowledgeList } from '@/components/knowledge/KnowledgeList'
import { TagFilter } from '@/components/knowledge/TagFilter'
import { UploadModal } from '@/components/knowledge/UploadModal'
import { Spinner } from '@/components/ui/Spinner'
import { useKnowledge } from '@/hooks/useKnowledge'

export default function KnowledgePage() {
  const { items, loading, list, upload } = useKnowledge()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  useEffect(() => {
    list()
  }, [list])

  const allTags = useMemo(
    () => [...new Set(items.flatMap((i) => i.tags))].sort(),
    [items],
  )

  const filtered = tagFilter ? items.filter((i) => i.tags.includes(tagFilter)) : items

  return (
    <>
      <Topbar title="Knowledge" onUpload={() => setUploadOpen(true)} />
      <div className="flex-1 overflow-y-auto p-6">
        <TagFilter tags={allTags} selected={tagFilter} onSelect={setTagFilter} />
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <KnowledgeList items={filtered} />
        )}
      </div>
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={async (payload) => {
          await upload(payload)
        }}
      />
    </>
  )
}
