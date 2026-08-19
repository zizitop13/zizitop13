import { useEffect, useState } from 'react'
import { ISSUES_PAGE_URL } from '../github/githubClient'
import type { ProjectIssue } from '../github/githubTypes'
import { useRepositoryIssues } from '../github/useRepositoryIssues'
import { publicLinks } from '../portfolioData'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value)).toUpperCase()
}

function ProjectProgress({ project }: { project: ProjectIssue }) {
  if (project.progress === null) return <span className="active-copy">ACTIVE / NO CHECKLIST</span>
  const complete = project.status === 'COMPLETED' ? project.tasks.length : project.tasks.filter(item => item.completed).length
  const total = project.tasks.length
  return (
    <div className="project-progress">
      <div><span>TASKS {complete} / {total}</span><strong>{project.progress}%</strong></div>
      <div className="progress-track" role="progressbar" aria-label="Project progress" aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${project.progress}%` }} />
      </div>
    </div>
  )
}

function ProjectDetails({ project, onClose }: { project: ProjectIssue, onClose: () => void }) {
  return (
    <article className="project-details" aria-labelledby={`project-${project.id}-heading`}>
      <header>
        <div>
          <p className="section-code">{project.kind} / #{String(project.id).padStart(3, '0')}</p>
          <h3 id={`project-${project.id}-heading`}>{project.title}</h3>
        </div>
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close project details">[×]</button>
      </header>
      <div className="project-badges">
        <span className={`project-state state-${project.status.toLowerCase()}`}>{project.status}</span>
        {project.categories.map(category => <span key={category}>{category}</span>)}
      </div>
      <p className="project-description">{project.description}</p>
      <ProjectProgress project={project} />
      {project.tasks.length > 0 && (
        <section className="project-tasks" aria-labelledby="tasks-heading">
          <h4 id="tasks-heading">TASKS</h4>
          <ul>
            {project.tasks.map((task, index) => (
              <li key={`${index}-${task.text}`} className={task.completed ? 'done' : ''}>
                <span aria-hidden="true">[{task.completed ? '×' : ' '}]</span> {task.text}
              </li>
            ))}
          </ul>
        </section>
      )}
      <footer>
        <span>CREATED {formatDate(project.createdAt)} / UPDATED {formatDate(project.updatedAt)}</span>
        <a href={project.url} target="_blank" rel="noreferrer noopener">OPEN ON GITHUB ↗</a>
      </footer>
    </article>
  )
}

export function ProjectsPanel() {
  const issueState = useRepositoryIssues()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = issueState.projects.find(project => project.id === selectedId) ?? null

  useEffect(() => {
    if (selectedId === null && issueState.projects.length > 0) setSelectedId(issueState.projects[0].id)
  }, [issueState.projects, selectedId])

  const offline = issueState.source === 'stale-cache' && (issueState.status === 'error' || issueState.status === 'rate-limited')

  return (
    <div className="projects-panel">
      <header className="project-brief">
        <div>
          <p className="section-code">~/projects/open-source</p>
          <h2>HELIOS GATEWAY</h2>
        </div>
        <span className="project-signal"><span className="indicator" aria-hidden="true" />PROJECT ACTIVE</span>
        <p>Open-source GraphQL Federation gateway with authentication, role-based access control, service discovery and cloud-native deployment support.</p>
        <a href={publicLinks.helios} target="_blank" rel="noreferrer noopener">REPOSITORY ↗</a>
      </header>

      <div className="sync-message" aria-live="polite">
        {issueState.status === 'loading' && 'LOADING GITHUB ISSUES…'}
        {issueState.refreshing && 'CACHED DATA LOADED — SYNCING WITH GITHUB'}
        {offline && 'GITHUB OFFLINE — DISPLAYING CACHED DATA'}
        {issueState.status === 'rate-limited' && !offline && 'GITHUB RATE LIMIT REACHED — LIVE DATA UNAVAILABLE'}
        {issueState.status === 'error' && !offline && 'GITHUB REQUEST FAILED — LIVE DATA UNAVAILABLE'}
        {issueState.status === 'empty' && 'NO ACTIVE OR COMPLETED ISSUES FOUND'}
        {issueState.status === 'success' && !issueState.refreshing && `${issueState.projects.length} ISSUE${issueState.projects.length === 1 ? '' : 'S'} LOADED FROM GITHUB`}
      </div>

      {(issueState.status === 'error' || issueState.status === 'rate-limited') && issueState.projects.length === 0 ? (
        <a className="fallback-link" href={ISSUES_PAGE_URL} target="_blank" rel="noreferrer noopener">VIEW ISSUES ON GITHUB ↗</a>
      ) : issueState.projects.length > 0 ? (
        <div className={`project-workspace ${selected ? 'has-detail' : ''}`}>
          <section className="project-list" aria-labelledby="project-list-heading">
            <div className="pane-heading"><h3 id="project-list-heading">GITHUB ISSUES</h3><span>MAX 100</span></div>
            <div className="project-list-items">
              {issueState.projects.map(project => (
                <button
                  key={project.id}
                  type="button"
                  className={selectedId === project.id ? 'selected' : ''}
                  aria-pressed={selectedId === project.id}
                  onClick={() => setSelectedId(project.id)}
                >
                  <span className="project-number">#{String(project.id).padStart(3, '0')}</span>
                  <strong>{project.title}</strong>
                  <span className={`project-state state-${project.status.toLowerCase()}`}>{project.status}</span>
                </button>
              ))}
            </div>
          </section>
          {selected ? <ProjectDetails project={selected} onClose={() => setSelectedId(null)} /> : <div className="no-selection">SELECT AN ISSUE FOR DETAILS</div>}
        </div>
      ) : null}
    </div>
  )
}
