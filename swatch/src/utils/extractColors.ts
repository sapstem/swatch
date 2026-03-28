import type { Color } from '../types'

type RGB = [number, number, number]

// ── Color name lookup table (~50 entries, closest match wins) ──
const COLOR_NAMES: Array<{ rgb: RGB; name: string }> = [
  { rgb: [255, 255, 255], name: 'pure white' },
  { rgb: [245, 245, 243], name: 'soft white' },
  { rgb: [220, 218, 213], name: 'light silver' },
  { rgb: [178, 176, 170], name: 'silver' },
  { rgb: [128, 127, 122], name: 'medium gray' },
  { rgb: [82, 81, 77],   name: 'charcoal' },
  { rgb: [42, 41, 38],   name: 'near black' },
  { rgb: [10, 10, 10],   name: 'pure black' },
  { rgb: [253, 237, 208], name: 'warm sand' },
  { rgb: [244, 222, 179], name: 'wheat' },
  { rgb: [210, 180, 140], name: 'dusty tan' },
  { rgb: [162, 123, 92],  name: 'warm brown' },
  { rgb: [101, 67, 33],   name: 'dark chocolate' },
  { rgb: [74, 38, 18],    name: 'espresso' },
  { rgb: [255, 200, 148], name: 'peach' },
  { rgb: [248, 162, 96],  name: 'soft orange' },
  { rgb: [218, 97, 57],   name: 'burnt sienna' },
  { rgb: [176, 58, 40],   name: 'brick red' },
  { rgb: [196, 30, 30],   name: 'crimson' },
  { rgb: [252, 82, 82],   name: 'coral' },
  { rgb: [252, 200, 200], name: 'blush' },
  { rgb: [218, 158, 180], name: 'dusty rose' },
  { rgb: [178, 80, 122],  name: 'raspberry' },
  { rgb: [124, 36, 74],   name: 'wine' },
  { rgb: [254, 240, 96],  name: 'buttercup' },
  { rgb: [218, 196, 58],  name: 'golden' },
  { rgb: [178, 158, 38],  name: 'olive gold' },
  { rgb: [122, 140, 58],  name: 'moss' },
  { rgb: [98, 120, 54],   name: 'forest floor' },
  { rgb: [58, 98, 48],    name: 'deep green' },
  { rgb: [38, 78, 58],    name: 'pine' },
  { rgb: [98, 178, 138],  name: 'sage' },
  { rgb: [158, 210, 188], name: 'seafoam' },
  { rgb: [178, 222, 178], name: 'mint' },
  { rgb: [102, 162, 200], name: 'sky blue' },
  { rgb: [58, 118, 178],  name: 'cornflower' },
  { rgb: [38, 78, 158],   name: 'cobalt' },
  { rgb: [18, 38, 118],   name: 'deep navy' },
  { rgb: [118, 138, 178], name: 'slate blue' },
  { rgb: [158, 168, 200], name: 'periwinkle' },
  { rgb: [178, 118, 200], name: 'lavender' },
  { rgb: [118, 58, 178],  name: 'violet' },
  { rgb: [78, 28, 138],   name: 'deep purple' },
  { rgb: [198, 188, 210], name: 'pale lilac' },
  { rgb: [238, 228, 208], name: 'linen' },
  { rgb: [228, 218, 196], name: 'cream' },
  { rgb: [198, 210, 198], name: 'pale sage' },
  { rgb: [178, 200, 220], name: 'powder blue' },
  { rgb: [238, 196, 158], name: 'apricot' },
  { rgb: [248, 228, 148], name: 'pale gold' },
]

// Perceptually-weighted distance in RGB space
function colorDistance(a: RGB, b: RGB): number {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114
}

function nameColor(rgb: RGB): string {
  let best = COLOR_NAMES[0]
  let bestDist = colorDistance(rgb, best.rgb)
  for (const entry of COLOR_NAMES) {
    const dist = colorDistance(rgb, entry.rgb)
    if (dist < bestDist) {
      bestDist = dist
      best = entry
    }
  }
  return best.name
}

function averageColor(pixels: RGB[]): RGB {
  if (pixels.length === 0) return [0, 0, 0]
  let r = 0, g = 0, b = 0
  for (const [pr, pg, pb] of pixels) { r += pr; g += pg; b += pb }
  const n = pixels.length
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
}

function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function getBucketRange(pixels: RGB[]): number {
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0
  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r; if (r > rMax) rMax = r
    if (g < gMin) gMin = g; if (g > gMax) gMax = g
    if (b < bMin) bMin = b; if (b > bMax) bMax = b
  }
  return Math.max(rMax - rMin, gMax - gMin, bMax - bMin)
}

function splitBucket(pixels: RGB[]): [RGB[], RGB[]] {
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0
  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r; if (r > rMax) rMax = r
    if (g < gMin) gMin = g; if (g > gMax) gMax = g
    if (b < bMin) bMin = b; if (b > bMax) bMax = b
  }
  const rRange = rMax - rMin
  const gRange = gMax - gMin
  const bRange = bMax - bMin

  let channel: 0 | 1 | 2 = 0
  if (gRange >= rRange && gRange >= bRange) channel = 1
  else if (bRange >= rRange && bRange >= gRange) channel = 2

  const sorted = [...pixels].sort((a, b) => a[channel] - b[channel])
  const mid = Math.floor(sorted.length / 2)
  return [sorted.slice(0, mid), sorted.slice(mid)]
}

// Median-cut quantisation — splits the widest bucket until we have colorCount clusters
function medianCut(pixels: RGB[], colorCount: number): RGB[] {
  let buckets: RGB[][] = [pixels]

  while (buckets.length < colorCount) {
    let maxRange = -1
    let maxIdx = 0
    for (let i = 0; i < buckets.length; i++) {
      const range = getBucketRange(buckets[i])
      if (range > maxRange) { maxRange = range; maxIdx = i }
    }
    if (maxRange === 0) break

    const [left, right] = splitBucket(buckets[maxIdx])
    buckets.splice(maxIdx, 1)
    if (left.length > 0) buckets.push(left)
    if (right.length > 0) buckets.push(right)
  }

  return buckets.map(averageColor)
}

export async function extractColors(imageUrl: string, count: number): Promise<Color[]> {
  const colorCount = Math.max(3, Math.min(12, count))

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_DIM = 180
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))

      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Could not get canvas context')); return }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const pixels: RGB[] = []
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue           // skip transparent pixels
        pixels.push([data[i], data[i + 1], data[i + 2]])
      }

      if (pixels.length < colorCount) { reject(new Error('Not enough pixel data')); return }

      const palette = medianCut(pixels, colorCount)

      // Count pixel assignments for percentage calculation
      const counts = new Array<number>(palette.length).fill(0)
      for (const pixel of pixels) {
        let minDist = Infinity, minIdx = 0
        for (let i = 0; i < palette.length; i++) {
          const dist = colorDistance(pixel, palette[i])
          if (dist < minDist) { minDist = dist; minIdx = i }
        }
        counts[minIdx]++
      }

      const total = pixels.length
      const colors: Color[] = palette.map((rgb, i) => ({
        hex: rgbToHex(rgb),
        name: nameColor(rgb),
        percentage: Math.round((counts[i] / total) * 1000) / 10,
        locked: false,
      }))

      colors.sort((a, b) => b.percentage - a.percentage)
      resolve(colors)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
}
