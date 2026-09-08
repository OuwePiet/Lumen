import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DESO_NODE = (process.env.DESO_NODE || "https://node.deso.org").replace(/\/$/, "")

async function checkDeSo() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)
  const started = Date.now()
  try {
    const response = await fetch(`${DESO_NODE}/api/v0/get-app-state`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
      cache: "no-store",
      signal: controller.signal,
    })
    return {
      status: response.ok ? "OK" : "DEGRADED",
      httpStatus: response.status,
      latencyMs: Date.now() - started,
    }
  } catch (error) {
    return {
      status: "FAILED",
      latencyMs: Date.now() - started,
      error: error instanceof Error && error.name === "AbortError" ? "timeout" : "network",
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const deso = await checkDeSo()
  return NextResponse.json(
    {
      checkedAt: new Date().toISOString(),
      via: { status: "OK" },
      deso,
      mediaUpload: { status: "UNKNOWN", reason: "No verified VIA upload provider check configured yet." },
      mediaRetrieval: { status: "UNKNOWN", reason: "No single authoritative media gateway represents all VIA media yet." },
    },
    { headers: { "cache-control": "no-store, max-age=0" } },
  )
}
