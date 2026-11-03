"use client"
import { useCallback, useEffect, useRef, useState } from "react"
export function useAnalyticsSnapshot<T extends { ok?: boolean; measuredAt?: string; error?: string | null }>(url: string, minimumInterval: number) {
  const [snapshot, setSnapshot] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const lastAttempt = useRef(0), inFlight = useRef(false), mounted = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const refresh = useCallback(async (force = false) => {
    if (!mounted.current || inFlight.current || document.visibilityState === "hidden" || navigator.onLine === false) return
    if (Date.now() - lastAttempt.current < (force ? 5000 : minimumInterval)) return
    lastAttempt.current = Date.now(); inFlight.current = true; setRefreshing(true)
    const request = new AbortController(); controller.current = request
    const timer = setTimeout(() => request.abort(), 12000)
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" }, signal: request.signal })
      const data = await response.json() as T
      if (!response.ok || !data.ok) throw new Error(data.error ?? "ANALYTICS_SOURCE_UNAVAILABLE")
      if (mounted.current && !request.signal.aborted) {
        setSnapshot(data); setError(null)
        try { sessionStorage.setItem("via:analytics:snapshot:v1:" + url, JSON.stringify({ savedAt: Date.now(), snapshot: data })) } catch { /* Public cache is optional. */ }
      }
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : "ANALYTICS_SOURCE_UNAVAILABLE")
      // Keep the last measured snapshot. Errors are never converted into zeros.
    } finally {
      clearTimeout(timer); inFlight.current = false
      if (mounted.current) setRefreshing(false)
    }
  }, [url, minimumInterval])
  useEffect(() => {
    mounted.current = true
    try {
      const saved = JSON.parse(sessionStorage.getItem("via:analytics:snapshot:v1:" + url) ?? "null") as { savedAt?: number; snapshot?: T } | null
      const measuredAt = Date.parse(saved?.snapshot?.measuredAt ?? "")
      if (saved?.snapshot?.ok === true && typeof saved.savedAt === "number" && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < 7 * 86400000 && Number.isFinite(measuredAt) && measuredAt <= Date.now() + 60000) setSnapshot(saved.snapshot)
    } catch { /* Invalid or unavailable caches never prevent a fresh read. */ }
    const trigger = () => { void refresh() }
    trigger()
    for (const name of ["focus", "pageshow", "online"]) window.addEventListener(name, trigger)
    document.addEventListener("visibilitychange", trigger)
    const timer = setInterval(trigger, 60000)
    return () => {
      mounted.current = false; controller.current?.abort(); clearInterval(timer)
      for (const name of ["focus", "pageshow", "online"]) window.removeEventListener(name, trigger)
      document.removeEventListener("visibilitychange", trigger)
    }
  }, [refresh])
  return { snapshot, error, refreshing, refresh }
}
