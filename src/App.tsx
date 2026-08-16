import { useCallback, useEffect, useRef, useState } from 'react'
import { LinksPanel } from './components/LinksPanel'
import { QuestsPanel } from './components/QuestsPanel'
import { SkillsPanel } from './components/SkillsPanel'
import { StatusPanel } from './components/StatusPanel'
import { tabs, TerminalTabs } from './components/TerminalTabs'

const CRT_KEY = 'mz-crt-enabled'

function readCrtPreference() {
  try {
    return localStorage.getItem(CRT_KEY) !== 'false'
  } catch {
    return true
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [crtEnabled, setCrtEnabled] = useState(readCrtPreference)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const selectTab = useCallback((index: number, moveFocus = false) => {
    const normalized = (index + tabs.length) % tabs.length
    setActiveTab(normalized)
    if (moveFocus) requestAnimationFrame(() => tabRefs.current[normalized]?.focus())
  }, [])

  const toggleCrt = () => {
    setCrtEnabled(current => {
      const next = !current
      try { localStorage.setItem(CRT_KEY, String(next)) } catch { /* Preference remains in memory. */ }
      return next
    })
  }

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
    <main className={`portfolio-shell ${crtEnabled ? 'crt-on' : 'crt-off'}`}>
      <div className="ambient-image" aria-hidden="true" />
      <section className="device-frame" aria-label="Maksim Ziniakov engineering status terminal">
        <span className="frame-screw screw-a" aria-hidden="true" />
        <span className="frame-screw screw-b" aria-hidden="true" />
        <span className="frame-screw screw-c" aria-hidden="true" />
        <span className="frame-screw screw-d" aria-hidden="true" />

        <div className="display-bezel">
          <div className="display-screen">
            <div className="crt-overlay" aria-hidden="true"><span /></div>
            <header className="terminal-header">
              <div className="terminal-brand">
                <span className="brand-mark" aria-hidden="true">MZ</span>
                <div><strong>ENGINEERING STATUS TERMINAL</strong><small>PERSONAL SYSTEM / REV. 11</small></div>
              </div>
              <div className="header-telemetry" aria-label="System online">
                <span>SYS</span><strong>ONLINE</strong><i aria-hidden="true" />
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
              <section id="panel-quests" role="tabpanel" aria-labelledby="tab-quests" hidden={activeTab !== 2} tabIndex={0}>
                <QuestsPanel />
              </section>
              <section id="panel-links" role="tabpanel" aria-labelledby="tab-links" hidden={activeTab !== 3} tabIndex={0}>
                <LinksPanel />
              </section>
            </div>

            <footer className="terminal-status-bar">
              <div className="key-hints" aria-hidden="true"><span>[←] PREV</span><span>[→] NEXT</span><span>[ENTER] SELECT</span></div>
              <span className="crt-control">
                <button
                  className="crt-toggle"
                  type="button"
                  onClick={toggleCrt}
                  aria-pressed={crtEnabled}
                  aria-describedby="crt-tooltip"
                >
                  CRT: <strong>{crtEnabled ? 'ON' : 'OFF'}</strong>
                </button>
                <span id="crt-tooltip" className="control-tooltip" role="tooltip">
                  Cathode-ray tube effects: {crtEnabled ? 'on' : 'off'}
                </span>
              </span>
              <span className="system-clock">FRA / UTC+02</span>
            </footer>
          </div>
        </div>

        <div className="device-controls" aria-hidden="true">
          <span className="vent-lines" />
          <span className="dial"><i /></span>
          <span className="serial">MZ–11 / 2026</span>
        </div>
      </section>
    </main>
  )
}
