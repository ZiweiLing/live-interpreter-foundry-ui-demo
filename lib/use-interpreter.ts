"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DEMO_SCRIPTS, tokenize, type DemoId, type TargetLanguage } from "./demo-scripts"

export type InterpreterStatus = "idle" | "running" | "stopped" | "complete"

type PhraseSchedule = { wordTimes: number[]; end: number; lag: number }

export type CaptionSegment = { key: string; text: string; interim: boolean }

export type TranscriptEntry = {
  key: string
  startMs: number
  source: string
  target: string
  confirmed: boolean
}

const CONFIRM_DELAY_MS = 280
const PHRASE_GAP_MS = 520
const TICK_MS = 60

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildSchedule(demoId: DemoId): PhraseSchedule[] {
  let t = 450
  return DEMO_SCRIPTS[demoId].phrases.map((phrase) => {
    const words = phrase.source.split(" ")
    const wordTimes = words.map(() => {
      const at = t
      t += randomBetween(250, 400)
      return at
    })
    const end = wordTimes[wordTimes.length - 1]
    t = end + PHRASE_GAP_MS
    return { wordTimes, end, lag: randomBetween(600, 900) }
  })
}

function countVisible(times: number[], elapsed: number) {
  let n = 0
  while (n < times.length && times[n] <= elapsed) n++
  return n
}

export function useInterpreter(demoId: DemoId, targetLanguage: TargetLanguage) {
  const [status, setStatus] = useState<InterpreterStatus>("idle")
  const [elapsed, setElapsed] = useState(0)
  const [schedule, setSchedule] = useState<PhraseSchedule[]>([])
  const startRef = useRef(0)

  const totalDuration = useMemo(() => {
    const last = schedule[schedule.length - 1]
    return last ? last.end + last.lag + CONFIRM_DELAY_MS + 200 : 0
  }, [schedule])

  useEffect(() => {
    if (status !== "running") return
    const id = window.setInterval(() => {
      const next = performance.now() - startRef.current
      setElapsed(next)
      if (next >= totalDuration) setStatus("complete")
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [status, totalDuration])

  const start = useCallback(
    (overrideDemo?: DemoId) => {
      setSchedule(buildSchedule(overrideDemo ?? demoId))
      setElapsed(0)
      startRef.current = performance.now()
      setStatus("running")
    },
    [demoId],
  )

  const stop = useCallback(() => setStatus("stopped"), [])

  const reset = useCallback(() => {
    setStatus("idle")
    setElapsed(0)
    setSchedule([])
  }, [])

  const captions = useMemo(() => {
    const script = DEMO_SCRIPTS[demoId]
    const source: CaptionSegment[] = []
    const target: CaptionSegment[] = []
    const transcript: TranscriptEntry[] = []
    const frozen = status === "stopped" || status === "complete"

    schedule.forEach((phase, index) => {
      const phrase = script.phrases[index]
      if (!phrase) return
      const srcWords = phrase.source.split(" ")
      const srcVisible = countVisible(phase.wordTimes, elapsed)
      if (srcVisible === 0) return
      const srcConfirmed = frozen || elapsed >= phase.end + CONFIRM_DELAY_MS
      const sourceText = srcWords.slice(0, srcVisible).join(" ")
      source.push({ key: `s-${index}`, text: sourceText, interim: !srcConfirmed })

      const { tokens, joiner } = tokenize(phrase.targets[targetLanguage], targetLanguage)
      const tgtTimes = tokens.map((_, j) => {
        const srcIndex = Math.min(Math.floor((j * srcWords.length) / tokens.length), srcWords.length - 1)
        return phase.wordTimes[srcIndex] + phase.lag
      })
      const tgtVisible = countVisible(tgtTimes, elapsed)
      const tgtConfirmed = frozen || elapsed >= phase.end + phase.lag + CONFIRM_DELAY_MS
      const targetText = tokens.slice(0, tgtVisible).join(joiner)
      if (tgtVisible > 0) {
        target.push({ key: `t-${index}`, text: targetText, interim: !tgtConfirmed })
      }

      transcript.push({
        key: `r-${index}`,
        startMs: phase.wordTimes[0],
        source: sourceText,
        target: targetText,
        confirmed: srcConfirmed && tgtConfirmed,
      })
    })

    return { source, target, transcript, joiner: tokenize("", targetLanguage).joiner }
  }, [schedule, elapsed, demoId, targetLanguage, status])

  return { status, start, stop, reset, ...captions, hasContent: captions.source.length > 0 }
}
