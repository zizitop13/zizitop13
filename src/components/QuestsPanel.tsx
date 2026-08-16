import { useEffect, useState } from 'react'
import { ISSUES_PAGE_URL } from '../github/githubClient'
import type { Quest } from '../github/githubTypes'
import { useRepositoryIssues } from '../github/useRepositoryIssues'
import { publicLinks } from '../portfolioData'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value)).toUpperCase()
}

function QuestProgress({ quest }: { quest: Quest }) {
  if (quest.progress === null) return <span className="active-copy">ACTIVE / NO CHECKLIST</span>
  const complete = quest.status === 'COMPLETED' ? quest.objectives.length : quest.objectives.filter(item => item.completed).length
  const total = quest.objectives.length
  return (
    <div className="quest-progress">
      <div><span>OBJECTIVES {complete} / {total}</span><strong>{quest.progress}%</strong></div>
      <div className="progress-track" role="progressbar" aria-label="Quest progress" aria-valuenow={quest.progress} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${quest.progress}%` }} />
      </div>
    </div>
  )
}

function QuestDetails({ quest, onClose }: { quest: Quest, onClose: () => void }) {
  return (
    <article className="quest-details" aria-labelledby={`quest-${quest.id}-heading`}>
      <header>
        <div>
          <p className="section-code">{quest.kind} / #{String(quest.id).padStart(3, '0')}</p>
          <h3 id={`quest-${quest.id}-heading`}>{quest.title}</h3>
        </div>
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close quest details">[×]</button>
      </header>
      <div className="quest-badges">
        <span className={`quest-state state-${quest.status.toLowerCase()}`}>{quest.status}</span>
        {quest.categories.map(category => <span key={category}>{category}</span>)}
      </div>
      <p className="quest-description">{quest.description}</p>
      <QuestProgress quest={quest} />
      {quest.objectives.length > 0 && (
        <section className="objectives" aria-labelledby="objectives-heading">
          <h4 id="objectives-heading">OBJECTIVES</h4>
          <ul>
            {quest.objectives.map((objective, index) => (
              <li key={`${index}-${objective.text}`} className={objective.completed ? 'done' : ''}>
                <span aria-hidden="true">[{objective.completed ? '×' : ' '}]</span> {objective.text}
              </li>
            ))}
          </ul>
        </section>
      )}
      <footer>
        <span>CREATED {formatDate(quest.createdAt)} / UPDATED {formatDate(quest.updatedAt)}</span>
        <a href={quest.url} target="_blank" rel="noreferrer noopener">OPEN ON GITHUB ↗</a>
      </footer>
    </article>
  )
}

export function QuestsPanel() {
  const issueState = useRepositoryIssues()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = issueState.quests.find(quest => quest.id === selectedId) ?? null

  useEffect(() => {
    if (selectedId === null && issueState.quests.length > 0) setSelectedId(issueState.quests[0].id)
  }, [issueState.quests, selectedId])

  const offline = issueState.source === 'stale-cache' && (issueState.status === 'error' || issueState.status === 'rate-limited')

  return (
    <div className="quests-panel">
      <header className="project-brief">
        <div>
          <p className="section-code">MAIN QUEST / OPEN SOURCE</p>
          <h2>HELIOS GATEWAY</h2>
        </div>
        <span className="project-signal"><span className="indicator" aria-hidden="true" />PROJECT ACTIVE</span>
        <p>Open-source GraphQL Federation gateway with authentication, role-based access control, service discovery and cloud-native deployment support.</p>
        <a href={publicLinks.helios} target="_blank" rel="noreferrer noopener">REPOSITORY ↗</a>
      </header>

      <div className="comlink-message" aria-live="polite">
        {issueState.status === 'loading' && 'ESTABLISHING COMLINK — LOADING QUEST DATA'}
        {issueState.refreshing && 'CACHED QUEST DATA LOADED — SYNCHRONIZING'}
        {offline && 'COMLINK OFFLINE — DISPLAYING CACHED QUEST DATA'}
        {issueState.status === 'rate-limited' && !offline && 'COMLINK RATE LIMITED — LIVE QUEST DATA UNAVAILABLE'}
        {issueState.status === 'error' && !offline && 'COMLINK FAILURE — LIVE QUEST DATA UNAVAILABLE'}
        {issueState.status === 'empty' && 'NO ACTIVE OR COMPLETED ISSUE QUESTS FOUND'}
        {issueState.status === 'success' && !issueState.refreshing && `COMLINK ONLINE — ${issueState.quests.length} QUEST${issueState.quests.length === 1 ? '' : 'S'} RECEIVED`}
      </div>

      {(issueState.status === 'error' || issueState.status === 'rate-limited') && issueState.quests.length === 0 ? (
        <a className="fallback-link" href={ISSUES_PAGE_URL} target="_blank" rel="noreferrer noopener">VIEW QUESTS ON GITHUB ↗</a>
      ) : issueState.quests.length > 0 ? (
        <div className={`quest-workspace ${selected ? 'has-detail' : ''}`}>
          <section className="quest-list" aria-labelledby="quest-list-heading">
            <div className="pane-heading"><h3 id="quest-list-heading">QUEST LOG</h3><span>MAX 100</span></div>
            <div className="quest-list-items">
              {issueState.quests.map(quest => (
                <button
                  key={quest.id}
                  type="button"
                  className={selectedId === quest.id ? 'selected' : ''}
                  aria-pressed={selectedId === quest.id}
                  onClick={() => setSelectedId(quest.id)}
                >
                  <span className="quest-number">#{String(quest.id).padStart(3, '0')}</span>
                  <strong>{quest.title}</strong>
                  <span className={`quest-state state-${quest.status.toLowerCase()}`}>{quest.status}</span>
                </button>
              ))}
            </div>
          </section>
          {selected ? <QuestDetails quest={selected} onClose={() => setSelectedId(null)} /> : <div className="no-selection">SELECT A QUEST FOR DETAILS</div>}
        </div>
      ) : null}
    </div>
  )
}
