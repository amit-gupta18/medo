export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  orgId: string
}

export interface Org {
  id: string
  name: string
  slug: string
}

export interface KnowledgeItem {
  id: string
  orgId: string
  title: string
  content: string
  source: 'PASTE' | 'UPLOAD' | 'URL' | 'SLACK' | 'NOTION'
  tags: string[]
  createdBy: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export interface Citation {
  id: string
  title: string
  excerpt: string
}

export interface GraphNode {
  id: string
  label: string
  tags: string[]
  val?: number
}

export interface GraphEdge {
  source: string
  target: string
  similarity: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphEdge[]
}

export interface Playbook {
  id: string
  topic: string
  title: string
  createdAt: string
  steps: PlaybookStep[]
}

export interface PlaybookStep {
  id: string
  order: number
  text: string
  completed: boolean
  sourceItemId?: string
  sourceItem?: { title: string }
}

export interface Integration {
  id: string
  type: 'SLACK' | 'NOTION' | 'LINEAR'
  teamName: string | null
  syncStatus: 'IDLE' | 'SYNCING' | 'ERROR'
  lastSyncedAt: string | null
  errorMessage: string | null
  config: Record<string, unknown> | null
}

export interface SlackChannel {
  id: string
  name: string
  topic: string
}

