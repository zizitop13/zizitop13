import type { KeyboardEvent, RefObject } from 'react'

export const tabs = ['STATUS', 'SKILLS', 'PROJECTS', 'LINKS'] as const
export type TabName = typeof tabs[number]

interface TerminalTabsProps {
  activeIndex: number
  onSelect: (index: number, moveFocus?: boolean) => void
  tabRefs: RefObject<(HTMLButtonElement | null)[]>
}

export function TerminalTabs({ activeIndex, onSelect, tabRefs }: TerminalTabsProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null
    if (event.key === 'ArrowRight') next = (activeIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') next = (activeIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1
    if (next === null) return
    event.preventDefault()
    event.stopPropagation()
    onSelect(next, true)
  }

  return (
    <nav className="terminal-tabs" aria-label="Portfolio sections">
      <div role="tablist" aria-label="Portfolio sections">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            ref={node => { tabRefs.current[index] = node }}
            id={`tab-${tab.toLowerCase()}`}
            role="tab"
            type="button"
            aria-selected={activeIndex === index}
            aria-controls={`panel-${tab.toLowerCase()}`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => onSelect(index)}
            onKeyDown={onKeyDown}
          >
            <span aria-hidden="true">[ </span>{tab}<span aria-hidden="true"> ]</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
