import { useCallback, useState } from 'react'
import type { Color, ExportFormat } from '../types'

interface Props {
  colors: Color[]
}

function toCssVars(colors: Color[]): string {
  const vars = colors
    .map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`)
    .join('\n')
  return `:root {\n${vars}\n}`
}

function toTailwind(colors: Color[]): string {
  const entries = colors
    .map((c, i) => `      'swatch-${i + 1}': '${c.hex}', // ${c.name}`)
    .join('\n')
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${entries}
      },
    },
  },
}`
}

function toHexList(colors: Color[]): string {
  return colors.map((c) => `${c.hex}  ${c.name}  ${c.percentage}%`).join('\n')
}

function getContent(colors: Color[], format: ExportFormat): string {
  switch (format) {
    case 'css':      return toCssVars(colors)
    case 'tailwind': return toTailwind(colors)
    case 'hex':      return toHexList(colors)
  }
}

function getFilename(format: ExportFormat): string {
  switch (format) {
    case 'css':      return 'palette.css'
    case 'tailwind': return 'tailwind.config.js'
    case 'hex':      return 'palette.txt'
  }
}

const TABS: ExportFormat[] = ['css', 'tailwind', 'hex']

export default function ExportPanel({ colors }: Props) {
  const [format, setFormat] = useState<ExportFormat>('css')
  const [copied, setCopied] = useState(false)

  const content = getContent(colors, format)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard not available
    }
  }, [content])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getFilename(format)
    a.click()
    URL.revokeObjectURL(url)
  }, [content, format])

  return (
    <div className="export-panel">
      <div className="export-panel__tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`export-panel__tab${format === tab ? ' export-panel__tab--active' : ''}`}
            onClick={() => { setFormat(tab); setCopied(false) }}
          >
            {tab}
          </button>
        ))}
      </div>

      <pre className="export-panel__code">{content}</pre>

      <div className="export-panel__actions">
        <button className="btn btn--secondary" onClick={handleCopy}>
          {copied ? 'copied!' : 'copy'}
        </button>
        <button className="btn btn--primary" onClick={handleDownload}>
          download
        </button>
      </div>
    </div>
  )
}
