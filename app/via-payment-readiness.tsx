"use client"

import { useEffect, useState } from "react"

type PaymentMethod = {
  method: "fiat-eur" | "fiat-usd" | "bitcoin" | "deso"
  released: boolean
  operational: boolean
  actionable: boolean
  checkoutEnabled: boolean
  priority: 1 | 2 | 3
}

const labels: Record<PaymentMethod["method"], string> = {
  "fiat-eur": "EUR",
  "fiat-usd": "USD",
  bitcoin: "Bitcoin",
  deso: "DESO",
}

function stateLabel(item: PaymentMethod) {
  if (item.checkoutEnabled) return "Checkout ready"
  if (!item.released) return "Not released"
  if (!item.operational) return "Not operational"
  return "Prepared, checkout blocked"
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
  if (methods.length === 0) return <p>Payment readiness is unavailable.</p>

  return (
    <div aria-label="Payment method readiness" style={{ display: "grid", gap: 8, marginTop: 14 }}>
      {[...methods]
        .sort((a, b) => a.priority - b.priority)
        .map((item) => (
          <div
            key={item.method}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              padding: "10px 12px",
              borderRadius: 9,
              border: "1px solid rgba(143,212,169,.18)",
              background: "rgba(143,212,169,.04)",
            }}
          >
            <strong>{labels[item.method]}</strong>
            <span style={{ color: item.checkoutEnabled ? "#a9dfba" : "#aeb9b2", textAlign: "right" }}>
              {stateLabel(item)}
            </span>
          </div>
        ))}
      <p style={{ color: "#b9c6be", lineHeight: 1.55, marginBottom: 0 }}>
        Only methods marked “Checkout ready” can enter VIA&apos;s current checkout path. Bitcoin and DESO remain blocked until their own authoritative payment paths are explicitly released.
      </p>
    </div>
  )
}
