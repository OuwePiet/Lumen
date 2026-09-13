"use client"

import { useEffect, useState } from "react"

type Method = { method: string; actionable: boolean; checkoutEnabled?: boolean }
type LoadState = "loading" | "ready" | "error"

export default function ViaPaymentStatusCard() {
  const [methods, setMethods] = useState<Method[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    fetch("/api/via/payment-readiness", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!active) return
        setMethods(Array.isArray(data.methods) ? data.methods : [])
        setLoadState("ready")
      })
      .catch((error) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return
        setMethods([])
        setLoadState("error")
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const ready = methods.filter((item) => item.checkoutEnabled === true).length

  return (
    <aside
      aria-label="VIA payment status"
      style={{
        border: "1px solid rgba(143,212,169,.22)",
        borderRadius: 12,
        padding: 14,
        background: "rgba(9,13,11,.72)",
      }}
    >
      <strong style={{ color: "#9adbb2" }}>Payment status</strong>
      <p style={{ color: "#a9b8af", fontSize: 13, marginBottom: 0 }}>
        {loadState === "loading"
          ? "Checking availability…"
          : loadState === "error"
            ? "Payment availability could not be checked right now."
            : ready > 0
              ? ready + " payment method" + (ready === 1 ? "" : "s") + " currently available."
              : "Payments are not available yet."}
      </p>
      <a href="/payments" style={{ color: "#9adbb2", fontSize: 12 }}>
        View payment availability
      </a>
    </aside>
  )
}
