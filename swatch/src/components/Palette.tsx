import { AnimatePresence, motion } from 'framer-motion'
import Swatch from './Swatch'
import type { Color } from '../types'

interface Props {
  colors: Color[]
  colorCount: number
  onColorCountChange: (count: number) => void
  onToggleLock: (hex: string) => void
  isExtracting: boolean
}

export default function Palette({
  colors,
  colorCount,
  onColorCountChange,
  onToggleLock,
  isExtracting,
}: Props) {
  return (
    <div className="palette">
      <div className="palette__header">
        <span className="palette__title">palette</span>
        <div className="palette__controls">
          <label className="palette__slider-label">
            <span className="palette__count">{colorCount} colors</span>
            <input
              type="range"
              min={3}
              max={12}
              step={1}
              value={colorCount}
              onChange={(e) => onColorCountChange(Number(e.target.value))}
              className="palette__slider"
            />
          </label>
        </div>
      </div>

      <div className="palette__list">
        <AnimatePresence mode="wait">
          {isExtracting ? (
            <motion.div
              key="loading"
              className="palette__loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              extracting colors…
            </motion.div>
          ) : (
            <motion.div key="colors">
              {colors.map((color, i) => (
                <Swatch
                  key={color.hex}
                  color={color}
                  index={i}
                  onToggleLock={onToggleLock}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
