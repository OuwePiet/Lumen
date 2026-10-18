"use client"

// Navigation intent only; this never grants an authenticated session.
const key = "via:identity:postoffice-after-login:v1"
let returned = false
export function markLoginReturn(url: string) {
  const parsed = new URL(url)
  if (parsed.searchParams.get("service") === "identity" && ["login", "derive"].includes(parsed.searchParams.get("method") ?? "")) returned = true
}
if (typeof window !== "undefined") {
  markLoginReturn(window.location.href)
  // The SDK can clean callback parameters before this module is evaluated.
  const initial = window.performance?.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
  if (initial) { try { markLoginReturn(initial.name) } catch { /* No valid callback navigation. */ } }
}
export function armPostOfficeAfterLogin() {
  returned = false
  try { window.sessionStorage.setItem(key, String(Date.now())) } catch { /* Login works without navigation storage. */ }
}
export function continueToPostOffice(publicKey: string | undefined) {
  if (!returned || !publicKey || window.location.pathname !== "/") return
  try {
    const raw = window.sessionStorage.getItem(key)
    if (raw === null) return
    const started = Number(raw)
    window.sessionStorage.removeItem(key)
    if (!Number.isFinite(started) || Date.now() - started > 30 * 60_000 || started > Date.now()) return
    returned = false
    window.location.replace("/social")
  } catch { /* Blocked storage must not disrupt DeSo login. */ }
}
