import { NextResponse } from "next/server"

const DEFAULT_DESO_NODE = "https://node.deso.org"
const TIMEOUT_MS = 4_000

function normalizedNodeUrl(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === "https:" ? url.origin : null
  } catch {
    return null
  }
}

const NODES = Array.from(new Set([
  normalizedNodeUrl(process.env.NEXT_PUBLIC_DESO_NODE),
  normalizedNodeUrl(process.env.DESO_NODE),
  DEFAULT_DESO_NODE,
].filter((node): node is string => Boolean(node)))).slice(0, 8)

async function probe(endpoint: string, role: "primary" | "fallback") {
  const started = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${endpoint}/api/v0/get-exchange-rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      cache: "no-store",
      signal: controller.signal,
    })

    return {
      endpoint,
      role,
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - started,
    }
  } catch {
    return {
      endpoint,
      role,
      ok: false,
      status: null,
      latencyMs: Date.now() - started,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export const dynamic = "force-dynamic"

export async function GET() {
  const checkedAt = new Date().toISOString()
  const nodes = await Promise.all(
    NODES.map((endpoint, index) => probe(endpoint, index === 0 ? "primary" : "fallback"))
  )
  const healthy = nodes.filter((node) => node.ok)
  const primary = nodes.find((node) => node.role === "primary" && node.ok)
  const active = primary ?? healthy.sort((a, b) => a.latencyMs - b.latencyMs)[0]

  return NextResponse.json({
    ok: healthy.length > 0,
    checkedAt,
    activeEndpoint: active?.endpoint ?? null,
    nodes,
    note: "Operational reachability only; this is not a consensus or trust guarantee.",
  }, {
    status: healthy.length > 0 ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  })
}
