import { NextResponse } from "next/server"
import { validateCheckoutOrderForAttempt } from "../../../../lib/via/checkout-order-validation"
import type { ViaCheckoutOrderInput } from "../../../../lib/via/checkout-order-boundary"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ViaCheckoutOrderInput
    const result = validateCheckoutOrderForAttempt(input)
    return NextResponse.json(result, {
      status: result.valid ? 200 : 400,
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json(
      { valid: false, reason: "invalid-request" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }
}
