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

    const input = (await request.json()) as IssueCheckoutOrderRequest
    const serverInput: ViaCheckoutOrderInput = {
      orderId: randomUUID(),
      nftId: input.nftId,
      sellerPublicKey: input.sellerPublicKey,
      buyerPublicKey: input.buyerPublicKey,
      amountMinor: input.amountMinor,
      currency: input.currency,
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
