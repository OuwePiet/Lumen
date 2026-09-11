"use client"

import { useEffect, useState } from "react"

type PaymentMethod = {
  method: "fiat-eur" | "fiat-usd" | "bitcoin" | "deso"
  actionable: boolean
  priority: 1 | 2 | 3
}

export default function ViaPaymentReadiness() {
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/via/payment-readiness", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("payment readiness unavailable")
        return response.json()
      })
      .then((data) => {
        if (active) setMethods(Array.isArray(data.methods) ? data.methods : [])
      })
      .catch(() => {
        if (active) setMethods([])
      })
    return () => {
      active = false
    }
  }, [])

  if (methods === null) return <p>Checking payment availability…</p>

  const available = methods.filter((item) => item.actionable)
  if (available.length === 0) {
    return <p>Payments are not available yet.</p>
  }

  const labels: Record<PaymentMethod["method"], string> = {
    "fiat-eur": "Pay in EUR",
    "fiat-usd": "Pay in USD",
    bitcoin: "Pay with Bitcoin",
    deso: "Pay with DESO",
  }

  return (
    <div aria-label="Available payment methods">
      {available
        .sort((a, b) => a.priority - b.priority)
        .map((item) => (
          <button type="button" key={item.method} disabled>
            {labels[item.method]}
          </button>
        ))}
      <p>Payment creation is not enabled in this preview.</p>
    </div>
  )
}
