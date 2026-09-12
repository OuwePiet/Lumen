import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import {
  createCheckoutAttempt,
  type ViaCheckoutAttemptInput,
} from "../../../../../lib/via/checkout-attempt-foundation"
import {
  checkoutAttemptSigningReady,
  signCheckoutAttempt,
} from "../../../../../lib/via/checkout-attempt-signing"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const noStore = { "Cache-Control": "no-store" }
const ATTEMPT_TTL_MS = 15 * 60 * 1000

type IssueAttemptRequest = Omit<ViaCheckoutAttemptInput, "createdAt" | "expiresAt">

export async function POST(request: Request) {
  try {
    if (!checkoutAttemptSigningReady()) {
      return NextResponse.json(
        { issued: false, reason: "attempt-signing-unavailable" },
        { status: 503, headers: noStore },
      )
    }

    const input = (await request.json()) as IssueAttemptRequest
    const createdAt = new Date()
    const attempt = createCheckoutAttempt(
      {
        orderId: input.orderId,
        amountMinor: input.amountMinor,
        currency: input.currency,
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
