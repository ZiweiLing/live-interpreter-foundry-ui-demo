"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SourceSegment, TargetSegment } from "@/lib/use-interpreter"

const ConfirmedSource = memo(function ConfirmedSource({ text }: { text: string }) {
  return <p className="text-foreground">{text}</p>
})

function InterimSource({ text, active }: { text: string; active: boolean }) {
  return (
    <p className="relative text-subtle-foreground">
      {active ? (
        <span
          aria-hidden="true"
          className="absolute top-[0.35em] bottom-[0.35em] -left-3.5 w-[3px] rounded-full bg-accent/60"
        />
      ) : null}
      <span
        className={cn(
          "rounded-sm box-decoration-clone transition-colors",
          active && "bg-accent-soft/70 px-1 -mx-1 text-foreground/55",
        )}
      >
        {text}
      </span>
      {active ? <span className="sr-only"> (currently speaking)</span> : null}
    </p>
  )
}

type ConfirmedTargetProps = {
  id: string
  text: string
  playing: boolean
  onTogglePlay: (id: string, text: string) => void
}

const ConfirmedTarget = memo(function ConfirmedTarget({ id, text, playing, onTogglePlay }: ConfirmedTargetProps) {
  return (
    <p className="group text-foreground">
      {text}
      <button
        type="button"
        onClick={() => onTogglePlay(id, text)}
        aria-label={playing ? `Stop playback: ${text}` : `Play translation: ${text}`}
        aria-pressed={playing}
        className={cn(
          "ml-2 inline-flex size-7 translate-y-[-3px] items-center justify-center rounded-full border align-middle transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
          playing
            ? "border-accent bg-accent text-white"
            : "border-border bg-background text-muted-foreground hover:border-accent hover:text-accent",
        )}
      >
        {playing ? (
          <Pause className="size-3 fill-current" aria-hidden="true" />
        ) : (
          <Play className="size-3 translate-x-[1px] fill-current" aria-hidden="true" />
        )}
      </button>
    </p>
  )
})

function useAutoScroll(signal: string) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [signal])
  return ref
}

function SectionHeader({ label, language, children }: { label: string; language: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-6 pt-3">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label} <span aria-hidden="true">·</span> <span className="normal-case">{language}</span>
      </h3>
      {children}
    </div>
  )
}

const bodyClass =
  "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-6 pb-5 text-[22px] leading-[1.5] text-pretty xl:text-2xl"

function SourceSection({
  language,
  segments,
  listening,
}: {
  language: string
  segments: SourceSegment[]
  listening: boolean
}) {
  const scrollRef = useAutoScroll(segments.map((s) => s.text).join("|"))

  return (
    <section aria-label={`Source captions, ${language}`} className="flex min-h-0 flex-1 flex-col">
      <SectionHeader label="Source" language={language} />
      <div ref={scrollRef} aria-live="polite" className={cn(bodyClass, "pl-9")}>
        {segments.length === 0 ? (
          <p className="text-subtle-foreground">Waiting for speech…</p>
        ) : (
          segments.map((s) =>
            s.interim ? (
              <InterimSource key={s.key} text={s.text} active={s.active && listening} />
            ) : (
              <ConfirmedSource key={s.key} text={s.text} />
            ),
          )
        )}
      </div>
    </section>
  )
}

function TargetSection({
  language,
  speechLang,
  segments,
  listening,
  speakOut,
}: {
  language: string
  speechLang: string
  segments: TargetSegment[]
  listening: boolean
  speakOut: boolean
}) {
  const scrollRef = useAutoScroll(segments.map((s) => s.text).join("|"))
  const [muted, setMuted] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const playingRef = useRef<string | null>(null)
  const langRef = useRef(speechLang)
  langRef.current = speechLang

  const stopPlayback = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
    playingRef.current = null
    setPlayingId(null)
  }, [])

  const togglePlay = useCallback(
    (id: string, text: string) => {
      if (playingRef.current === id) {
        stopPlayback()
        return
      }
      if (!("speechSynthesis" in window)) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langRef.current
      utterance.rate = 0.95
      const clear = () => {
        if (playingRef.current === id) {
          playingRef.current = null
          setPlayingId(null)
        }
      }
      utterance.onend = clear
      utterance.onerror = clear
      playingRef.current = id
      setPlayingId(id)
      window.speechSynthesis.speak(utterance)
    },
    [stopPlayback],
  )

  useEffect(() => {
    if (segments.length === 0) stopPlayback()
  }, [segments.length, stopPlayback])

  useEffect(() => stopPlayback, [stopPlayback])

  const latest = segments[segments.length - 1]

  return (
    <section aria-label={`Target captions, ${language}`} className="flex min-h-0 flex-1 flex-col">
      <SectionHeader label="Target" language={language}>
        {speakOut ? (
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
      </SectionHeader>
      <div ref={scrollRef} aria-live="polite" className={cn(bodyClass, "pl-9")}>
        {segments.length === 0 ? (
          <p className="text-subtle-foreground">Translation will appear here…</p>
        ) : (
          segments.map((s) =>
            s.complete ? (
              <ConfirmedTarget
                key={s.key}
                id={s.key}
                text={s.text}
                playing={playingId === s.key}
                onTogglePlay={togglePlay}
              />
            ) : (
              <p
                key={s.key}
                className={cn(
                  "transition-colors duration-300",
                  s.interim && s.key === latest?.key ? "text-subtle-foreground" : "text-foreground",
                )}
              >
                {s.text}
              </p>
            ),
          )
        )}
      </div>
    </section>
  )
}

type CaptionStreamProps = {
  sourceLanguage: string
  targetLanguage: string
  speechLang: string
  source: SourceSegment[]
  target: TargetSegment[]
  listening: boolean
  speakOut: boolean
}

export function CaptionStream({
  sourceLanguage,
  targetLanguage,
  speechLang,
  source,
  target,
  listening,
  speakOut,
}: CaptionStreamProps) {
  return (
    <div className="flex h-full min-h-0 flex-col divide-y divide-border">
      <SourceSection language={sourceLanguage} segments={source} listening={listening} />
      <TargetSection
        language={targetLanguage}
        speechLang={speechLang}
        segments={target}
        listening={listening}
        speakOut={speakOut}
      />
    </div>
  )
}
