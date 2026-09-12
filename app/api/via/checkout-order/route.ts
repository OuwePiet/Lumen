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

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const noStore = { "Cache-Control": "no-store" }

export async function POST(request: Request) {
  try {
    if (!checkoutOrderSigningReady()) {
      return NextResponse.json(
        { issued: false, reason: "order-signing-unavailable" },
        { status: 503, headers: noStore },
      )
    }

    const input = (await request.json()) as ViaCheckoutOrderInput
    const validation = validateCheckoutOrderForAttempt(input)
    if (!validation.valid) {
      return NextResponse.json(
        { issued: false, reason: validation.reason ?? "invalid-order" },
        { status: 400, headers: noStore },
      )
    }

    const order = createCheckoutOrder(input)
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
