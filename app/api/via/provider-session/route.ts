import { NextResponse } from "next/server"
import { evaluateCheckoutHandoffEligibility } from "../../../../lib/via/checkout-handoff-eligibility"
import { currentPaymentReadiness } from "../../../../lib/via/payment-readiness-server"
import { createProviderSessionDraft } from "../../../../lib/via/provider-session-boundary"
import type { ViaCheckoutOrder } from "../../../../lib/via/checkout-order-boundary"
import type { ViaCheckoutAttempt } from "../../../../lib/via/checkout-attempt-foundation"

export const dynamic = "force-dynamic"

type ProviderSessionPreflightRequest = {
  order: ViaCheckoutOrder
  attempt: ViaCheckoutAttempt
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ProviderSessionPreflightRequest
    if (!input?.order || !input?.attempt) {
      return NextResponse.json(
        { eligible: false, reason: "invalid-request" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
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
        headers: { "Cache-Control": "no-store" },
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
        { status: 409, headers: { "Cache-Control": "no-store" } },
      )
    }

    return NextResponse.json(
      { eligible: true, session: draft },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { eligible: false, reason: "invalid-request" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }
}
