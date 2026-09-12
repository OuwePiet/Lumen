import { NextResponse } from "next/server"
import { evaluateCheckoutHandoffEligibility } from "../../../../lib/via/checkout-handoff-eligibility"
import { currentPaymentReadiness } from "../../../../lib/via/payment-readiness-server"
import { createProviderSessionDraft } from "../../../../lib/via/provider-session-boundary"
import { validateProviderSessionPreflightInput } from "../../../../lib/via/provider-session-preflight-validation"
import { verifyCheckoutAttemptSignature } from "../../../../lib/via/checkout-attempt-signing"
import { verifyCheckoutOrderSignature } from "../../../../lib/via/checkout-order-signing"
import type { ViaCheckoutOrder } from "../../../../lib/via/checkout-order-boundary"
import type { ViaCheckoutAttempt } from "../../../../lib/via/checkout-attempt-foundation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type ProviderSessionPreflightRequest = {
  order: ViaCheckoutOrder
  orderSignature: string
  attempt: ViaCheckoutAttempt
  attemptSignature: string
}

const noStore = { "Cache-Control": "no-store" }
const POST_HASH_RE = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  return Object.keys(value).every((key) => allowed.includes(key))
}

function isIsoDate(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value
}

function isCheckoutOrder(value: unknown): value is ViaCheckoutOrder {
  if (!isRecord(value)) return false
  if (!hasOnlyKeys(value, ["orderId", "nftId", "sellerPublicKey", "buyerPublicKey", "amountMinor", "currency", "status"])) return false
  if (!isNonEmptyString(value.orderId) || !UUID_RE.test(value.orderId)) return false
  if (!isNonEmptyString(value.nftId) || !POST_HASH_RE.test(value.nftId)) return false
  if (!isNonEmptyString(value.sellerPublicKey) || !PUBLIC_KEY_RE.test(value.sellerPublicKey)) return false
  if (value.buyerPublicKey !== undefined && (!isNonEmptyString(value.buyerPublicKey) || !PUBLIC_KEY_RE.test(value.buyerPublicKey))) return false
  if (!Number.isSafeInteger(value.amountMinor) || Number(value.amountMinor) <= 0) return false
  if (!["EUR", "USD", "BTC", "DESO"].includes(String(value.currency))) return false
  return value.status === "pending"
}

function isCheckoutAttempt(value: unknown): value is ViaCheckoutAttempt {
  if (!isRecord(value)) return false
  if (!hasOnlyKeys(value, ["attemptId", "orderId", "amountMinor", "currency", "method", "createdAt", "expiresAt", "status"])) return false
  if (!isNonEmptyString(value.attemptId) || !UUID_RE.test(value.attemptId)) return false
  if (!isNonEmptyString(value.orderId) || !UUID_RE.test(value.orderId)) return false
  if (!Number.isSafeInteger(value.amountMinor) || Number(value.amountMinor) <= 0) return false
  if (!["EUR", "USD", "BTC", "DESO"].includes(String(value.currency))) return false
  if (!["fiat-eur", "fiat-usd", "bitcoin", "deso"].includes(String(value.method))) return false
  if (!isIsoDate(value.createdAt) || !isIsoDate(value.expiresAt)) return false
  return value.status === "created"
}

function isProviderSessionPreflightRequest(value: unknown): value is ProviderSessionPreflightRequest {
  if (!isRecord(value)) return false
  if (!hasOnlyKeys(value, ["order", "orderSignature", "attempt", "attemptSignature"])) return false
  return (
    isCheckoutOrder(value.order) &&
    isNonEmptyString(value.orderSignature) &&
    isCheckoutAttempt(value.attempt) &&
    isNonEmptyString(value.attemptSignature)
  )
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as unknown
    if (!isProviderSessionPreflightRequest(input)) {
      return NextResponse.json(
        { eligible: false, reason: "invalid-request" },
        { status: 400, headers: noStore },
      )
    }

    if (!verifyCheckoutOrderSignature(input.order, input.orderSignature)) {
      return NextResponse.json(
        { eligible: false, reason: "invalid-order-signature" },
        { status: 409, headers: noStore },
      )
    }

    if (!verifyCheckoutAttemptSignature(input.attempt, input.attemptSignature)) {
      return NextResponse.json(
        { eligible: false, reason: "invalid-attempt-signature" },
        { status: 409, headers: noStore },
      )
    }

    const validation = validateProviderSessionPreflightInput(input.order, input.attempt)
    if (!validation.valid) {
      return NextResponse.json(
        { eligible: false, reason: validation.reason },
        { status: 409, headers: noStore },
      )
    }

    const readiness = currentPaymentReadiness()
    const handoff = evaluateCheckoutHandoffEligibility(input.order, input.attempt, readiness.methods)

    if (!handoff.eligible) {
      return NextResponse.json(handoff, { status: 409, headers: noStore })
    }

    const draft = createProviderSessionDraft(
      {
        orderId: input.order.orderId,
        attemptId: input.attempt.attemptId,
        method: handoff.method,
      },
      true,
    )

    if (!draft) {
      return NextResponse.json(
        { eligible: false, reason: "session-draft-rejected" },
        { status: 409, headers: noStore },
      )
    }

    return NextResponse.json(
      { eligible: true, session: draft },
      { status: 200, headers: noStore },
    )
  } catch {
    return NextResponse.json(
      { eligible: false, reason: "invalid-request" },
      { status: 400, headers: noStore },
    )
  }
}
