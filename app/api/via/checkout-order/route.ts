import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import {
  createCheckoutOrder,
  type ViaCheckoutOrderInput,
} from "../../../../lib/via/checkout-order-boundary"
import { validateCheckoutOrderForAttempt } from "../../../../lib/via/checkout-order-validation"
import {
  checkoutOrderSigningReady,
  signCheckoutOrder,
} from "../../../../lib/via/checkout-order-signing"
import { currentPaymentReadiness } from "../../../../lib/via/payment-readiness-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const noStore = { "Cache-Control": "no-store" }

type IssueCheckoutOrderRequest = Omit<ViaCheckoutOrderInput, "orderId">

function isIssueCheckoutOrderRequest(value: unknown): value is IssueCheckoutOrderRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false

  const input = value as Record<string, unknown>
  if (typeof input.nftId !== "string" || !input.nftId.trim()) return false
  if (typeof input.sellerPublicKey !== "string" || !input.sellerPublicKey.trim()) return false
  if (
    input.buyerPublicKey !== undefined &&
    (typeof input.buyerPublicKey !== "string" || !input.buyerPublicKey.trim())
  ) {
    return false
  }
  if (!Number.isSafeInteger(input.amountMinor) || Number(input.amountMinor) <= 0) return false
  return ["EUR", "USD", "BTC", "DESO"].includes(String(input.currency))
}

function methodForCurrency(currency: ViaCheckoutOrderInput["currency"]) {
  if (currency === "EUR") return "fiat-eur" as const
  if (currency === "USD") return "fiat-usd" as const
  if (currency === "BTC") return "bitcoin" as const
  return "deso" as const
}

export async function POST(request: Request) {
  try {
    if (!checkoutOrderSigningReady()) {
      return NextResponse.json(
        { issued: false, reason: "order-signing-unavailable" },
        { status: 503, headers: noStore },
      )
    }

    const rawInput: unknown = await request.json()
    if (!isIssueCheckoutOrderRequest(rawInput)) {
      return NextResponse.json(
        { issued: false, reason: "invalid-request-shape" },
        { status: 400, headers: noStore },
      )
    }

    const serverInput: ViaCheckoutOrderInput = {
      orderId: randomUUID(),
      nftId: rawInput.nftId.trim(),
      sellerPublicKey: rawInput.sellerPublicKey.trim(),
      buyerPublicKey: rawInput.buyerPublicKey?.trim(),
      amountMinor: rawInput.amountMinor,
      currency: rawInput.currency,
    }

    const validation = validateCheckoutOrderForAttempt(serverInput)
    if (!validation.valid) {
      return NextResponse.json(
        { issued: false, reason: validation.reason ?? "invalid-order" },
        { status: 400, headers: noStore },
      )
    }

    const method = methodForCurrency(serverInput.currency)
    const readiness = currentPaymentReadiness()
    const methodState = readiness.methods.find((item) => item.method === method)
    if (!methodState?.released || !methodState.actionable) {
      return NextResponse.json(
        { issued: false, reason: method === "deso" ? "deso-not-released" : "payment-method-unavailable" },
        { status: 409, headers: noStore },
      )
    }

    const order = createCheckoutOrder(serverInput)
    if (!order) {
      return NextResponse.json(
        { issued: false, reason: "invalid-order" },
        { status: 400, headers: noStore },
      )
    }

    const signature = signCheckoutOrder(order)
    if (!signature) {
      return NextResponse.json(
        { issued: false, reason: "order-signing-unavailable" },
        { status: 503, headers: noStore },
      )
    }

    return NextResponse.json(
      { issued: true, order, signature },
      { status: 200, headers: noStore },
    )
  } catch {
    return NextResponse.json(
      { issued: false, reason: "invalid-request" },
      { status: 400, headers: noStore },
    )
  }
}
