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

export interface ProjectTask {
  text: string
  completed: boolean
}

export interface ProjectIssue {
  id: number
  title: string
  description: string
  status: 'ACTIVE' | 'COMPLETED' | 'BLOCKED'
  kind: 'FEATURE' | 'TASK'
  categories: string[]
  tasks: ProjectTask[]
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
  projects: ProjectIssue[]
  refreshing: boolean
}
