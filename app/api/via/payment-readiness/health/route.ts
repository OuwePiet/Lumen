import { NextResponse } from "next/server"
import { currentPaymentReadiness } from "../../../../../lib/via/payment-readiness-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const readiness = currentPaymentReadiness()

  return NextResponse.json(
    {
      service: "via-payment-readiness",
      healthy: true,
      routes: {
        fiat: readiness.fiatOperational ? "ready" : "not-ready",
        bitcoin: readiness.bitcoinOperational ? "ready" : "not-ready",
        deso: readiness.desoOperational ? "ready" : "not-released",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
