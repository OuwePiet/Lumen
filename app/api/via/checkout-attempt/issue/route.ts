import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import {
  createCheckoutAttempt,
  type ViaCheckoutAttemptInput,
} from "../../../../../lib/via/checkout-attempt-foundation"
import type { ViaCheckoutOrder } from "../../../../../lib/via/checkout-order-boundary"
import { verifyCheckoutOrderSignature } from "../../../../../lib/via/checkout-order-signing"
import {
  checkoutAttemptSigningReady,
  signCheckoutAttempt,
} from "../../../../../lib/via/checkout-attempt-signing"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const noStore = { "Cache-Control": "no-store" }
const ATTEMPT_TTL_MS = 15 * 60 * 1000

type IssueAttemptRequest = {
  order: ViaCheckoutOrder
  orderSignature: string
  method: ViaCheckoutAttemptInput["method"]
}

function methodMatchesCurrency(
  currency: ViaCheckoutOrder["currency"],
  method: ViaCheckoutAttemptInput["method"],
): boolean {
  if (currency === "EUR") return method === "fiat-eur"
  if (currency === "USD") return method === "fiat-usd"
  if (currency === "BTC") return method === "bitcoin"
  return method === "deso"
}

export async function POST(request: Request) {
  try {
    if (!checkoutAttemptSigningReady()) {
      return NextResponse.json(
        { issued: false, reason: "attempt-signing-unavailable" },
        { status: 503, headers: noStore },
      )
    }

    const input = (await request.json()) as IssueAttemptRequest
    if (!input?.order || !input?.orderSignature || !input?.method) {
      return NextResponse.json(
        { issued: false, reason: "invalid-request" },
        { status: 400, headers: noStore },
      )
    }

    if (!verifyCheckoutOrderSignature(input.order, input.orderSignature)) {
      return NextResponse.json(
        { issued: false, reason: "invalid-order-signature" },
        { status: 409, headers: noStore },
      )
    }

    if (input.order.status !== "pending" || !methodMatchesCurrency(input.order.currency, input.method)) {
      return NextResponse.json(
        { issued: false, reason: "invalid-order-method" },
        { status: 409, headers: noStore },
      )
    }

    const createdAt = new Date()
    const attempt = createCheckoutAttempt(
      {
        orderId: input.order.orderId,
        amountMinor: input.order.amountMinor,
        currency: input.order.currency,
        method: input.method,
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(createdAt.getTime() + ATTEMPT_TTL_MS).toISOString(),
      },
      randomUUID(),
    )

    if (!attempt) {
      return NextResponse.json(
        { issued: false, reason: "invalid-attempt" },
        { status: 400, headers: noStore },
      )
    }

    const signature = signCheckoutAttempt(attempt)
    if (!signature) {
      return NextResponse.json(
        { issued: false, reason: "attempt-signing-unavailable" },
        { status: 503, headers: noStore },
      )
    }

    return NextResponse.json(
      { issued: true, attempt, signature },
      { status: 200, headers: noStore },
    )
  } catch {
    return NextResponse.json(
      { issued: false, reason: "invalid-request" },
      { status: 400, headers: noStore },
    )
  }
}
