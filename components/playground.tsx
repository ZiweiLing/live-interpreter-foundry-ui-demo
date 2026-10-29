"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { DEMO_SCRIPTS, TARGET_LANGUAGES, type DemoId, type TargetLanguage } from "@/lib/demo-scripts"
import { useInterpreter } from "@/lib/use-interpreter"
import { ParametersPanel, type Experience } from "./parameters-panel"
import { PlaygroundHeader } from "./playground-header"
import { ActiveSession } from "./active-session"
import { CodeSamples } from "./code-samples"
import { LiveInterpreterEmptyState, RealtimeEmptyState } from "./interpreter-empty-state"

type Tab = "translation" | "code"

const TABS: { id: Tab; label: string }[] = [
  { id: "translation", label: "Translation" },
  { id: "code", label: "Code samples" },
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
  const sessionActive = interpreter.status !== "idle"

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
                type="button"
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
            className="flex min-h-[520px] flex-1 flex-col overflow-hidden bg-panel *:flex-1"
          >
            {tab === "code" ? (
              <CodeSamples targetLanguage={targetLanguage} />
            ) : sessionActive ? (
              <ActiveSession
                status={interpreter.status}
                sourceLanguage={sourceShort}
                targetLanguage={targetShort}
                speechLang={interpreter.speechLang}
                source={interpreter.source}
                target={interpreter.target}
                transcript={interpreter.transcript}
                speakOut={isLive}
                startLabel={isLive ? "Start interpreting" : "Start recording"}
                stopLabel={isLive ? "Stop interpreting" : "Stop recording"}
                onStart={() => interpreter.start()}
                onStop={interpreter.stop}
                onReset={interpreter.reset}
              />
            ) : isLive ? (
              <LiveInterpreterEmptyState onStart={() => interpreter.start()} onSelectDemo={startDemo} />
            ) : (
              <RealtimeEmptyState onStart={() => interpreter.start()} />
            )}
          </div>

          <p className="text-center text-[13px] text-muted-foreground">AI-generated content may be incorrect</p>
        </section>
      </main>
    </div>
  )
}
