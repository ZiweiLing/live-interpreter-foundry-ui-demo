"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import type { TargetLanguage } from "@/lib/demo-scripts"
import { SelectField } from "./select-field"

type CodeLanguage = "python" | "csharp" | "javascript"

const CODE_LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "csharp", label: "C#" },
  { value: "javascript", label: "JavaScript" },
]

const DOCS_URL = "https://learn.microsoft.com/azure/ai-services/speech-service/how-to-translate-speech"

function toTranslationCode(lang: TargetLanguage) {
  return lang === "zh-CN" ? "zh-Hans" : lang.split("-")[0]
}

function buildSample(language: CodeLanguage, target: string) {
  switch (language) {
    case "python":
      return `import os
import azure.cognitiveservices.speech as speechsdk

config = speechsdk.translation.SpeechTranslationConfig(
    subscription=os.environ["SPEECH_KEY"],
    region=os.environ["SPEECH_REGION"],
)
config.add_target_language("${target}")
config.voice_name = "en-US-AvaMultilingualNeural"

auto_detect = speechsdk.languageconfig.AutoDetectSourceLanguageConfig()
audio = speechsdk.audio.AudioConfig(use_default_microphone=True)

recognizer = speechsdk.translation.TranslationRecognizer(
    translation_config=config,
    auto_detect_source_language_config=auto_detect,
    audio_config=audio,
)

recognizer.recognizing.connect(
    lambda e: print("interim:", e.result.translations["${target}"])
)
recognizer.recognized.connect(
    lambda e: print("final:", e.result.translations["${target}"])
)

recognizer.start_continuous_recognition()
input("Interpreting... press Enter to stop\\n")
recognizer.stop_continuous_recognition()`
    case "csharp":
      return `using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech.Translation;

var config = SpeechTranslationConfig.FromSubscription(
    Environment.GetEnvironmentVariable("SPEECH_KEY"),
    Environment.GetEnvironmentVariable("SPEECH_REGION"));
config.AddTargetLanguage("${target}");
config.VoiceName = "en-US-AvaMultilingualNeural";

var autoDetect = AutoDetectSourceLanguageConfig.FromOpenRange();
using var audio = AudioConfig.FromDefaultMicrophoneInput();
using var recognizer = new TranslationRecognizer(config, autoDetect, audio);

recognizer.Recognizing += (_, e) =>
    Console.WriteLine($"interim: {e.Result.Translations["${target}"]}");
recognizer.Recognized += (_, e) =>
    Console.WriteLine($"final: {e.Result.Translations["${target}"]}");

await recognizer.StartContinuousRecognitionAsync();
Console.WriteLine("Interpreting... press Enter to stop");
Console.ReadLine();
await recognizer.StopContinuousRecognitionAsync();`
    case "javascript":
      return `import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const config = sdk.SpeechTranslationConfig.fromSubscription(
  process.env.SPEECH_KEY,
  process.env.SPEECH_REGION,
);
config.addTargetLanguage("${target}");
config.voiceName = "en-US-AvaMultilingualNeural";

const autoDetect = sdk.AutoDetectSourceLanguageConfig.fromOpenRange();
const audio = sdk.AudioConfig.fromDefaultMicrophoneInput();
const recognizer = sdk.TranslationRecognizer.FromConfig(config, autoDetect, audio);

recognizer.recognizing = (_, e) =>
  console.log("interim:", e.result.translations.get("${target}"));
recognizer.recognized = (_, e) =>
  console.log("final:", e.result.translations.get("${target}"));

recognizer.startContinuousRecognitionAsync();`
  }
}

export function CodeSamples({ targetLanguage }: { targetLanguage: TargetLanguage }) {
  const [language, setLanguage] = useState<CodeLanguage>("python")
  const [copied, setCopied] = useState(false)
  const code = buildSample(language, toTranslationCode(targetLanguage))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Build with Live Interpreter</h2>
          <p className="text-[14px] text-muted-foreground">
            Stream speech from a microphone and receive interim and final translations.
          </p>
        </div>
        <div className="w-44">
          <SelectField
            id="code-language"
            ariaLabel="Programming language"
            value={language}
            onChange={(v) => setLanguage(v as CodeLanguage)}
            options={CODE_LANGUAGES}
            variant="outlined"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden rounded border border-border bg-background">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
          <span className="font-mono text-xs text-muted-foreground">
            {language === "python" ? "interpreter.py" : language === "csharp" ? "Program.cs" : "interpreter.mjs"}
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-7 items-center gap-1.5 rounded px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-field hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            {copied ? (
              <Check className="size-3.5 text-accent" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
        <pre className="overflow-auto p-4 font-mono text-[13px] leading-6">
          <code>{code}</code>
        </pre>
        <span className="sr-only" aria-live="polite">
          {copied ? "Code copied to clipboard" : ""}
        </span>
      </div>

      <a
        href={DOCS_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 text-[14px] font-medium text-accent hover:underline"
      >
        Read the Speech translation documentation
        <ExternalLink className="size-3.5" aria-hidden="true" />
        <span className="sr-only">(opens in new tab)</span>
      </a>
    </div>
  )
}
