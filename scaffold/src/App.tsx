import { useEffect } from "react"

import { SECTIONS } from "@/components/sections"
import { Terminal } from "@/components/Terminal"
import { Button } from "@/components/ui/button"
import { useScrollSection } from "@/hooks/useScrollSection"
import { cn } from "@/lib/utils"

export default function App() {
  const { index, jump } = useScrollSection(SECTIONS.length)
  const active = SECTIONS[index]
  const last = index === SECTIONS.length - 1

  // j / k step through commands, like a pager
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return
      if (e.key === "j") jump(index + 1)
      if (e.key === "k") jump(index - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, jump])

  return (
    <div className="relative px-4">
      {/* sticky stage + one viewport of scroll per command */}
      <div className="sticky top-[env(safe-area-inset-top,0px)] grid h-svh place-items-center py-6">
        <Terminal cmd={active.cmd} contentKey={active.cmd}>
          <active.Component />
        </Terminal>
      </div>
      {SECTIONS.slice(1).map((s) => <div key={s.cmd} aria-hidden className="h-svh" />)}

      {/* command history: full list on wide screens, dots on narrow */}
      <nav aria-label="Sections" className="fixed bottom-[calc(14px+env(safe-area-inset-bottom,0px))] left-1/2 z-10 -translate-x-1/2 min-[1200px]:top-1/2 min-[1200px]:right-5 min-[1200px]:bottom-auto min-[1200px]:left-auto min-[1200px]:translate-x-0 min-[1200px]:-translate-y-1/2">
        <ul className="flex gap-1.5 min-[1200px]:flex-col min-[1200px]:gap-1">
          {SECTIONS.map((s, i) => (
            <li key={s.cmd}>
              <Button
                variant="ghost"
                size="sm"
                aria-current={i === index}
                aria-label={`${s.label}: run ${s.cmd}`}
                onClick={() => jump(i)}
                className={cn(
                  "size-2 rounded-full bg-border p-0 font-mono text-xs font-normal hover:bg-muted-foreground",
                  "min-[1200px]:h-7 min-[1200px]:w-auto min-[1200px]:justify-start min-[1200px]:rounded-md min-[1200px]:bg-transparent min-[1200px]:px-2 min-[1200px]:text-muted-foreground min-[1200px]:hover:bg-accent",
                  i === index && "bg-primary min-[1200px]:bg-transparent min-[1200px]:text-primary"
                )}
              >
                <span className="hidden min-[1200px]:inline">{i === index ? "▸ " : ""}{s.cmd}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <p
        aria-hidden
        className={cn(
          "fixed bottom-[calc(38px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 font-mono text-xs whitespace-nowrap text-muted-foreground transition-opacity min-[1200px]:bottom-[calc(14px+env(safe-area-inset-bottom,0px))]",
          last && "opacity-0"
        )}
      >
        scroll ↓<span className="hidden sm:inline"> or press j</span> to run the next command
      </p>
    </div>
  )
}
