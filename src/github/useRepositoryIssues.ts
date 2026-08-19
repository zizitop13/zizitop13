import { useEffect, useMemo, useState } from 'react'
import { fetchIssuesOnce, GitHubRequestError, isFresh, readIssueCache } from './githubClient'
import { mapIssuesToProjects } from './issueMapper'
import type { IssueLoadState } from './githubTypes'

export function useRepositoryIssues(): IssueLoadState {
  const initialCache = useMemo(readIssueCache, [])
  const [state, setState] = useState<IssueLoadState>(() => {
    if (!initialCache) return { status: 'loading', source: null, projects: [], refreshing: false }
    const projects = mapIssuesToProjects(initialCache.data)
    return {
      status: projects.length ? 'success' : 'empty',
      source: isFresh(initialCache) ? 'cache' : 'stale-cache',
      projects,
      refreshing: true,
    }
  })

  useEffect(() => {
    let active = true

    fetchIssuesOnce(initialCache)
      .then(cache => {
        if (!active) return
        const projects = mapIssuesToProjects(cache.data)
        setState({
          status: projects.length ? 'success' : 'empty',
          source: initialCache && cache.fetchedAt === initialCache.fetchedAt ? 'cache' : 'network',
          projects,
          refreshing: false,
        })
      })
      .catch(error => {
        if (!active) return
        const cachedProjects = initialCache ? mapIssuesToProjects(initialCache.data) : []
        setState({
          status: error instanceof GitHubRequestError && error.kind === 'rate-limited' ? 'rate-limited' : 'error',
          source: cachedProjects.length ? 'stale-cache' : null,
          projects: cachedProjects,
          refreshing: false,
        })
      })

    return () => { active = false }
  }, [initialCache])

  return state
}
