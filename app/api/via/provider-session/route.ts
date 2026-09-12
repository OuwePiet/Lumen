import { NextResponse } from "next/server"
import { evaluateCheckoutHandoffEligibility } from "../../../../lib/via/checkout-handoff-eligibility"
import { currentPaymentReadiness } from "../../../../lib/via/payment-readiness-server"
import { createProviderSessionDraft } from "../../../../lib/via/provider-session-boundary"
import { validateProviderSessionPreflightInput } from "../../../../lib/via/provider-session-preflight-validation"
import { verifyCheckoutAttemptSignature } from "../../../../lib/via/checkout-attempt-signing"
import type { ViaCheckoutOrder } from "../../../../lib/via/checkout-order-boundary"
import type { ViaCheckoutAttempt } from "../../../../lib/via/checkout-attempt-foundation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type ProviderSessionPreflightRequest = {
  order: ViaCheckoutOrder
  attempt: ViaCheckoutAttempt
  attemptSignature: string
}

const noStore = { "Cache-Control": "no-store" }

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ProviderSessionPreflightRequest
    if (!input?.order || !input?.attempt || !input?.attemptSignature) {
      return NextResponse.json(
        { eligible: false, reason: "invalid-request" },
        { status: 400, headers: noStore },
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
