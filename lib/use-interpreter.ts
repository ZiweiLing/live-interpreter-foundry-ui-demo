"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DEMO_SCRIPTS, tokenize, type DemoId, type TargetLanguage } from "./demo-scripts"

export type InterpreterStatus = "idle" | "running" | "stopped" | "complete"

type TargetChunk = { text: string; at: number }

type PhraseSchedule = {
  wordTimes: number[]
  end: number
  chunks: TargetChunk[]
  targetEnd: number
}

export type SourceSegment = { key: string; text: string; interim: boolean; active: boolean }
export type TargetSegment = { key: string; text: string; interim: boolean; complete: boolean }

export type TranscriptEntry = {
  key: string
  startMs: number
  source: string
  target: string
  confirmed: boolean
}

const CONFIRM_DELAY_MS = 260
const PHRASE_GAP_MS = 560
const TICK_MS = 60
const CHUNK_SIZE = 3
const CHUNK_SIZE_ZH = 3

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function chunkTokens(tokens: string[], joiner: string, size: number) {
  const chunks: string[] = []
  let current: string[] = []
  tokens.forEach((token, i) => {
    current.push(token)
    const breaksOnPunctuation = /[,，;；:：。.?？!！]$/.test(token)
    if (current.length >= size || breaksOnPunctuation || i === tokens.length - 1) {
      chunks.push(current.join(joiner))
      current = []
    }
  })
  return chunks
}

function buildSchedule(demoId: DemoId, targetLanguage: TargetLanguage): PhraseSchedule[] {
  let t = 450
  return DEMO_SCRIPTS[demoId].phrases.map((phrase) => {
    const words = phrase.source.split(" ")
    const wordTimes = words.map(() => {
      const at = t
      t += randomBetween(250, 380)
      return at
    })
    const end = wordTimes[wordTimes.length - 1]
    t = end + PHRASE_GAP_MS

    const lag = randomBetween(650, 850)
    const { tokens, joiner } = tokenize(phrase.targets[targetLanguage], targetLanguage)
    const texts = chunkTokens(tokens, joiner, targetLanguage === "zh-CN" ? CHUNK_SIZE_ZH : CHUNK_SIZE)
    let previous = 0
    const chunks = texts.map((text, k) => {
      const progress = (k + 1) / texts.length
      const srcIndex = Math.min(Math.ceil(progress * words.length) - 1, words.length - 1)
      const at = Math.max(wordTimes[srcIndex] + lag, previous + 180)
      previous = at
      return { text, at }
    })

    return { wordTimes, end, chunks, targetEnd: chunks[chunks.length - 1].at }
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
  const [scheduleLanguage, setScheduleLanguage] = useState<TargetLanguage>(targetLanguage)
  const startRef = useRef(0)

  const totalDuration = useMemo(() => {
    const last = schedule[schedule.length - 1]
    return last ? Math.max(last.end, last.targetEnd) + CONFIRM_DELAY_MS + 200 : 0
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
      setSchedule(buildSchedule(overrideDemo ?? demoId, targetLanguage))
      setScheduleLanguage(targetLanguage)
      setElapsed(0)
      startRef.current = performance.now()
      setStatus("running")
    },
    [demoId, targetLanguage],
  )

  const stop = useCallback(() => {
    setElapsed(performance.now() - startRef.current)
    setStatus("stopped")
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setElapsed(0)
    setSchedule([])
  }, [])

  const captions = useMemo(() => {
    const script = DEMO_SCRIPTS[demoId]
    const lang = scheduleLanguage
    const source: SourceSegment[] = []
    const target: TargetSegment[] = []
    const transcript: TranscriptEntry[] = []
    const finalized = status === "stopped" || status === "complete"

    schedule.forEach((phase, index) => {
      const phrase = script.phrases[index]
      if (!phrase || phase.wordTimes[0] > elapsed) return

      const srcWords = phrase.source.split(" ")
      const srcVisible = finalized ? srcWords.length : countVisible(phase.wordTimes, elapsed)
      const srcConfirmed = finalized || elapsed >= phase.end + CONFIRM_DELAY_MS
      const sourceText = srcWords.slice(0, srcVisible).join(" ")
      source.push({ key: `s-${index}`, text: sourceText, interim: !srcConfirmed, active: !srcConfirmed })

      const nextPhase = schedule[index + 1]
      const supersededByNext = nextPhase ? nextPhase.chunks[0].at <= elapsed : false
      const chunkTimes = phase.chunks.map((c) => c.at)
      const tgtVisible = finalized || supersededByNext ? phase.chunks.length : countVisible(chunkTimes, elapsed)
      const tgtConfirmed = finalized || supersededByNext || elapsed >= phase.targetEnd + CONFIRM_DELAY_MS
      const { joiner } = tokenize("", lang)
      const targetText = phase.chunks
        .slice(0, tgtVisible)
        .map((c) => c.text)
        .join(joiner)

      if (tgtVisible > 0) {
        target.push({
          key: `t-${index}`,
          text: targetText,
          interim: !tgtConfirmed,
          complete: tgtConfirmed && tgtVisible === phase.chunks.length,
        })
      }

      transcript.push({
        key: `r-${index}`,
        startMs: phase.wordTimes[0],
        source: sourceText,
        target: targetText,
        confirmed: srcConfirmed && tgtConfirmed,
      })
    })

    return { source, target, transcript, joiner: tokenize("", lang).joiner, speechLang: lang }
  }, [schedule, elapsed, demoId, scheduleLanguage, status])

  return { status, start, stop, reset, ...captions, hasContent: captions.source.length > 0 }
}
