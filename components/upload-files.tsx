"use client"

import { useRef, useState } from "react"
import { FileAudio, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function UploadFiles() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) setFileName(file.name)
        }}
        className={cn(
          "rounded border px-4 py-4 text-center font-mono text-[15px] font-semibold transition-colors",
          dragging ? "border-accent bg-accent-soft" : "border-border",
        )}
      >
        Drag and drop files here, or{" "}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </div>
      {fileName ? (
        <div className="flex items-center gap-2 rounded bg-panel px-3 py-2 text-sm">
          <FileAudio className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="flex-1 truncate">{fileName}</span>
          <button
            type="button"
            aria-label={`Remove ${fileName}`}
            onClick={() => setFileName(null)}
            className="rounded p-0.5 text-muted-foreground hover:bg-field"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
