"use client"

import { useState } from "react"

type Currency = "EUR" | "USD"
type Method = "fiat-eur" | "fiat-usd"

type CheckoutOrder = {
  orderId: string
  nftId: string
  sellerPublicKey: string
  buyerPublicKey?: string
  amountMinor: number
  currency: Currency | "BTC" | "DESO"
  status: "pending"
}

type CheckoutAttempt = {
  attemptId: string
  orderId: string
  amountMinor: number
  currency: Currency | "BTC" | "DESO"
  method: Method | "bitcoin" | "deso"
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
  return currency === "EUR" ? "fiat-eur" : "fiat-usd"
}

function formatMinorUnits(amountMinor: number, currency: Currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amountMinor / 100)
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}))
  return { response, data }
}

export default function CheckoutSecurityPreview() {
  const [nftId, setNftId] = useState("")
  const [sellerPublicKey, setSellerPublicKey] = useState("")
  const [currency, setCurrency] = useState<Currency>("EUR")
  const [state, setState] = useState<PreviewState>({ phase: "idle" })

  async function runPreview() {
    const normalizedNftId = nftId.trim()
    const normalizedSeller = sellerPublicKey.trim()

    if (!normalizedNftId || !normalizedSeller) {
      setState({ phase: "blocked", message: "Enter an NFT and seller public key." })
      return
    }

    setState({ phase: "running", message: "Verifying live DeSo listing evidence…" })

    try {
      const listingResult = await readJson(
        await fetch(
          `/api/via/listing?seller=${encodeURIComponent(normalizedSeller)}&nft=${encodeURIComponent(normalizedNftId)}`,
          { cache: "no-store" },
        ),
      )

      const listingData = listingResult.data as {
        resolved?: boolean
        reason?: string
        listing?: {
          forSale?: boolean
          copiesForSale?: number
        }
      }

      if (!listingResult.response.ok || !listingData.resolved || !listingData.listing) {
        setState({
          phase: "blocked",
          message: `Listing blocked: ${listingData.reason ?? "DeSo listing could not be verified"}.`,
        })
        return
      }

      if (!listingData.listing.forSale || !listingData.listing.copiesForSale) {
        setState({
          phase: "blocked",
          message: "Listing blocked: this NFT is not currently observed for sale for this seller.",
        })
        return
      }

      setState({ phase: "running", message: "Listing verified. Resolving server-authoritative fiat terms…" })

      const termsResult = await readJson(
        await fetch(
          `/api/via/listing-terms?seller=${encodeURIComponent(normalizedSeller)}&nft=${encodeURIComponent(normalizedNftId)}&currency=${currency}`,
          { cache: "no-store" },
        ),
      )

      const termsData = termsResult.data as {
        resolved?: boolean
        authoritative?: boolean
        reason?: string
        term?: {
          amountMinor?: number
          currency?: Currency
        }
      }

      const authoritativeAmount = termsData.term?.amountMinor
      if (
        !termsResult.response.ok ||
        !termsData.resolved ||
        !termsData.authoritative ||
        !Number.isSafeInteger(authoritativeAmount) ||
        Number(authoritativeAmount) <= 0 ||
        termsData.term?.currency !== currency
      ) {
        setState({
          phase: "blocked",
          message: `Terms blocked: ${termsData.reason ?? "authoritative fiat terms are unavailable"}.`,
        })
        return
      }

      setState({
        phase: "running",
        message: `Authoritative price ${formatMinorUnits(Number(authoritativeAmount), currency)}. Issuing server-signed order…`,
      })

      const orderResult = await readJson(
        await fetch("/api/via/checkout-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            nftId: normalizedNftId,
            sellerPublicKey: normalizedSeller,
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

      if (
        orderData.order.amountMinor !== authoritativeAmount ||
        orderData.order.currency !== currency
      ) {
        setState({
          phase: "blocked",
          message: "Order blocked: signed order terms do not match the authoritative listing terms.",
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
        message: `Secure preflight passed at ${formatMinorUnits(Number(authoritativeAmount), currency)} after live DeSo sale verification and server-authoritative pricing. This preview still does not create or execute a payment.`,
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
        Verifies the live DeSo sale and VIA&apos;s server-authoritative EUR/USD terms, then runs the signed order → signed attempt → provider preflight chain. The browser does not choose the price, and this preview cannot charge, transfer an NFT or write to DeSo.
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
        <label>
          <span style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Fiat currency</span>
          <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} style={inputStyle}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </label>
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
