import { ArrowLeft } from "lucide-react"

export function PlaygroundHeader() {
  return (
    <header className="border-b border-border px-4 pt-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Back"
          className="rounded p-1 text-foreground hover:bg-panel focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-[22px] font-semibold tracking-tight">Azure Speech - Speech Translation</h1>
      </div>
      <nav aria-label="Page sections" className="mt-3 flex">
        <a
          href="#"
          aria-current="page"
          className="border-b-[3px] border-accent px-0.5 pb-1.5 text-[15px] font-semibold"
        >
          Playground
        </a>
      </nav>
    </header>
  )
}
