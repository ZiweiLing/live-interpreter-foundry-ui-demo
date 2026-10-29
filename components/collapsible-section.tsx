"use client"

import { useId, useState } from "react"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const contentId = useId()
  return (
    <section className="border-b border-border px-6 py-6 last:border-b-0">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left text-base font-semibold focus-visible:outline-2 focus-visible:outline-accent"
        >
          {title}
          <ChevronUp
            className={cn("size-5 transition-transform", !open && "rotate-180")}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </h2>
      <div id={contentId} hidden={!open} className="mt-5">
        {children}
      </div>
    </section>
  )
}
