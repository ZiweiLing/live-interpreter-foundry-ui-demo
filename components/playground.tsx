"use client"

import { useState } from "react"
import { Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_SCRIPTS, TARGET_LANGUAGES, type DemoId, type TargetLanguage } from "@/lib/demo-scripts"
import { useInterpreter } from "@/lib/use-interpreter"
import { ParametersPanel, type Experience } from "./parameters-panel"
import { PlaygroundHeader } from "./playground-header"
import { CaptionStream } from "./caption-stream"
import { TranscriptView } from "./transcript-view"
import { LiveInterpreterEmptyState, RealtimeEmptyState } from "./interpreter-empty-state"
import { ActionBar } from "./action-bar"

type Tab = "translation" | "transcript" | "call"

const TABS: { id: Tab; label: string }[] = [
  { id: "translation", label: "Translation" },
  { id: "transcript", label: "Transcript" },
  { id: "call", label: "Call service" },
]

export function Playground() {
  const [experience, setExperience] = useState<Experience>("live-interpreter")
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("es-ES")
  const [demoId, setDemoId] = useState<DemoId>("business")
  const [tab, setTab] = useState<Tab>("translation")
  const interpreter = useInterpreter(demoId, targetLanguage)

  const isLive = experience === "live-interpreter"
  const targetShort = TARGET_LANGUAGES.find((l) => l.value === targetLanguage)?.short ?? ""
  const sourceShort = DEMO_SCRIPTS[demoId].sourceLanguage
  const showCaptions = interpreter.status !== "idle"

  const startDemo = (id: DemoId) => {
    setDemoId(id)
    setTab("translation")
    interpreter.start(id)
  }

  const handleExperienceChange = (value: Experience) => {
    setExperience(value)
    interpreter.reset()
  }

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <PlaygroundHeader />
      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ParametersPanel
          experience={experience}
          onExperienceChange={handleExperienceChange}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
        />

        <section aria-label="Output" className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 p-5">
          <div role="tablist" aria-label="Output views" className="flex w-fit rounded bg-panel p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="output-panel"
                onClick={() => setTab(t.id)}
                className={cn(
                  "h-9 rounded px-4 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                  tab === t.id
                    ? "bg-background font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            id="output-panel"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="min-h-[420px] flex-1 overflow-hidden bg-panel"
          >
            {tab === "translation" ? (
              showCaptions ? (
                <CaptionStream
                  sourceLanguage={sourceShort}
                  targetLanguage={targetShort}
                  speechLang={interpreter.speechLang}
                  source={interpreter.source}
                  target={interpreter.target}
                  listening={interpreter.status === "running"}
                  speakOut={isLive}
                />
              ) : isLive ? (
                <LiveInterpreterEmptyState onStart={() => interpreter.start()} onSelectDemo={startDemo} />
              ) : (
                <RealtimeEmptyState />
              )
            ) : tab === "transcript" ? (
              <TranscriptView entries={interpreter.transcript} sourceLanguage={sourceShort} targetLanguage={targetShort} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                <Phone className="size-7" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-lg font-semibold">Call service</p>
                <p className="text-sm text-muted-foreground">Connect a phone number to interpret calls.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <ActionBar
              status={interpreter.status}
              startLabel={isLive ? "Start interpreting" : "Start Recording"}
              stopLabel={isLive ? "Stop interpreting" : "Stop Recording"}
              activeDemo={demoId}
              showDemos={isLive}
              onStart={() => interpreter.start()}
              onStop={interpreter.stop}
              onSelectDemo={startDemo}
              onReset={interpreter.reset}
            />
            <p className="text-center text-[13px] text-muted-foreground">AI-generated content may be incorrect</p>
          </div>
        </section>
      </main>
    </div>
  )
}
