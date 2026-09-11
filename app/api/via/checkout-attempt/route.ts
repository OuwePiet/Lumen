import { NextResponse } from "next/server"
import {
  validateCheckoutAttemptInput,
  type ViaCheckoutAttemptInput,
} from "../../../../lib/via/checkout-attempt-foundation"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Partial<ViaCheckoutAttemptInput>
    const valid = validateCheckoutAttemptInput(input as ViaCheckoutAttemptInput)

    return NextResponse.json(
      { valid },
      { status: valid ? 200 : 400, headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { valid: false },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }
}
