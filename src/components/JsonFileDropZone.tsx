import { Upload } from "lucide-react"
import { useRef, useState } from "react"
import type { DragEvent } from "react"
import { FileButton, cx } from "./ui.tsx"

interface JsonFileDropZoneLabels {
  button: string
  title: string
}

interface JsonFileDropZoneProps {
  labels: JsonFileDropZoneLabels
  onFileSelect: (file: File) => void | Promise<void>
}

export function JsonFileDropZone({ labels, onFileSelect }: JsonFileDropZoneProps) {
  const dragDepthRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  function resetDragState() {
    dragDepthRef.current = 0
    setIsDragging(false)
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    dragDepthRef.current += 1
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setIsDragging(false)
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    resetDragState()
    if (!file) return
    void onFileSelect(file)
  }

  return (
    <section
      aria-label={labels.title}
      className={cx(
        "flex h-[150px] max-h-[150px] flex-col items-center justify-center gap-3 rounded border border-dashed p-4 text-center transition-colors",
        isDragging
          ? "border-border-brand bg-surface-subtle text-text-default"
          : "border-border-muted bg-surface-base text-text-subtle"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Upload aria-hidden="true" className="size-5 text-text-muted" strokeWidth={1.8} />
      <p className="m-0 text-[14px] font-normal leading-tight text-text-subtle">{labels.title}</p>
      <FileButton
        accept="application/json,.json"
        className="min-w-[152px]"
        color="secondary"
        size="md"
        variant="outline"
        onChange={event => {
          const file = event.currentTarget.files?.[0]
          event.currentTarget.value = ""
          if (!file) return
          void onFileSelect(file)
        }}
      >
        {labels.button}
      </FileButton>
    </section>
  )
}
