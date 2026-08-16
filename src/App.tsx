import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

const links = {
  github: 'https://github.com/zizitop13',
  linkedin: 'https://www.linkedin.com/in/maksim-ziniakov-6005a124b',
  helios: 'https://github.com/zizitop13/helios-gateway',
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="terminal-link" href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true"> ↗</span></a>
}

export default function App() {
  const [screen, setScreen] = useState(0)
  const [booting, setBooting] = useState(() => !sessionStorage.getItem('mz-booted'))
  const touchStart = useRef<number | null>(null)

  const goTo = useCallback((next: number) => setScreen(Math.max(0, Math.min(1, next))), [])

  useEffect(() => {
    if (!booting) return
    sessionStorage.setItem('mz-booted', '1')
    const timer = window.setTimeout(() => setBooting(false), 560)
    return () => window.clearTimeout(timer)
  }, [booting])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(screen - 1) }
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(screen + 1) }
      if (event.key === 'Home') { event.preventDefault(); goTo(0) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo, screen])

  return (
    <main className="shell" onTouchStart={e => { touchStart.current = e.touches[0].clientX }} onTouchEnd={e => {
      if (touchStart.current === null) return
      const delta = e.changedTouches[0].clientX - touchStart.current
      if (Math.abs(delta) > 55) goTo(screen + (delta < 0 ? 1 : -1))
      touchStart.current = null
    }}>
      <div className="solar-field" aria-hidden="true" />
      {booting && <div className="boot" role="status"><span>WISPR//PORTFOLIO</span><span>LINK ........ OK</span><span>READY<span className="block-cursor" /></span></div>}
      <section className="terminal" aria-label="Portfolio terminal">
        <header className="terminal-header">
          <div><span className="status-dot" aria-hidden="true" /> SYS.PORTFOLIO</div>
          <div className="system-status">FRANKFURT / <span>ONLINE</span></div>
        </header>

        <nav className="screen-tabs" aria-label="Portfolio screens">
          <button className={screen === 0 ? 'active' : ''} onClick={() => goTo(0)} aria-current={screen === 0 ? 'page' : undefined}>01 / IDENTITY</button>
          <button className={screen === 1 ? 'active' : ''} onClick={() => goTo(1)} aria-current={screen === 1 ? 'page' : undefined}>02 / HELIOS</button>
        </nav>

        <div className="viewport">
          <div className="track" style={{ transform: `translateX(-${screen * 50}%)` }}>
            <article className="screen" aria-hidden={screen !== 0} inert={screen !== 0 ? true : undefined}>
              <div className="screen-index" aria-hidden="true">01</div>
              <p className="eyebrow">IDENT / PRIMARY RECORD</p>
              <dl className="identity-grid">
                <dt>IDENT</dt><dd><h1 className="identity-name">MAKSIM ZINIAKOV</h1></dd>
                <dt>ROLE</dt><dd>SENIOR SOFTWARE ENGINEER</dd>
                <dt>LOCATION</dt><dd>FRANKFURT AM MAIN, DE</dd>
              </dl>
              <p className="description">Java, Kotlin, and JavaScript engineer specializing in high-performance distributed systems, concurrency, cloud infrastructure, and developer tooling.</p>
              <div className="link-list" aria-label="Professional profiles">
                <ExternalLink href={links.github}>github</ExternalLink>
                <ExternalLink href={links.linkedin}>linkedin</ExternalLink>
              </div>
            </article>

            <article className="screen helios" aria-hidden={screen !== 1} inert={screen !== 1 ? true : undefined}>
              <div className="screen-index" aria-hidden="true">02</div>
              <p className="eyebrow">PROJECT / 01</p>
              <h1>HELIOS<br />GATEWAY</h1>
              <p className="description">An open-source GraphQL Federation gateway with authentication, role-based access control, service discovery, and cloud-native deployment support.</p>
              <dl className="project-status"><dt>STATUS</dt><dd><span className="status-dot" aria-hidden="true" /> ACTIVE</dd><dt>LINK</dt><dd>PUBLIC REPOSITORY</dd></dl>
              <div className="link-list"><ExternalLink href={links.helios}>open repository</ExternalLink></div>
            </article>
          </div>
        </div>

        <footer className="terminal-footer">
          <div className="nav-controls">
            <button onClick={() => goTo(screen - 1)} disabled={screen === 0} aria-label="Previous screen">[←] <span>PREV</span></button>
            <span className="enter-hint">[ENTER] OPEN</span>
            <button onClick={() => goTo(screen + 1)} disabled={screen === 1} aria-label="Next screen"><span>NEXT</span> [→]</button>
          </div>
          <a className="credit" href="https://svs.gsfc.nasa.gov/14865" target="_blank" rel="noreferrer">WISPR imagery: NASA / Johns Hopkins APL / NRL</a>
        </footer>
      </section>
    </main>
  )
}
