"use client"

import { ArrowLeft, ChevronRight, Mic, RotateCcw, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InterpreterStatus, SourceSegment, TargetSegment, TranscriptEntry } from "@/lib/use-interpreter"
import { CaptionStream } from "./caption-stream"
import { Waveform } from "./waveform"

type ActiveSessionProps = {
  status: InterpreterStatus
  sourceLanguage: string
  targetLanguage: string
  speechLang: string
  source: SourceSegment[]
  target: TargetSegment[]
  transcript: TranscriptEntry[]
  speakOut: boolean
  startLabel: string
  stopLabel: string
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onBack?: () => void
}

export function ActiveSession({
  status,
  sourceLanguage,
  targetLanguage,
  speechLang,
  source,
  target,
  transcript,
  speakOut,
  startLabel,
  stopLabel,
  onStart,
  onStop,
  onReset,
  onBack,
}: ActiveSessionProps) {
  const running = status === "running"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-6">
        <div className="flex min-w-0 items-center gap-3">
          {onBack ? (
            <>
              <button
                type="button"
                onClick={onBack}
                className="-ml-2.5 inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-field focus-visible:outline-2 focus-visible:outline-accent"
              >
                <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
                Back to demos
              </button>
              <span className="h-4 w-px bg-border-strong" aria-hidden="true" />
            </>
          ) : null}
          <SessionStatus status={status} />
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-field hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
        >
          <RotateCcw className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Reset demo
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <CaptionStream
          sourceLanguage={`Detected language: ${sourceLanguage}`}
          targetLanguage={targetLanguage}
          speechLang={speechLang}
          source={source}
          target={target}
          listening={running}
          speakOut={speakOut}
        />
      </div>

      <RecognitionDetails entries={transcript} sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} />

      <div className="flex shrink-0 justify-center border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={running ? onStop : onStart}
          className="inline-flex h-10 items-center gap-2 rounded bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {running ? (
            <Square className="size-3.5 fill-current" aria-hidden="true" />
          ) : (
            <Mic className="size-4" aria-hidden="true" />
          )}
          {running ? stopLabel : startLabel}
        </button>
      </div>
    </div>
  )
}

function SessionStatus({ status }: { status: InterpreterStatus }) {
  if (status === "running") {
    return (
      <div role="status" className="flex items-center gap-2.5 text-[14px] font-medium">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
          <span className="relative size-2 rounded-full bg-accent" />
        </span>
        Listening...
        <Waveform active bars={6} className="h-3.5 gap-[2px] text-accent" barClassName="w-[2px]" />
      </div>
    )
  }
  return (
    <p role="status" className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
      <span className="size-2 rounded-full bg-border-strong" aria-hidden="true" />
      {status === "complete" ? "Demo finished" : "Stopped"}
    </p>
  )
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const tenths = Math.floor((ms % 1000) / 100)
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}.${tenths}`
}

function RecognitionDetails({
  entries,
  sourceLanguage,
  targetLanguage,
}: {
  entries: TranscriptEntry[]
  sourceLanguage: string
  targetLanguage: string
}) {
  return (
    <details className="group shrink-0 border-t border-border">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 px-6 text-[13px] text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden="true" />
        View recognition details
        <span className="ml-1 text-subtle-foreground">({entries.length} segments)</span>
      </summary>
      <ol className="flex max-h-44 flex-col gap-1 overflow-y-auto px-6 pb-3">
        {entries.length === 0 ? (
          <li className="py-2 text-[13px] text-subtle-foreground">No segments recognized yet.</li>
        ) : (
          entries.map((e) => (
            <li
              key={e.key}
              className="grid grid-cols-[64px_64px_1fr] items-start gap-3 rounded bg-background px-3 py-2 text-[13px]"
            >
              <span className="font-mono text-xs text-muted-foreground">{formatTime(e.startMs)}</span>
              <span
                className={cn(
                  "w-fit rounded px-1.5 text-[11px] font-semibold uppercase tracking-wide",
                  e.confirmed ? "bg-accent-soft text-accent" : "bg-field text-muted-foreground",
                )}
              >
                {e.confirmed ? "Final" : "Interim"}
              </span>
              <div className={cn("flex min-w-0 flex-col gap-0.5", !e.confirmed && "text-subtle-foreground")}>
                <p>
                  <span className="mr-1.5 font-semibold text-muted-foreground">{sourceLanguage}</span>
                  {e.source}
                </p>
                <p>
                  <span className="mr-1.5 font-semibold text-muted-foreground">{targetLanguage}</span>
                  {e.target || "…"}
                </p>
              </div>
            </li>
          ))
        )}
      </ol>
    </details>
  )
}
