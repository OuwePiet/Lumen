import { NextResponse } from "next/server"
import packageJson from "../../../../package.json"

export const dynamic = "force-dynamic"
const installed = packageJson.dependencies["deso-protocol"]

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)
  try {
    const response = await fetch("https://registry.npmjs.org/deso-protocol/latest", {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    })
    if (!response.ok) throw new Error("REGISTRY_UNAVAILABLE")
    const data = await response.json() as { version?: unknown }
    if (typeof data.version !== "string" || !/^\d+\.\d+\.\d+/.test(data.version)) throw new Error("INVALID_VERSION")
    return NextResponse.json({
      status: installed === data.version ? "CURRENT" : "REVIEW",
      installed, published: data.version,
      scope: "npm SDK-versievergelijking; geen blockchain-, Identity-service- of beveiligingsaudit",
      checkedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({
      status: "UNKNOWN", installed, published: null,
      scope: "npm-versiebron niet bereikbaar; geen protocolvalidatie",
      checkedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } })
  } finally { clearTimeout(timeout) }
}
