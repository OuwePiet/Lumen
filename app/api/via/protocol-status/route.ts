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
  const [sdk, advisories, identity, core, api] = await Promise.allSettled([
    checkJson("https://registry.npmjs.org/deso-protocol/latest", { headers: { Accept: "application/json" } }),
    checkJson("https://api.osv.dev/v1/query", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package: { name: "deso-protocol", ecosystem: "npm" }, version: installed }),
    }),
    fetch("https://identity.deso.org", { method: "GET", cache: "no-store", signal: AbortSignal.timeout(5000), redirect: "manual" }),
    checkJson("https://api.github.com/repos/deso-protocol/core/commits?per_page=1", { headers: { Accept: "application/vnd.github+json", "User-Agent": "VIA-protocol-monitor" } }),
    checkJson("https://node.deso.org/api/v0/get-app-state", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }),
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
  // Read-only source signal. A recent commit is NOT automatically a protocol change.
  const coreData = core.status === "fulfilled" ? core.value : null
  const coreItems = Array.isArray(coreData) ? coreData : null
  const latestCore = coreItems?.[0] as { sha?: unknown; commit?: { committer?: { date?: unknown } } } | undefined
  const coreSha = typeof latestCore?.sha === "string" ? latestCore.sha.slice(0, 12) : null
  const coreCheck: Check = {
    status: coreSha ? "OK" : "UNKNOWN",
    detail: coreSha ? `Laatste openbare core-commit: ${coreSha}. Wijzigingsimpact niet automatisch vastgesteld.` : "Core-repository niet bevestigd; geen consensusvalidatie",
    source: "https://github.com/deso-protocol/core", checkedAt,
  }
  // Validate an actual node API response shape without a wallet or login.
  const appStateValid = api.status === "fulfilled" && api.value !== null && typeof api.value === "object" && !Array.isArray(api.value) && Object.keys(api.value).length > 0
  const apiCheck: Check = {
    status: api.status !== "fulfilled" ? "UNKNOWN" : appStateValid ? "OK" : "REVIEW",
    detail: api.status !== "fulfilled" ? "DeSo get-app-state niet bereikbaar" : appStateValid ? "get-app-state antwoordt met JSON-object; geen volledige API-contracttest" : "Onverwachte get-app-state respons",
    source: "https://node.deso.org/api/v0/get-app-state", checkedAt,
  }
  const checks = { sdk: sdkCheck, advisories: advisoryCheck, identity: identityCheck, core: coreCheck, api: apiCheck }
  const values = Object.values(checks)
  const status = values.some((item) => item.status === "REVIEW") ? "REVIEW" : values.some((item) => item.status === "UNKNOWN") ? "UNKNOWN" : "CURRENT"
  return NextResponse.json({
    status, installed, published, checks, checkedAt,
    scope: "Automatische read-only bronchecks: npm, OSV, Identity-bereikbaarheid, core-repository en get-app-state. Geen consensusvalidatie, volledige API-compatibiliteit of beveiligingsaudit.",
  }, { headers: { "Cache-Control": "no-store" } })
}
