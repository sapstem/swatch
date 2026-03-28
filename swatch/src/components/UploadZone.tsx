import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onUpload: (url: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const UploadIcon = () => (
  <svg className="upload-zone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const FileIcon = () => (
  <svg className="upload-zone__file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

export default function UploadZone({ onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile({ name: f.name, size: f.size })
    const url = URL.createObjectURL(f)
    onUpload(url)
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const classes = [
    'upload-zone',
    isDragging ? 'upload-zone--dragging' : '',
    file ? 'upload-zone--filled' : '',
  ].filter(Boolean).join(' ')

  return (
    <motion.div
      className={classes}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {file ? (
        <div className="upload-zone__info">
          <FileIcon />
          <div className="upload-zone__meta">
            <span className="upload-zone__filename">{file.name}</span>
            <span className="upload-zone__size">{formatSize(file.size)}</span>
          </div>
          <span className="upload-zone__change">click to change</span>
        </div>
      ) : (
        <div className="upload-zone__prompt">
          <UploadIcon />
          <span className="upload-zone__label">drop an image or click to upload</span>
          <span className="upload-zone__hint">PNG · JPG · WEBP · GIF</span>
        </div>
      )}
    </motion.div>
  )
}
