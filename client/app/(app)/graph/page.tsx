'use client'

import { useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { useGraph } from '@/hooks/useGraph'
import { useKnowledge } from '@/hooks/useKnowledge'
import { usePlaybooks } from '@/hooks/usePlaybooks'
import { useToast } from '@/components/providers/ToastProvider'
import { formatDistanceToNow } from 'date-fns'

export default function GraphPage() {
  const { data: graphData, loading: graphLoading, fetchGraph } = useGraph()
  const { items: knowledgeItems, loading: knowledgeLoading, list: fetchKnowledge } = useKnowledge()
  const { playbooks, loading: playbooksLoading, list: fetchPlaybooks } = usePlaybooks()
  const { toastError } = useToast()

  useEffect(() => {
    Promise.all([
      fetchGraph(),
      fetchKnowledge(),
      fetchPlaybooks(),
    ]).catch(() => toastError('Failed to load brain data'))
  }, [fetchGraph, fetchKnowledge, fetchPlaybooks, toastError])

  const isLoading = graphLoading || knowledgeLoading || playbooksLoading

  // Compute stats
  const totalItems = knowledgeItems.length
  const connectedSources = Array.from(new Set(knowledgeItems.map((item) => item.source))).length
  const coverage = Math.min(100, Math.round((totalItems / 50) * 100))

  // Top tags
  const tagsMap = new Map<string, number>()
  knowledgeItems.forEach((item) => {
    item.tags?.forEach((tag) => {
      tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1)
    })
  })
  const topTags = Array.from(tagsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((e) => e[0])

  return (
    <>
      <Topbar title="Graph" />
      <div className="page-content">
        <h1 className="page-heading">Knowledge Graph</h1>
        <p className="page-subheading">A unified map of your organization's connected knowledge</p>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="text-(--text-tertiary) text-sm">Loading your brain…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Stats row */}
            <div className="grid-3">
              <div className="stat-card">
                <div className="stat-value">{totalItems}</div>
                <div className="stat-label">Knowledge items</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{graphData.nodes.length}</div>
                <div className="stat-label">Connected entities</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{playbooks.length}</div>
                <div className="stat-label">Active playbooks</div>
              </div>
            </div>

            {/* Middle Row: Graph + Insights */}
            <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
              {/* Left col - Graph */}
              <div className="card relative p-0" style={{ minHeight: 450 }}>
                <div className="absolute left-5 top-5 z-10">
                  <h3 className="card-title">Knowledge Graph</h3>
                  <div className="card-desc">Visual map of topics and relationships</div>
                </div>
                {graphData.nodes.length === 0 ? (
                  <div className="empty-state flex h-full items-center justify-center border-none">
                    🕸️ No connections yet. Add knowledge to build your graph.
                  </div>
                ) : (
                  <GraphCanvas data={graphData} />
                )}
              </div>

              {/* Right col - Insights */}
              <div className="flex flex-col gap-6">
                <div className="card">
                  <h3 className="card-title mb-3">Top Topics</h3>
                  <div className="tag-grid">
                    {topTags.map((tag) => (
                      <span key={tag} className="badge badge-default">{tag}</span>
                    ))}
                    {topTags.length === 0 && <span className="text-[var(--text-tertiary)] text-sm">No topics yet</span>}
                  </div>
                </div>

                <div className="card flex-1">
                  <h3 className="card-title mb-3">Brain Health</h3>
                  <div className="mb-[5px] flex justify-between">
                    <span className="caption">Knowledge coverage</span>
                    <span className="caption">{coverage}%</span>
                  </div>
                  <div className="progress-bar mb-6">
                    <div className="progress-fill" style={{ width: `${coverage}%` }} />
                  </div>
                  
                  <div className="mb-[5px] flex justify-between">
                    <span className="caption">Sources integrated</span>
                    <span className="caption">{connectedSources}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (connectedSources / 4) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid-2">
              <div className="panel-section mb-0">
                <h2 className="section-heading mt-0">Recent Memories</h2>
                <div className="card overflow-hidden p-0">
                  {knowledgeItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="knowledge-row">
                      <div className="knowledge-row-icon">
                        {item.source === 'NOTION' ? '📝' : item.source === 'SLACK' ? '💬' : item.source === 'URL' ? '🔗' : '📄'}
                      </div>
                      <div className="knowledge-row-body">
                        <div className="knowledge-row-title">{item.title}</div>
                        <div className="knowledge-row-meta">
                          <span className={`badge badge-${item.source === 'UPLOAD' ? 'blue' : item.source === 'NOTION' ? 'accent' : 'default'}`}>
                            {item.source}
                          </span>
                          {item.tags?.slice(0, 2).map((t) => (
                            <span key={t} className="badge badge-default">{t}</span>
                          ))}
                          <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {knowledgeItems.length === 0 && (
                    <div className="empty-state border-none">No memories added yet.</div>
                  )}
                </div>
              </div>

              <div className="panel-section mb-0">
                <h2 className="section-heading mt-0">Lined Up</h2>
                <div className="flex flex-col gap-3">
                  {playbooks.slice(0, 4).map((pb) => {
                    const completed = pb.steps.filter((s) => s.completed).length
                    const total = pb.steps.length
                    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
                    return (
                      <div key={pb.id} className="sidebar-cta m-0">
                        <div className="sidebar-cta-label">
                          <span>✦ Playbook</span>
                          <span>{completed}/{total}</span>
                        </div>
                        <div className="sidebar-cta-title">{pb.topic}</div>
                        <div className="sidebar-cta-progress">
                          <div className="sidebar-cta-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {playbooks.length === 0 && (
                    <div className="empty-state">No playbooks lined up.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}
