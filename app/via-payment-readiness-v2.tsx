"use client"

import { useEffect, useState } from "react"

type Method = {
  method: "fiat-eur" | "fiat-usd" | "bitcoin" | "deso"
  actionable: boolean
  priority: 1 | 2 | 3
}

export default function ViaPaymentReadinessV2() {
  const [methods, setMethods] = useState<Method[] | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/via/payment-readiness-v2", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => active && setMethods(Array.isArray(data.methods) ? data.methods : []))
      .catch(() => active && setMethods([]))
    return () => { active = false }
  }, [])

  if (methods === null) return <p>Checking payment availability…</p>

  const labels: Record<Method["method"], string> = {
    "fiat-eur": "EUR",
    "fiat-usd": "USD",
    bitcoin: "Bitcoin",
    deso: "DESO",
  }
  const available = methods.filter((item) => item.actionable)

  return (
    <div aria-label="Current VIA payment readiness">
      {available.length === 0 ? (
        <p>Payments are not available yet.</p>
      ) : (
        <p>Available: {available.sort((a, b) => a.priority - b.priority).map((item) => labels[item.method]).join(", ")}</p>
      )}
      <p style={{ fontSize: 12, opacity: .72 }}>Payment creation remains disabled.</p>
    </div>
  )
}
