import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { skillGroups } from '../portfolioData'

export function SkillsPanel() {
  const [selected, setSelected] = useState(0)
  const categoryRefs = useRef<(HTMLButtonElement | null)[]>([])
  const group = skillGroups[selected]

  const selectRelativeCategory = (direction: 1 | -1) => {
    const next = (selected + direction + skillGroups.length) % skillGroups.length
    setSelected(next)
    categoryRefs.current[next]?.focus()
  }

  const navigateCategories = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return

    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const next = (index + direction + skillGroups.length) % skillGroups.length
    setSelected(next)
    categoryRefs.current[next]?.focus()
  }

  useEffect(() => {
    const navigateFromPanel = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
      const panel = document.getElementById('panel-skills')
      if (!panel || panel.hidden) return

      event.preventDefault()
      selectRelativeCategory(event.key === 'ArrowDown' ? 1 : -1)
    }

    window.addEventListener('keydown', navigateFromPanel)
    return () => window.removeEventListener('keydown', navigateFromPanel)
  }, [selected])

  return (
    <div className="skills-layout">
      <section className="selector-list" aria-labelledby="skills-heading">
        <p className="section-code">~/skills/{String(selected + 1).padStart(2, '0')}</p>
        <h2 id="skills-heading">SKILLS</h2>
        <div className="category-list">
          {skillGroups.map((item, index) => (
            <button
              type="button"
              key={item.name}
              ref={node => { categoryRefs.current[index] = node }}
              className={selected === index ? 'selected' : ''}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              onKeyDown={event => navigateCategories(event, index)}
            >
              <span>{item.name}</span><small>{item.level}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="skill-detail" aria-live="polite" aria-labelledby="skill-group-heading">
        <header>
          <div>
            <p className="section-code">skill-group.json</p>
            <h3 id="skill-group-heading">{group.name}</h3>
          </div>
          <strong className={`level level-${group.level.toLowerCase()}`}>{group.level}</strong>
        </header>
        <div className="level-meter" aria-hidden="true">
          {[0, 1, 2, 3].map(segment => <span key={segment} className={segment < (group.level === 'ADVANCED' ? 3 : 4) ? 'filled' : ''} />)}
        </div>
        <ul className="skill-grid">
          {group.skills.map(skill => <li key={skill}>{skill}</li>)}
        </ul>
      </section>
    </div>
  )
}
