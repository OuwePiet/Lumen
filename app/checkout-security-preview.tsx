"use client"

import { useState } from "react"

type Currency = "EUR" | "USD" | "BTC"
type Method = "fiat-eur" | "fiat-usd" | "bitcoin"

type CheckoutOrder = {
  orderId: string
  nftId: string
  sellerPublicKey: string
  buyerPublicKey?: string
  amountMinor: number
  currency: Currency | "DESO"
  status: "pending"
}

type CheckoutAttempt = {
  attemptId: string
  orderId: string
  amountMinor: number
  currency: Currency | "DESO"
  method: Method | "deso"
  createdAt: string
  expiresAt: string
  status: "created"
}

type PreviewState =
  | { phase: "idle" }
  | { phase: "running"; message: string }
  | { phase: "blocked"; message: string }
  | { phase: "eligible"; message: string }

function methodFor(currency: Currency): Method {
  if (currency === "EUR") return "fiat-eur"
  if (currency === "USD") return "fiat-usd"
  return "bitcoin"
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}))
  return { response, data }
}

export default function CheckoutSecurityPreview() {
  const [nftId, setNftId] = useState("")
  const [sellerPublicKey, setSellerPublicKey] = useState("")
  const [amountMinor, setAmountMinor] = useState("100")
  const [currency, setCurrency] = useState<Currency>("EUR")
  const [state, setState] = useState<PreviewState>({ phase: "idle" })

  async function runPreview() {
    const amount = Number(amountMinor)
    if (!nftId.trim() || !sellerPublicKey.trim() || !Number.isSafeInteger(amount) || amount <= 0) {
      setState({ phase: "blocked", message: "Enter an NFT, seller public key and valid integer amount." })
      return
    }

    setState({ phase: "running", message: "Issuing server-signed order…" })

    try {
      const orderResult = await readJson(
        await fetch("/api/via/checkout-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            nftId: nftId.trim(),
            sellerPublicKey: sellerPublicKey.trim(),
            amountMinor: amount,
            currency,
          }),
        }),
      )

      const orderData = orderResult.data as {
        issued?: boolean
        reason?: string
        order?: CheckoutOrder
        signature?: string
      }

      if (!orderResult.response.ok || !orderData.issued || !orderData.order || !orderData.signature) {
        setState({
          phase: "blocked",
          message: `Order blocked: ${orderData.reason ?? "server rejected checkout order"}.`,
        })
        return
      }

      setState({ phase: "running", message: "Issuing signed checkout attempt…" })

      const attemptResult = await readJson(
        await fetch("/api/via/checkout-attempt/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            order: orderData.order,
            orderSignature: orderData.signature,
            method: methodFor(currency),
          }),
        }),
      )

      const attemptData = attemptResult.data as {
        issued?: boolean
        reason?: string
        attempt?: CheckoutAttempt
        signature?: string
      }

      if (!attemptResult.response.ok || !attemptData.issued || !attemptData.attempt || !attemptData.signature) {
        setState({
          phase: "blocked",
          message: `Attempt blocked: ${attemptData.reason ?? "server rejected checkout attempt"}.`,
        })
        return
      }

      setState({ phase: "running", message: "Checking provider-session eligibility…" })

      const preflightResult = await readJson(
        await fetch("/api/via/provider-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            order: orderData.order,
            orderSignature: orderData.signature,
            attempt: attemptData.attempt,
            attemptSignature: attemptData.signature,
          }),
        }),
      )

      const preflightData = preflightResult.data as {
        eligible?: boolean
        reason?: string
      }

      if (!preflightResult.response.ok || !preflightData.eligible) {
        setState({
          phase: "blocked",
          message: `Preflight blocked: ${preflightData.reason ?? "payment method is not operational"}. No payment was created.`,
        })
        return
      }

      setState({
        phase: "eligible",
        message: "Secure preflight passed. This preview still does not create or execute a payment.",
      })
    } catch {
      setState({ phase: "blocked", message: "Secure checkout preview unavailable." })
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    borderRadius: 9,
    border: "1px solid rgba(143,212,169,.24)",
    background: "#080c0a",
    color: "#f4f7f5",
    padding: "10px 12px",
  }

  return (
    <section style={{ marginTop: 24, paddingTop: 22, borderTop: "1px solid rgba(143,212,169,.16)" }}>
      <p style={{ color: "#8fd4a9", fontSize: 12, letterSpacing: ".1em" }}>SECURE CHECKOUT PREVIEW</p>
      <p style={{ color: "#b9c6be", lineHeight: 1.6 }}>
        Runs the signed order → signed attempt → provider preflight chain. It cannot charge, transfer an NFT or write to DeSo.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          <span style={{ display: "block", marginBottom: 6, fontSize: 13 }}>NFT ID</span>
          <input value={nftId} onChange={(event) => setNftId(event.target.value)} style={inputStyle} />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Seller public key</span>
          <input value={sellerPublicKey} onChange={(event) => setSellerPublicKey(event.target.value)} style={inputStyle} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
          <label>
            <span style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Amount in minor units</span>
            <input inputMode="numeric" value={amountMinor} onChange={(event) => setAmountMinor(event.target.value)} style={inputStyle} />
          </label>
          <label>
            <span style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} style={inputStyle}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="BTC">BTC</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={runPreview}
          disabled={state.phase === "running"}
          style={{
            borderRadius: 9,
            border: "1px solid rgba(143,212,169,.34)",
            background: "rgba(143,212,169,.1)",
            color: "#dff4e6",
            padding: "11px 14px",
            cursor: state.phase === "running" ? "wait" : "pointer",
          }}
        >
          {state.phase === "running" ? "Checking…" : "Run secure checkout preview"}
        </button>
      </div>

      {state.phase !== "idle" ? (
        <p role="status" style={{ marginTop: 14, color: state.phase === "eligible" ? "#a9dfba" : "#c7d0ca" }}>
          {state.message}
        </p>
      ) : null}
    </section>
  )
}
