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
const POST_HASH_RE = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type IssueAttemptRequest = {
  order: ViaCheckoutOrder
  orderSignature: string
  method: ViaCheckoutAttemptInput["method"]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  return Object.keys(value).every((key) => allowed.includes(key))
}

function isIssueAttemptRequest(value: unknown): value is IssueAttemptRequest {
  if (!isRecord(value) || !isRecord(value.order)) return false
  if (!hasOnlyKeys(value, ["order", "orderSignature", "method"])) return false

  const order = value.order
  if (!hasOnlyKeys(order, ["orderId", "nftId", "sellerPublicKey", "buyerPublicKey", "amountMinor", "currency", "status"])) return false
  if (typeof value.orderSignature !== "string" || !value.orderSignature.trim()) return false
  if (!(value.method === "fiat-eur" || value.method === "fiat-usd" || value.method === "bitcoin" || value.method === "deso")) return false

  if (typeof order.orderId !== "string" || !UUID_RE.test(order.orderId)) return false
  if (typeof order.nftId !== "string" || !POST_HASH_RE.test(order.nftId)) return false
  if (typeof order.sellerPublicKey !== "string" || !PUBLIC_KEY_RE.test(order.sellerPublicKey)) return false
  if (order.buyerPublicKey !== undefined && (typeof order.buyerPublicKey !== "string" || !PUBLIC_KEY_RE.test(order.buyerPublicKey))) return false
  if (!Number.isSafeInteger(order.amountMinor) || Number(order.amountMinor) <= 0) return false
  if (!(order.currency === "EUR" || order.currency === "USD" || order.currency === "BTC" || order.currency === "DESO")) return false
  return order.status === "pending"
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

    const input: unknown = await request.json()
    if (!isIssueAttemptRequest(input)) {
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

    if (!methodMatchesCurrency(input.order.currency, input.method)) {
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
