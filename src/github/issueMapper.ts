import type { GitHubIssue, ProjectIssue } from './githubTypes'
import { calculateProgress, parseTaskList } from './taskListParser'

const TASK_ITEM_LINE = /^\s*[-*+]\s+\[[ xX]\]\s+.+$/gm

function markdownToPlainText(markdown: string | null): string {
  if (!markdown) return 'No description provided.'

  const text = markdown
    .replace(TASK_ITEM_LINE, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>|]/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text || 'Tasks are listed below.'
}

export function mapIssueToProject(issue: GitHubIssue): ProjectIssue {
  const labels = issue.labels.map(label => label.name)
  const normalized = labels.map(label => label.toLowerCase())
  const tasks = parseTaskList(issue.body)
  const blocked = normalized.includes('status:blocked')

  return {
    id: issue.number,
    title: issue.title,
    description: markdownToPlainText(issue.body),
    status: issue.state === 'closed' ? 'COMPLETED' : blocked ? 'BLOCKED' : 'ACTIVE',
    kind: normalized.includes('quest:side') ? 'TASK' : 'FEATURE',
    categories: labels.filter(label => !label.toLowerCase().startsWith('quest:') && !label.toLowerCase().startsWith('status:')),
    tasks,
    progress: calculateProgress(tasks, issue.state),
    url: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
  }
}

export function mapIssuesToProjects(issues: GitHubIssue[]): ProjectIssue[] {
  return issues
    .filter(issue => !issue.pull_request)
    .map(mapIssueToProject)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
