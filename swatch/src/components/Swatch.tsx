import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Color } from '../types'

interface Props {
  color: Color
  index: number
  onToggleLock: (hex: string) => void
}

const LockClosedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const LockOpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
)

export default function Swatch({ color, index, onToggleLock }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopyHex = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(color.hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard not available
    }
  }

  return (
    <motion.div
      className="swatch"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.055, duration: 0.22, ease: 'easeOut' }}
      layout
    >
      <div
        className="swatch__dot"
        style={{ backgroundColor: color.hex }}
        aria-label={color.hex}
      />

      <button
        className={`swatch__hex${copied ? ' swatch__hex--copied' : ''}`}
        onClick={handleCopyHex}
        title="Click to copy hex"
      >
        {copied ? 'copied!' : color.hex}
      </button>

      <span className="swatch__name">{color.name}</span>

      <div className="swatch__bar-wrap" title={`${color.percentage}%`}>
        <div
          className="swatch__bar"
          style={{
            width: `${Math.min(100, color.percentage)}%`,
            backgroundColor: color.hex,
          }}
        />
      </div>

      <span className="swatch__pct">{color.percentage}%</span>

      <button
        className={`swatch__lock${color.locked ? ' swatch__lock--active' : ''}`}
        onClick={() => onToggleLock(color.hex)}
        title={color.locked ? 'Unlock color' : 'Lock color'}
        aria-pressed={color.locked}
      >
        {color.locked ? <LockClosedIcon /> : <LockOpenIcon />}
      </button>
    </motion.div>
  )
}
