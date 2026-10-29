import { AudioLines, Briefcase, Headset, Mic, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DemoId } from "@/lib/demo-scripts"

export const DEMO_OPTIONS: { id: DemoId; label: string; icon: typeof Briefcase }[] = [
  { id: "business", label: "Business meeting", icon: Briefcase },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "support", label: "Customer support", icon: Headset },
]

export function DemoPicker({
  onSelect,
  activeDemo,
  compact = false,
}: {
  onSelect: (id: DemoId) => void
  activeDemo?: DemoId
  compact?: boolean
}) {
  return (
    <div role="group" aria-label="Demo scenarios" className="flex flex-wrap justify-center gap-2">
      {DEMO_OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={cn(
            "inline-flex items-center gap-2 rounded border bg-background text-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent",
            compact ? "h-8 px-3" : "h-9 px-4",
            activeDemo === id ? "border-accent text-accent" : "border-border-strong",
          )}
        >
          <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}

export function LiveInterpreterEmptyState({
  onStart,
  onSelectDemo,
}: {
  onStart: () => void
  onSelectDemo: (id: DemoId) => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <AudioLines className="size-8" strokeWidth={1.75} aria-hidden="true" />
      <h2 className="text-2xl font-semibold">Live Interpreter</h2>
      <p className="max-w-md text-[15px] leading-6 text-muted-foreground">
        Speak naturally in any supported language.
        <br />
        Your speech will be translated and spoken in real time.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 inline-flex h-10 items-center gap-2 rounded bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Mic className="size-4" aria-hidden="true" />
        Start interpreting
      </button>
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-[13px] font-semibold text-muted-foreground">Try a demo</p>
        <DemoPicker onSelect={onSelectDemo} />
      </div>
    </div>
  )
}

export function RealtimeEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <AudioLines className="size-8" strokeWidth={1.75} aria-hidden="true" />
      <h2 className="text-2xl font-semibold">Upload or record audio to start translation</h2>
    </div>
  )
}
