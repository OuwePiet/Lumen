"use client"

import { useEffect, useState } from "react"

type Method = { method: string; actionable: boolean }

export default function ViaPaymentStatusCard() {
  const [methods, setMethods] = useState<Method[] | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/via/payment-readiness", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => active && setMethods(Array.isArray(data.methods) ? data.methods : []))
      .catch(() => active && setMethods([]))
    return () => { active = false }
  }, [])

  const ready = methods?.filter((item) => item.actionable).length ?? 0

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
        {methods === null
          ? "Checking availability…"
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
