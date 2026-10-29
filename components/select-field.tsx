import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Option = { value: string; label: string }

type SelectFieldProps = {
  id: string
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  variant?: "filled" | "outlined"
  badge?: string
  ariaLabel?: string
}

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  variant = "filled",
  badge,
  ariaLabel,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={id} className="text-[15px] text-muted-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 w-full appearance-none rounded px-4 pr-20 text-[15px] text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent",
            variant === "filled"
              ? "bg-field hover:bg-[#e8e8e8]"
              : "border border-border-strong bg-panel px-3 font-medium hover:bg-field",
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-3">
          {badge ? (
            <span className="rounded border border-border bg-background px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {badge}
            </span>
          ) : null}
          <ChevronDown className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
