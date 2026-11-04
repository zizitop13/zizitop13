import { useEffect, useState } from 'react'

type CopyStatus = 'idle' | 'copied' | 'error'

function fallbackCopy(text: string): boolean {
  const input = document.createElement('textarea')
  input.value = text
  input.readOnly = true
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()

  try {
    return document.execCommand('copy')
  } finally {
    input.remove()
  }
}

export function CopyLinkButton({ url, label }: { url: string, label: string }) {
  const [status, setStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (status === 'idle') return

    const timeout = window.setTimeout(() => setStatus('idle'), 2200)
    return () => window.clearTimeout(timeout)
  }, [status])

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else if (!fallbackCopy(url)) {
        throw new Error('Clipboard not available')
      }
      setStatus('copied')
    } catch {
      try {
        setStatus(fallbackCopy(url) ? 'copied' : 'error')
      } catch {
        setStatus('error')
      }
    }
  }

  const buttonText = status === 'copied' ? 'COPIED ✓' : status === 'error' ? 'RETRY COPY' : 'COPY'

  return (
    <button
      type="button"
      className="copy-link-button"
      onClick={() => { void copyLink() }}
      aria-label={status === 'copied' ? `${label} link copied` : `Copy ${label} link`}
      title={status === 'error' ? 'Copy failed — try again' : `Copy ${label} link`}
    >
      <span aria-live="polite">{buttonText}</span>
    </button>
  )
}
