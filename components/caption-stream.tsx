"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CaptionSegment } from "@/lib/use-interpreter"

type CaptionSectionProps = {
  kind: "source" | "target"
  language: string
  segments: CaptionSegment[]
  joiner: string
  listening: boolean
  speakOut?: boolean
}

function CaptionSection({ kind, language, segments, joiner, listening, speakOut = true }: CaptionSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(false)
  const lastText = segments.map((s) => s.text).join("|")

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [lastText])

  const label = kind === "source" ? "Source" : "Target"

  return (
    <section aria-label={`${label} captions, ${language}`} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>
            {label} <span aria-hidden="true">·</span> <span className="normal-case">{language}</span>
          </span>
          {kind === "source" && listening ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-accent">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" aria-hidden="true" />
              Listening
            </span>
          ) : null}
        </h3>
        {kind === "target" && speakOut ? (
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute spoken translation" : "Mute spoken translation"}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-field",
              !muted && listening && "text-accent",
            )}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        ) : null}
      </div>
      <div
        ref={scrollRef}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 text-[22px] leading-[1.55] text-pretty xl:text-2xl"
      >
        {segments.length === 0 ? (
          <p className="text-subtle-foreground">{kind === "source" ? "Waiting for speech…" : "Translation will appear here…"}</p>
        ) : (
          <p>
            {segments.map((s, i) => (
              <span
                key={s.key}
                className={cn("transition-colors duration-300", s.interim ? "text-subtle-foreground" : "text-foreground")}
              >
                {i > 0 ? joiner : ""}
                {s.text}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  )
}

type CaptionStreamProps = {
  sourceLanguage: string
  targetLanguage: string
  source: CaptionSegment[]
  target: CaptionSegment[]
  targetJoiner: string
  listening: boolean
  speakOut: boolean
}

export function CaptionStream({
  sourceLanguage,
  targetLanguage,
  source,
  target,
  targetJoiner,
  listening,
  speakOut,
}: CaptionStreamProps) {
  return (
    <div className="flex h-full min-h-0 flex-col divide-y divide-border">
      <CaptionSection kind="source" language={sourceLanguage} segments={source} joiner=" " listening={listening} />
      <CaptionSection
        kind="target"
        language={targetLanguage}
        segments={target}
        joiner={targetJoiner}
        listening={listening}
        speakOut={speakOut}
      />
    </div>
  )
}
