import { useCallback, useEffect, useState } from "react"

/** One viewport of page scroll per section. Returns the active index and a jump helper. */
export function useScrollSection(count: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const update = () => {
      const i = Math.round(window.scrollY / window.innerHeight)
      setIndex(Math.min(count - 1, Math.max(0, i)))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [count])

  const jump = useCallback((i: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const clamped = Math.min(count - 1, Math.max(0, i))
    window.scrollTo({ top: clamped * window.innerHeight, behavior: reduce ? "auto" : "smooth" })
  }, [count])

  return { index, jump }
}
