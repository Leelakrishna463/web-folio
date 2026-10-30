import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { contact, experience, profile, projects, stack } from "@/data/profile"

export function WhoAmI() {
  return (
    <div className="grid gap-7 sm:grid-cols-[148px_1fr]">
      <div
        aria-label={`Photo of ${profile.name}`}
        className="grid aspect-square w-24 max-w-full place-items-center overflow-hidden rounded-lg border bg-chrome font-mono text-4xl font-bold text-primary sm:w-[148px] sm:text-6xl bg-[repeating-linear-gradient(0deg,rgb(127_200_184/0.05)_0_2px,transparent_2px_4px)]"
      >
        {profile.photo ? <img src={profile.photo} alt="" className="size-full object-cover" /> : profile.initials}
      </div>
      <div className="min-w-0">
        <h1 className="font-mono text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">{profile.name}</h1>
        <p className="mt-1.5 mb-4 font-mono text-[13px] text-prompt">{profile.role}</p>
        <div className="flex max-w-[60ch] flex-col gap-2.5 leading-relaxed">
          {profile.bio.map((p) => <p key={p}>{p}</p>)}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.facts.map((f) => (
            <Badge key={f.value} variant="outline" className="gap-1.5 font-mono font-normal text-muted-foreground">
              {f.before && <span>{f.before}</span>}
              <b className="font-medium text-foreground">{f.value}</b>
              {f.after && <span>{f.after}</span>}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Experience() {
  return (
    <ol className="grid gap-5">
      {experience.map((job) => (
        <li key={job.title + job.from} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
          <div className="pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">{job.from} – {job.to}</div>
          <div className="min-w-0">
            <h3 className="font-semibold">{job.title} · <span className="font-medium text-prompt">{job.org}</span></h3>
            <ul className="mt-1.5 grid gap-1">
              {job.points.map((p) => (
                <li key={p} className="flex gap-2"><span aria-hidden className="font-mono text-primary">›</span><span>{p}</span></li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Projects() {
  return (
    <div>
      <p className="mb-4 flex flex-wrap gap-x-5 font-mono text-[13px] text-prompt">
        {projects.map((p) => <span key={p.slug}>{p.slug}/</span>)}
      </p>
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
        {projects.map((p) => (
          <Card key={p.slug} className="min-w-0 gap-4 rounded-lg bg-background/40 py-4 shadow-none">
            <CardHeader className="px-4">
              <CardTitle className="font-mono text-sm text-primary">{p.slug}</CardTitle>
              <CardDescription>{p.problem}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 text-sm">
              <p className="mb-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">key decision</p>
              <p>{p.decision}</p>
            </CardContent>
            <CardFooter className="mt-auto flex-col items-start gap-3 px-4">
              <div className="flex flex-wrap gap-1.5">
                {p.stack.map((s) => <Badge key={s} variant="secondary" className="font-mono font-normal">{s}</Badge>)}
              </div>
              <p className="font-mono text-[13px] text-prompt">→ {p.metric}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function Stack() {
  return (
    <dl className="grid gap-3 font-mono text-sm">
      {stack.map((row) => (
        <div key={row.group} className="grid gap-1.5 sm:grid-cols-[130px_1fr] sm:gap-3">
          <dt className="pt-0.5 text-muted-foreground">{row.group}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {row.items.map((i) => <Badge key={i} variant="outline" className="font-normal">{i}</Badge>)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Contact() {
  const [copied, setCopied] = useState<"idle" | "copied" | "select">("idle")
  const copy = (el: HTMLElement | null) => {
    const select = () => {
      if (!el) return
      const r = document.createRange(); r.selectNodeContents(el)
      const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r)
      setCopied("select")
    }
    try {
      navigator.clipboard.writeText(contact.email).then(() => setCopied("copied"), select)
    } catch { select() }
    window.setTimeout(() => setCopied("idle"), 1600)
  }
  return (
    <div className="grid gap-3 font-mono text-sm">
      <p className="text-prompt">✓ connection established. Say hello:</p>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="w-20 text-muted-foreground">email</span>
        <span id="email" className="text-primary select-all">{contact.email}</span>
        <Button variant="outline" size="sm" className="h-7 font-mono text-xs" onClick={() => copy(document.getElementById("email"))}>
          {copied === "copied" ? "copied" : copied === "select" ? "selected" : "copy"}
        </Button>
      </div>
      {contact.links.map((l) => (
        <div key={l.label} className="flex flex-wrap items-center gap-2.5">
          <span className="w-20 text-muted-foreground">{l.label}</span>
          <Button asChild variant="link" className="h-auto p-0 font-mono">
            <a href={l.href} target="_blank" rel="noopener noreferrer">{l.text}</a>
          </Button>
        </div>
      ))}
      <p className="mt-2 text-muted-foreground">exit 0</p>
    </div>
  )
}

export const SECTIONS = [
  { cmd: "whoami", label: "About", Component: WhoAmI },
  { cmd: "cat experience.log", label: "Experience", Component: Experience },
  { cmd: "ls ~/projects", label: "Projects", Component: Projects },
  { cmd: "cat stack.txt", label: "Stack", Component: Stack },
  { cmd: "./contact.sh", label: "Contact", Component: Contact },
] as const
