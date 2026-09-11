import { NextResponse } from "next/server"
import { currentPaymentReadiness } from "../../../../lib/via/payment-readiness-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const readiness = currentPaymentReadiness()

  return NextResponse.json(
    {
      methods: readiness.methods.map(({ method, actionable, priority }) => ({
        method,
        actionable,
        priority,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
