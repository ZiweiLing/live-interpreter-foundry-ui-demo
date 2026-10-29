import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TranscriptEntry } from "@/lib/use-interpreter"

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
}

export function TranscriptView({
  entries,
  sourceLanguage,
  targetLanguage,
}: {
  entries: TranscriptEntry[]
  sourceLanguage: string
  targetLanguage: string
}) {
  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <FileText className="size-7" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-lg font-semibold">No transcript yet</p>
        <p className="text-sm text-muted-foreground">Start interpreting to build a time-stamped transcript.</p>
      </div>
    )
  }

  return (
    <ol className="flex h-full flex-col gap-1 overflow-y-auto p-4">
      {entries.map((e) => (
        <li key={e.key} className="grid grid-cols-[56px_1fr] gap-3 rounded bg-background px-4 py-3">
          <span className="pt-0.5 font-mono text-xs text-muted-foreground">{formatTime(e.startMs)}</span>
          <div className={cn("flex flex-col gap-1.5", !e.confirmed && "text-subtle-foreground")}>
            <p className="text-[15px]">
              <span className="mr-2 text-xs font-semibold text-muted-foreground">{sourceLanguage}</span>
              {e.source}
            </p>
            <p className="text-[15px]">
              <span className="mr-2 text-xs font-semibold text-muted-foreground">{targetLanguage}</span>
              {e.target || "…"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
