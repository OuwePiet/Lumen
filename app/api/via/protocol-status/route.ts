import { NextResponse } from "next/server"
import packageJson from "../../../../package.json"

export const dynamic = "force-dynamic"
const installed = packageJson.dependencies["deso-protocol"]
type Check = { status: "OK" | "REVIEW" | "UNKNOWN"; detail: string; source: string; checkedAt: string }

async function checkJson(url: string, init: RequestInit = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" })
    if (!response.ok) throw new Error("HTTP " + response.status)
    return await response.json() as Record<string, unknown>
  } finally { clearTimeout(timeout) }
}

export async function GET() {
  const checkedAt = new Date().toISOString()
  const [sdk, advisories, identity] = await Promise.allSettled([
    checkJson("https://registry.npmjs.org/deso-protocol/latest", { headers: { Accept: "application/json" } }),
    checkJson("https://api.osv.dev/v1/query", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package: { name: "deso-protocol", ecosystem: "npm" }, version: installed }),
    }),
    fetch("https://identity.deso.org", { method: "GET", cache: "no-store", signal: AbortSignal.timeout(5000), redirect: "manual" }),
  ])
  const published = sdk.status === "fulfilled" && typeof sdk.value.version === "string" && /^\d+\.\d+\.\d+/.test(sdk.value.version) ? sdk.value.version : null
  const sdkCheck: Check = {
    status: !published ? "UNKNOWN" : published === installed ? "OK" : "REVIEW",
    detail: !published ? "npm-versiebron niet bevestigd" : `VIA ${installed}; npm ${published}`,
    source: "https://registry.npmjs.org/deso-protocol/latest", checkedAt,
  }
  const vulnerabilities = advisories.status === "fulfilled" && Array.isArray(advisories.value.vulns) ? advisories.value.vulns : null
  const advisoryCheck: Check = {
    status: advisories.status !== "fulfilled" ? "UNKNOWN" : vulnerabilities?.length ? "REVIEW" : "OK",
    detail: advisories.status !== "fulfilled" ? "OSV-bron niet bereikbaar" : vulnerabilities?.length ? `${vulnerabilities.length} vermelding(en) voor SDK-versie: handmatig beoordelen` : "Geen vermelding in OSV voor deze npm-versie; geen volledige veiligheidsgarantie",
    source: "https://osv.dev", checkedAt,
  }
  const identityReachable = identity.status === "fulfilled" && identity.value.status >= 200 && identity.value.status < 500
  const identityCheck: Check = {
    status: identity.status !== "fulfilled" ? "UNKNOWN" : identityReachable ? "OK" : "REVIEW",
    detail: identity.status !== "fulfilled" ? "Identity-service niet bereikbaar" : `HTTP ${identity.value.status}; alleen bereikbaarheid, geen versie- of inlogtest`,
    source: "https://identity.deso.org", checkedAt,
  }
  const checks = { sdk: sdkCheck, advisories: advisoryCheck, identity: identityCheck }
  const values = Object.values(checks)
  const status = values.some((item) => item.status === "REVIEW") ? "REVIEW" : values.some((item) => item.status === "UNKNOWN") ? "UNKNOWN" : "CURRENT"
  return NextResponse.json({
    status, installed, published, checks, checkedAt,
    scope: "Automatische bronchecks: npm-versie, OSV-meldingen en Identity-bereikbaarheid. Geen blockchain-consensus-, protocolcompatibiliteits- of volledige beveiligingsaudit.",
  }, { headers: { "Cache-Control": "no-store" } })
}
