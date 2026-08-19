import { useCallback, useEffect, useRef, useState } from 'react'
import { LinksPanel } from './components/LinksPanel'
import { ProjectsPanel } from './components/QuestsPanel'
import { SkillsPanel } from './components/SkillsPanel'
import { StatusPanel } from './components/StatusPanel'
import { tabs, TerminalTabs } from './components/TerminalTabs'

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const selectTab = useCallback((index: number, moveFocus = false) => {
    const normalized = (index + tabs.length) % tabs.length
    setActiveTab(normalized)
    if (moveFocus) requestAnimationFrame(() => tabRefs.current[normalized]?.focus())
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement
      if (target.matches('input, textarea, select')) return

      let next: number | null = null
      if (event.key === 'ArrowLeft') next = activeTab - 1
      if (event.key === 'ArrowRight') next = activeTab + 1
      if (event.key === 'Home') next = 0
      if (event.key === 'End') next = tabs.length - 1
      if (/^[1-4]$/.test(event.key)) next = Number(event.key) - 1
      if (next === null) return

      event.preventDefault()
      selectTab(next)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeTab, selectTab])

  return (
    <main className="portfolio-shell">
      <section className="terminal-window" aria-label="Maksim Ziniakov portfolio">
        <header className="terminal-header">
          <div className="terminal-brand">
            <span className="prompt-mark" aria-hidden="true">&gt;_</span>
            <div><strong>MAKSIM ZINIAKOV / PORTFOLIO</strong><small>~/software-engineer</small></div>
          </div>
          <div className="header-status" aria-label="Portfolio ready">
            <i aria-hidden="true" /><span>READY</span>
          </div>
        </header>

        <TerminalTabs activeIndex={activeTab} onSelect={selectTab} tabRefs={tabRefs} />

        <div className="terminal-content">
          <section id="panel-status" role="tabpanel" aria-labelledby="tab-status" hidden={activeTab !== 0} tabIndex={0}>
            <StatusPanel />
          </section>
          <section id="panel-skills" role="tabpanel" aria-labelledby="tab-skills" hidden={activeTab !== 1} tabIndex={0}>
            <SkillsPanel />
          </section>
          <section id="panel-projects" role="tabpanel" aria-labelledby="tab-projects" hidden={activeTab !== 2} tabIndex={0}>
            <ProjectsPanel />
          </section>
          <section id="panel-links" role="tabpanel" aria-labelledby="tab-links" hidden={activeTab !== 3} tabIndex={0}>
            <LinksPanel />
          </section>
        </div>

        <footer className="terminal-status-bar">
          <div className="key-hints" aria-hidden="true"><span>← PREV</span><span>→ NEXT</span><span>1–4 SELECT</span></div>
          <span className="system-clock">FRA / UTC+02</span>
        </footer>
      </section>
    </main>
  )
}
