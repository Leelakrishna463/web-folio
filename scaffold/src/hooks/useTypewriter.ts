import { useEffect, useRef, useState } from "react"

/** Types `text` one character at a time. The first value renders instantly so the page is complete at rest. */
export function useTypewriter(text: string) {
  const [typed, setTyped] = useState(text)
  const [done, setDone] = useState(true)
  const prev = useRef(text)

  useEffect(() => {
    if (prev.current === text) return
    prev.current = text
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(text); setDone(true); return
    }
    let k = 0
    let timer: number
    setTyped(""); setDone(false)
    const tick = () => {
      k += 1
      setTyped(text.slice(0, k))
      if (k < text.length) timer = window.setTimeout(tick, 28 + Math.random() * 30)
      else timer = window.setTimeout(() => setDone(true), 140)
    }
    timer = window.setTimeout(tick, 120)
    return () => window.clearTimeout(timer)
  }, [text])

  return { typed, done }
}
