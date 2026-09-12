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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isCheckoutOrder(value: unknown): value is ViaCheckoutOrder {
  if (!isRecord(value)) return false
  if (!isNonEmptyString(value.orderId)) return false
  if (!isNonEmptyString(value.nftId)) return false
  if (!isNonEmptyString(value.sellerPublicKey)) return false
  if (value.buyerPublicKey !== undefined && !isNonEmptyString(value.buyerPublicKey)) return false
  if (!Number.isSafeInteger(value.amountMinor) || Number(value.amountMinor) <= 0) return false
  if (!["EUR", "USD", "BTC", "DESO"].includes(String(value.currency))) return false
  return value.status === "pending"
}

function isCheckoutAttempt(value: unknown): value is ViaCheckoutAttempt {
  if (!isRecord(value)) return false
  if (!isNonEmptyString(value.attemptId)) return false
  if (!isNonEmptyString(value.orderId)) return false
  if (!Number.isSafeInteger(value.amountMinor) || Number(value.amountMinor) <= 0) return false
  if (!["EUR", "USD", "BTC", "DESO"].includes(String(value.currency))) return false
  if (!["fiat-eur", "fiat-usd", "bitcoin", "deso"].includes(String(value.method))) return false
  if (!isNonEmptyString(value.createdAt) || !isNonEmptyString(value.expiresAt)) return false
  return value.status === "created"
}

function isProviderSessionPreflightRequest(value: unknown): value is ProviderSessionPreflightRequest {
  if (!isRecord(value)) return false
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

    const validation = validateProviderSessionPreflightInput(
      input.order,
      input.attempt,
    )
    if (!validation.valid) {
      return NextResponse.json(
        { eligible: false, reason: validation.reason },
        { status: 409, headers: noStore },
      )
    }

    const readiness = currentPaymentReadiness()
    const handoff = evaluateCheckoutHandoffEligibility(
      input.order,
      input.attempt,
      readiness.methods,
    )

    if (!handoff.eligible) {
      return NextResponse.json(handoff, {
        status: 409,
        headers: noStore,
      })
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
