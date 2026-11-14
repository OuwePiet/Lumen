"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { viaModernIdentity } from "../deso-identity-modern"

/** An explicit public lookup stays public; personal navigation follows Identity. */
export default function ActiveAccountReader() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const query = search.toString()
  const [active, setActive] = useState<string | null>(null)
  const tracksActive = !search.has("publicKey") || search.get("account") === "active"
  useEffect(() => {
    const params = new URLSearchParams(query)
    if (params.has("publicKey") && params.get("account") !== "active") return
    return viaModernIdentity.subscribe((user) => {
      setActive(user?.publicKey ?? null)
      const next = new URLSearchParams(query)
      next.set("account", "active")
      if (user) next.set("publicKey", user.publicKey)
      else next.delete("publicKey")
      if (next.toString() !== query) router.replace(`${pathname}?${next}`, { scroll: false })
    })
  }, [pathname, query, router])
  if (!tracksActive || search.get("publicKey") === active) return null
  return <div data-via-reader-stale role="status" className="py-6 text-sm text-zinc-400">
    Actieve VIA-account controleren…
    <style>{`main:has(> [data-via-reader-stale]) > :not([data-via-reader-stale]) { display: none !important; }`}</style>
  </div>
}
