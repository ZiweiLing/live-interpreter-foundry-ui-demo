import { cn } from "@/lib/utils"

const BARS = [0.5, 0.8, 1, 0.65, 0.9, 0.55, 0.75, 1, 0.6, 0.85, 0.5, 0.7]

type WaveformProps = {
  active: boolean
  bars?: number
  className?: string
  barClassName?: string
}

export function Waveform({ active, bars = BARS.length, className, barClassName }: WaveformProps) {
  return (
    <div aria-hidden="true" className={cn("flex h-6 items-center gap-[3px]", className)}>
      {BARS.slice(0, bars).map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] origin-center rounded-full bg-accent",
            active ? "animate-wave" : "opacity-40",
            barClassName,
          )}
          style={{
            height: `${h * 100}%`,
            animationDelay: `${(i % 6) * 0.11}s`,
            animationDuration: `${0.8 + (i % 4) * 0.15}s`,
            transform: active ? undefined : "scaleY(0.3)",
          }}
        />
      ))}
    </div>
  )
}
