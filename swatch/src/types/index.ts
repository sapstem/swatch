export interface Color {
  hex: string
  name: string
  percentage: number
  locked: boolean
}

export interface Palette {
  colors: Color[]
  imageUrl: string
}

export type ExportFormat = 'css' | 'tailwind' | 'hex'