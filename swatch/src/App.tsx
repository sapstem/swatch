import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import UploadZone from './components/UploadZone'
import Palette from './components/Palette'
import ExportPanel from './components/ExportPanel'
import { extractColors } from './utils/extractColors'
import type { Color } from './types'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [colors, setColors] = useState<Color[]>([])
  const [colorCount, setColorCount] = useState(6)
  const [isExtracting, setIsExtracting] = useState(false)

  const dominantHex = colors[0]?.hex ?? null

  const handleImageUpload = useCallback(async (url: string) => {
    setImageUrl(url)
    setColors([])
    setIsExtracting(true)
    try {
      const extracted = await extractColors(url, colorCount)
      setColors(extracted)
    } catch (err) {
      console.error('Color extraction failed:', err)
    } finally {
      setIsExtracting(false)
    }
  }, [colorCount])

  const handleColorCountChange = useCallback(async (count: number) => {
    setColorCount(count)
    if (!imageUrl) return
    setIsExtracting(true)
    try {
      const extracted = await extractColors(imageUrl, count)
      setColors((prev) => {
        const locked = prev.filter((c) => c.locked)
        const lockedHexes = new Set(locked.map((c) => c.hex))
        const newUnlocked = extracted.filter((c) => !lockedHexes.has(c.hex))
        const slots = Math.max(0, count - locked.length)
        return [...locked, ...newUnlocked.slice(0, slots)].slice(0, count)
      })
    } catch (err) {
      console.error('Color extraction failed:', err)
    } finally {
      setIsExtracting(false)
    }
  }, [imageUrl])

  const handleToggleLock = useCallback((hex: string) => {
    setColors((prev) =>
      prev.map((c) => (c.hex === hex ? { ...c, locked: !c.locked } : c))
    )
  }, [])

  const appStyle: React.CSSProperties = dominantHex
    ? { backgroundColor: hexToRgba(dominantHex, 0.045) }
    : {}

  return (
    <div className="app" style={appStyle}>
      {/* Proportional color strip */}
      <div className="color-strip">
        {colors.map((color, i) => (
          <motion.div
            key={color.hex}
            className="color-strip-segment"
            style={{ backgroundColor: color.hex, flex: color.percentage }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.28 }}
          />
        ))}
      </div>

      <main className="main">
        <header className="header">
          <span className="logo">swatch</span>
          <span className="tagline">color palette extractor</span>
        </header>

        <UploadZone onUpload={handleImageUpload} />

        <AnimatePresence>
          {(colors.length > 0 || isExtracting) && (
            <motion.div
              className="results"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Palette
                colors={colors}
                colorCount={colorCount}
                onColorCountChange={handleColorCountChange}
                onToggleLock={handleToggleLock}
                isExtracting={isExtracting}
              />

              {colors.length > 0 && <ExportPanel colors={colors} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
