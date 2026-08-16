import type { QuestObjective } from './githubTypes'

const TASK_ITEM = /^\s*[-*+]\s+\[([ xX])\]\s+(.+?)\s*$/gm

export function parseTaskList(body: string | null): QuestObjective[] {
  if (!body) return []

  return Array.from(body.matchAll(TASK_ITEM), match => ({
    completed: match[1].toLowerCase() === 'x',
    text: match[2],
  }))
}

export function calculateProgress(
  objectives: QuestObjective[],
  issueState: 'open' | 'closed',
): number | null {
  if (issueState === 'closed') return 100
  if (objectives.length === 0) return null

  const completed = objectives.filter(objective => objective.completed).length
  return Math.round((completed / objectives.length) * 100)
}
