import { useEffect, useRef, useState, type ReactNode } from "react"

import { profile } from "@/data/profile"
import { useTypewriter } from "@/hooks/useTypewriter"
import { cn } from "@/lib/utils"

type Props = { cmd: string; children: ReactNode; contentKey: string }

export function Terminal({ cmd, children, contentKey }: Props) {
  const { typed, done } = useTypewriter(cmd)
  const bodyRef = useRef<HTMLDivElement>(null)
  // keep showing the previous output until the new command finishes typing
  const [shown, setShown] = useState({ key: contentKey, node: children })
  useEffect(() => {
    if (done && shown.key !== contentKey) {
      setShown({ key: contentKey, node: children })
      bodyRef.current?.scrollTo({ top: 0 })
    }
  }, [done, contentKey, children, shown.key])

  const prompt = `${profile.handle}@${profile.host}`
  return (
    <section
      aria-label="Portfolio terminal"
      className="flex h-[min(620px,calc(100svh-96px))] w-[min(900px,100%)] flex-col overflow-hidden rounded-xl border bg-card shadow-[0_30px_80px_-30px_rgb(0_0_0/0.7)]"
    >
      <div aria-hidden className="flex items-center gap-2 border-b bg-chrome px-3.5 py-2.5 font-mono text-xs text-muted-foreground">
        <span className="size-[11px] rounded-full bg-[#d9695f]" />
        <span className="size-[11px] rounded-full bg-[#d9b45f]" />
        <span className="size-[11px] rounded-full bg-[#6fbf73]" />
        <span className="flex-1 truncate text-center sm:mr-[49px]">{prompt}: ~ — {cmd}</span>
      </div>

      <div ref={bodyRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-sm">
          <span><span className="text-prompt">{prompt}</span><span className="text-muted-foreground">:~$</span></span>
          <span>
            <span className="font-medium text-primary">{typed}</span>
            <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-2 animate-blink bg-primary align-text-bottom" />
          </span>
        </div>
        <div
          aria-live="polite"
          key={shown.key}
          className={cn("mt-5 transition-[opacity,translate] duration-200", done ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1.5")}
        >
          {shown.node}
        </div>
      </div>
    </section>
  )
}
