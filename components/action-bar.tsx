import { Mic, RotateCcw, Square } from "lucide-react"
import type { DemoId } from "@/lib/demo-scripts"
import type { InterpreterStatus } from "@/lib/use-interpreter"
import { DemoPicker } from "./interpreter-empty-state"
import { Waveform } from "./waveform"

type ActionBarProps = {
  status: InterpreterStatus
  startLabel: string
  stopLabel: string
  activeDemo: DemoId
  showDemos: boolean
  onStart: () => void
  onStop: () => void
  onSelectDemo: (id: DemoId) => void
  onReset: () => void
}

export function ActionBar({
  status,
  startLabel,
  stopLabel,
  activeDemo,
  showDemos,
  onStart,
  onStop,
  onSelectDemo,
  onReset,
}: ActionBarProps) {
  const running = status === "running"
  const finished = status === "stopped" || status === "complete"

  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-4 bg-panel px-6 py-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {running ? (
          <div role="status" className="flex items-center gap-3 text-[15px] text-muted-foreground">
            <Waveform active />
            <span>Listening...</span>
          </div>
        ) : finished ? (
          <p role="status" className="text-[15px] text-muted-foreground">
            {status === "complete" ? "Demo finished" : "Stopped"}
          </p>
        ) : null}

        <button
          type="button"
          onClick={running ? onStop : onStart}
          className="inline-flex h-10 items-center gap-2.5 rounded-full border border-border-strong bg-background px-7 text-[15px] font-semibold transition-colors hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {running ? (
            <Square className="size-3.5 fill-current text-accent" aria-hidden="true" />
          ) : finished ? (
            <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Mic className="size-4" strokeWidth={1.75} aria-hidden="true" />
          )}
          {running ? stopLabel : finished ? "Replay" : startLabel}
        </button>

        {status !== "idle" ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-field hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Reset demo
          </button>
        ) : null}
      </div>

      {finished && showDemos ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-[13px] text-muted-foreground">Try another demo</span>
          <DemoPicker compact activeDemo={activeDemo} onSelect={onSelectDemo} />
        </div>
      ) : null}
    </div>
  )
}
