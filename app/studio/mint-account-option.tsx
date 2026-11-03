"use client"
import { useEffect, useState } from "react"
export default function MintAccountOption({ publicKey }: { publicKey: string }) {
  const [name, setName] = useState("")
  useEffect(() => {
    const controller = new AbortController()
    try { const cached = JSON.parse(localStorage.getItem("via:public-profile:" + publicKey) ?? "null"); if (cached?.publicKey === publicKey && typeof cached.username === "string") setName(cached.username) } catch {}
    void fetch("/api/via/profile?identity=" + encodeURIComponent(publicKey) + "&compact=1", { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(d => { if (!controller.signal.aborted && d?.ok && typeof d.profile?.username === "string") setName(d.profile.username) }).catch(() => {})
    return () => controller.abort()
  }, [publicKey])
  return <option value={publicKey}>{name ? "@" + name : publicKey.slice(0, 8) + "…" + publicKey.slice(-5)}</option>
}
