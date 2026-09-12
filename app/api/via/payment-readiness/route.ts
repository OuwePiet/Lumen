import { NextResponse } from "next/server"
import { currentPaymentReadiness } from "../../../../lib/via/payment-readiness-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const { methods } = currentPaymentReadiness()

  return NextResponse.json(
    {
      methods: methods.map(({ method, released, operational, actionable, priority }) => ({
        method,
        released,
        operational,
        actionable,
        checkoutEnabled:
          actionable && (method === "fiat-eur" || method === "fiat-usd"),
        priority,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
