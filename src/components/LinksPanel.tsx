import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { publicLinks } from '../portfolioData'

const links = [
  ['GITHUB', publicLinks.github],
  ['LINKEDIN', publicLinks.linkedin],
  ['HELIOS GATEWAY', publicLinks.helios],
] as const

export function LinksPanel() {
  const [selected, setSelected] = useState(0)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const selectRelativeLink = (direction: 1 | -1, index = selected) => {
    const next = (index + direction + links.length) % links.length
    setSelected(next)
    linkRefs.current[next]?.focus()
  }

  const navigateFromLink = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    selectRelativeLink(event.key === 'ArrowDown' ? 1 : -1, index)
  }

  useEffect(() => {
    const navigateFromPanel = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented) return
      const panel = document.getElementById('panel-links')
      if (!panel || panel.hidden) return

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
        selectRelativeLink(event.key === 'ArrowDown' ? 1 : -1)
      }

      const targetIsControl = event.target instanceof Element && Boolean(event.target.closest('a, button'))
      if (event.key === 'Enter' && !targetIsControl) {
        event.preventDefault()
        linkRefs.current[selected]?.click()
      }
    }

    window.addEventListener('keydown', navigateFromPanel)
    return () => window.removeEventListener('keydown', navigateFromPanel)
  }, [selected])

  return (
    <section className="links-panel" aria-labelledby="links-heading">
      <p className="section-code">EXTERNAL COMLINKS / PUBLIC</p>
      <h2 id="links-heading">LINKS</h2>
      <ul>
        {links.map(([label, url], index) => (
          <li key={label} className={selected === index ? 'selected' : ''}>
            <span className="link-index">{String(index + 1).padStart(2, '0')}</span>
            <div><strong>{label}</strong><span>{url}</span></div>
            <a
              ref={node => { linkRefs.current[index] = node }}
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              onFocus={() => setSelected(index)}
              onMouseEnter={() => setSelected(index)}
              onKeyDown={event => navigateFromLink(event, index)}
            >
              OPEN <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
