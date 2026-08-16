export interface GitHubLabel {
  name: string
}

export interface GitHubIssue {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  labels: GitHubLabel[]
  html_url: string
  created_at: string
  updated_at: string
  pull_request?: unknown
}

export interface QuestObjective {
  text: string
  completed: boolean
}

export interface Quest {
  id: number
  title: string
  description: string
  status: 'ACTIVE' | 'COMPLETED' | 'BLOCKED'
  kind: 'MAIN QUEST' | 'SIDE QUEST'
  categories: string[]
  objectives: QuestObjective[]
  progress: number | null
  url: string
  createdAt: string
  updatedAt: string
}

export type IssueLoadStatus = 'loading' | 'success' | 'empty' | 'rate-limited' | 'error'
export type IssueDataSource = 'network' | 'cache' | 'stale-cache' | null

export interface IssueLoadState {
  status: IssueLoadStatus
  source: IssueDataSource
  quests: Quest[]
  refreshing: boolean
}
