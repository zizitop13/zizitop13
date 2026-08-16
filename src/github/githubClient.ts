import type { GitHubIssue } from './githubTypes'

export const ISSUES_URL = 'https://api.github.com/repos/zizitop13/helios-gateway/issues?state=all&per_page=100'
export const ISSUES_PAGE_URL = 'https://github.com/zizitop13/helios-gateway/issues'
export const CACHE_KEY = 'helios-quest-cache-v1'
export const CACHE_TTL_MS = 15 * 60 * 1000

export interface IssueCache {
  data: GitHubIssue[]
  fetchedAt: number
  etag?: string
}

export class GitHubRequestError extends Error {
  constructor(public readonly kind: 'rate-limited' | 'network') {
    super(kind)
  }
}

export function readIssueCache(): IssueCache | null {
  try {
    const value = localStorage.getItem(CACHE_KEY)
    if (!value) return null
    const parsed = JSON.parse(value) as IssueCache
    return Array.isArray(parsed.data) && typeof parsed.fetchedAt === 'number' ? parsed : null
  } catch {
    return null
  }
}

function writeIssueCache(cache: IssueCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Storage may be disabled. Fresh network data is still usable.
  }
}

let sessionRequest: Promise<IssueCache> | null = null

async function requestIssues(cache: IssueCache | null): Promise<IssueCache> {
  let response: Response
  try {
    response = await fetch(ISSUES_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(cache?.etag ? { 'If-None-Match': cache.etag } : {}),
      },
    })
  } catch {
    throw new GitHubRequestError('network')
  }

  if (response.status === 304 && cache) {
    const refreshed = { ...cache, fetchedAt: Date.now() }
    writeIssueCache(refreshed)
    return refreshed
  }

  if (response.status === 403 || response.status === 429) {
    throw new GitHubRequestError('rate-limited')
  }
  if (!response.ok) throw new GitHubRequestError('network')

  const data = await response.json() as GitHubIssue[]
  const nextCache = {
    data,
    fetchedAt: Date.now(),
    etag: response.headers.get('ETag') ?? undefined,
  }
  writeIssueCache(nextCache)
  return nextCache
}

export function fetchIssuesOnce(cache: IssueCache | null): Promise<IssueCache> {
  sessionRequest ??= cache && isFresh(cache) ? Promise.resolve(cache) : requestIssues(cache)
  return sessionRequest
}

export function isFresh(cache: IssueCache): boolean {
  return Date.now() - cache.fetchedAt < CACHE_TTL_MS
}

export function resetIssueRequestForTests() {
  sessionRequest = null
}
