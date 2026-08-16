import { useEffect, useMemo, useState } from 'react'
import { fetchIssuesOnce, GitHubRequestError, isFresh, readIssueCache } from './githubClient'
import { mapIssuesToQuests } from './issueMapper'
import type { IssueLoadState } from './githubTypes'

export function useRepositoryIssues(): IssueLoadState {
  const initialCache = useMemo(readIssueCache, [])
  const [state, setState] = useState<IssueLoadState>(() => {
    if (!initialCache) return { status: 'loading', source: null, quests: [], refreshing: false }
    const quests = mapIssuesToQuests(initialCache.data)
    return {
      status: quests.length ? 'success' : 'empty',
      source: isFresh(initialCache) ? 'cache' : 'stale-cache',
      quests,
      refreshing: true,
    }
  })

  useEffect(() => {
    let active = true

    fetchIssuesOnce(initialCache)
      .then(cache => {
        if (!active) return
        const quests = mapIssuesToQuests(cache.data)
        setState({
          status: quests.length ? 'success' : 'empty',
          source: initialCache && cache.fetchedAt === initialCache.fetchedAt ? 'cache' : 'network',
          quests,
          refreshing: false,
        })
      })
      .catch(error => {
        if (!active) return
        const cachedQuests = initialCache ? mapIssuesToQuests(initialCache.data) : []
        setState({
          status: error instanceof GitHubRequestError && error.kind === 'rate-limited' ? 'rate-limited' : 'error',
          source: cachedQuests.length ? 'stale-cache' : null,
          quests: cachedQuests,
          refreshing: false,
        })
      })

    return () => { active = false }
  }, [initialCache])

  return state
}
