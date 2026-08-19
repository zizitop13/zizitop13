import type { ProjectTask } from './githubTypes'

const TASK_ITEM = /^\s*[-*+]\s+\[([ xX])\]\s+(.+?)\s*$/gm

export function parseTaskList(body: string | null): ProjectTask[] {
  if (!body) return []

  return Array.from(body.matchAll(TASK_ITEM), match => ({
    completed: match[1].toLowerCase() === 'x',
    text: match[2],
  }))
}

export function calculateProgress(
  tasks: ProjectTask[],
  issueState: 'open' | 'closed',
): number | null {
  if (issueState === 'closed') return 100
  if (tasks.length === 0) return null

  const completed = tasks.filter(task => task.completed).length
  return Math.round((completed / tasks.length) * 100)
}
