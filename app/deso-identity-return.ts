"use client"

function fingerprint(query: string) {
  const params = new URLSearchParams(query)
  params.sort()
  let hash = BigInt("14695981039346656037")
  for (const character of params.toString()) hash = BigInt.asUintN(64, (hash ^ BigInt(character.charCodeAt(0))) * BigInt("1099511628211"))
  return hash.toString(16)
}
const consumed = new Set<string>()
// The official SDK consumes the initial document callback in its constructor.
// Remember that navigation without retaining its potentially sensitive payload.
if (typeof window !== "undefined") {
  const initial = window.performance?.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
  if (initial) {
    try { const url = new URL(initial.name); if (url.searchParams.get("service") === "identity") consumed.add(fingerprint(url.search)) } catch { /* No callback navigation. */ }
  }
}

/** Resume a return into an existing document (pageshow/history), exactly once. */
export function resumeIdentityReturn(handle: (url: string) => void) {
  const url = new URL(window.location.href)
  if (url.searchParams.get("service") !== "identity") return false
  const historyState = window.history.state
  const signature = fingerprint(url.search)
  if (!consumed.has(signature)) {
    consumed.add(signature)
    const method = url.searchParams.get("method")
    if (method === "derive" || method === "login") {
      try { handle(url.href) } catch { /* Invalid returns never grant a session. */ }
    }
  }
  // SDK or Next hydration may restore the original URL. Cleanup never handles twice.
  window.history.replaceState(historyState, "", window.location.pathname)
  return true
}
