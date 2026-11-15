"use client"

import { useEffect } from "react"

const UPDATE_INTERVAL_MS = 60 * 60 * 1000

export default function ViaPwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    let active = true
    let registration: ServiceWorkerRegistration | undefined
    let lastCheck = 0

    const checkForUpdates = () => {
      if (!active || document.visibilityState !== "visible" || !navigator.onLine) return
      const now = Date.now()
      if (now - lastCheck < UPDATE_INTERVAL_MS) return
      lastCheck = now
      void registration?.update().catch(() => {})
    }

    const register = async () => {
      try {
        const result = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
        if (!active) return
        registration = result
        checkForUpdates()
      } catch { /* Offline and restricted browser modes must not block VIA. */ }
    }

    const onVisible = () => checkForUpdates()
    const onFocus = () => checkForUpdates()
    const onOnline = () => checkForUpdates()
    const timer = window.setInterval(checkForUpdates, UPDATE_INTERVAL_MS)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onFocus)
    window.addEventListener("online", onOnline)
    if (document.readyState === "complete") void register()
    else window.addEventListener("load", register, { once: true })

    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener("load", register)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("online", onOnline)
    }
  }, [])
  return null
}
