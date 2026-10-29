"use client"

import { useId, useState } from "react"
import { Check, ChevronRight, ExternalLink, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { TARGET_LANGUAGES, type TargetLanguage } from "@/lib/demo-scripts"
import { CollapsibleSection } from "./collapsible-section"
import { SelectField } from "./select-field"

export type Experience = "live-interpreter" | "realtime-translation"

const SOURCE_OPTIONS = [
  { value: "auto", label: "Auto detect" },
  { value: "en-US", label: "English (United States)" },
  { value: "zh-CN", label: "Chinese (Simplified, China)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "fr-FR", label: "French (France)" },
]

const VOICES = [
  { value: "ava", label: "Ava Multilingual", gender: "Female" },
  { value: "andrew", label: "Andrew Multilingual", gender: "Male" },
  { value: "emma", label: "Emma Multilingual", gender: "Female" },
  { value: "brian", label: "Brian Multilingual", gender: "Male" },
]

const EXTRA_CANDIDATES = ["German", "Japanese", "Korean", "Portuguese", "Italian", "Hindi"]

type ParametersPanelProps = {
  experience: Experience
  onExperienceChange: (value: Experience) => void
  targetLanguage: TargetLanguage
  onTargetLanguageChange: (value: TargetLanguage) => void
}

export function ParametersPanel({
  experience,
  onExperienceChange,
  targetLanguage,
  onTargetLanguageChange,
}: ParametersPanelProps) {
  const [sourceLanguage, setSourceLanguage] = useState("auto")
  const [voiceMode, setVoiceMode] = useState<"prebuilt" | "personal">("prebuilt")
  const [voice, setVoice] = useState("ava")
  const voiceGender = VOICES.find((v) => v.value === voice)?.gender

  return (
    <aside
      aria-label="Playground settings"
      className="flex w-full shrink-0 flex-col overflow-y-auto border-border lg:w-[440px] lg:border-r xl:w-[480px]"
    >
      <CollapsibleSection title="Parameters">
        <div className="flex flex-col gap-6">
          <SelectField
            id="experience"
            label="Experience"
            value={experience}
            onChange={(v) => onExperienceChange(v as Experience)}
            options={[
              { value: "live-interpreter", label: "Live Interpreter" },
              { value: "realtime-translation", label: "Realtime Speech Translation" },
            ]}
          />

          <div className="flex flex-col gap-3">
            <SelectField
              id="translate-from"
              label="Translate from"
              value={sourceLanguage}
              onChange={setSourceLanguage}
              options={SOURCE_OPTIONS}
            />
            {sourceLanguage === "auto" ? <SourceCandidates /> : null}
          </div>

          <SelectField
            id="translate-to"
            label="Translate to"
            value={targetLanguage}
            onChange={(v) => onTargetLanguageChange(v as TargetLanguage)}
            options={TARGET_LANGUAGES}
          />

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-[15px] text-muted-foreground">Speak out translation</legend>
            <RadioOption
              name="voice-mode"
              checked={voiceMode === "prebuilt"}
              onChange={() => setVoiceMode("prebuilt")}
              label="Prebuilt voice"
            />
            {voiceMode === "prebuilt" ? (
              <div className="pl-7">
                <SelectField
                  id="prebuilt-voice"
                  ariaLabel="Prebuilt voice"
                  value={voice}
                  onChange={setVoice}
                  options={VOICES}
                  variant="outlined"
                  badge={voiceGender}
                />
              </div>
            ) : null}
            <RadioOption
              name="voice-mode"
              checked={voiceMode === "personal"}
              onChange={() => setVoiceMode("personal")}
              label="Personal voice"
              description={
                <>
                  {"AI-generated replication of the speaker’s voice using "}
                  <a
                    href="https://learn.microsoft.com/azure/ai-services/speech-service/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Live Interpreter
                    <ExternalLink className="size-3" aria-hidden="true" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                  .
                </>
              }
            />
          </fieldset>
        </div>
      </CollapsibleSection>
    </aside>
  )
}

function RadioOption({
  name,
  checked,
  onChange,
  label,
  description,
}: {
  name: string
  checked: boolean
  onChange: () => void
  label: string
  description?: React.ReactNode
}) {
  const id = useId()
  return (
    <div className="flex gap-3">
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 shrink-0 accent-accent"
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-[15px] leading-5">
          {label}
        </label>
        {description ? <p className="text-[13px] leading-5 text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  )
}

function SourceCandidates() {
  const [open, setOpen] = useState(false)
  const [candidates, setCandidates] = useState(["English", "Chinese", "Spanish", "French"])
  const [selected, setSelected] = useState<string[]>([])
  const contentId = useId()
  const nextExtra = EXTRA_CANDIDATES.find((l) => !candidates.includes(l))

  const toggle = (lang: string) =>
    setSelected((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded text-[13px] text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} aria-hidden="true" />
        Source language candidates (optional)
        {selected.length > 0 ? (
          <span className="ml-1 rounded bg-accent-soft px-1.5 text-xs font-medium text-accent">{selected.length}</span>
        ) : null}
      </button>
      <div id={contentId} hidden={!open} className="mt-3 pl-5">
        <p className="mb-2 text-[13px] text-muted-foreground">
          Narrow auto detection to the languages you expect to hear.
        </p>
        <div role="group" aria-label="Source language candidates" className="flex flex-wrap gap-2">
          {candidates.map((lang) => {
            const isSelected = selected.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(lang)}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-full border px-3 text-[13px] transition-colors",
                  isSelected
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border-strong bg-background hover:bg-panel",
                )}
              >
                {isSelected ? <Check className="size-3.5" aria-hidden="true" /> : null}
                {lang}
              </button>
            )
          })}
          {nextExtra ? (
            <button
              type="button"
              onClick={() => {
                setCandidates((c) => [...c, nextExtra])
                setSelected((s) => [...s, nextExtra])
              }}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-border-strong px-3 text-[13px] text-muted-foreground hover:bg-panel hover:text-foreground"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
