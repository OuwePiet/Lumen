"use client"

import { useEffect, useMemo, useState } from "react"
import { restoreIdentitySession } from "../deso-identity-session"

type IdeaItem = {
  category?: string
  idea?: string
  createdAt?: string
  status?: string
}

type HealthData = {
  checkedAt?: string
  via?: { status?: string }
  deso?: { status?: string; latencyMs?: number }
}

type DeSoHealthData = {
  ok?: boolean
  checkedAt?: string
  activeEndpoint?: string | null
  nodes?: Array<{ endpoint?: string; role?: string; ok?: boolean; latencyMs?: number }>
}

type LiveStatus = {
  loading: boolean
  via: "OK" | "DEGRADED" | "UNKNOWN"
  deso: "OK" | "DEGRADED" | "FAILED" | "UNKNOWN"
  latencyMs: number | null
  activeEndpoint: string | null
  checkedAt: string | null
}

const initialLiveStatus: LiveStatus = {
  loading: true,
  via: "UNKNOWN",
  deso: "UNKNOWN",
  latencyMs: null,
  activeEndpoint: null,
  checkedAt: null,
}

const roundItems = [
  { label: "Ideeënbus + tekstvlak boven de wereldbol", state: "done" as const },
  { label: "Wereldklok: dag bij datum + balk hoger", state: "done" as const },
  { label: "Meer verticale ruimte tussen stadsblokken", state: "done" as const },
  { label: "Externe opslag-ingang voor bezoekers en communityleden", state: "done" as const },
  { label: "VIA AURA CARD in Wallet en creatorprofiel", state: "done" as const },
  { label: "Origineel blauw DeSo-vinkje + Follow/Unfollow behouden", state: "done" as const },
  { label: "Publieke ingang = read-only; verborgen bij DeSo-login", state: "done" as const },
  { label: "Persoonlijke VIA Beheer-ingang alleen voor @OuwePiet", state: "done" as const },
  { label: "Echte DeSo-profielavatar als headerfallback", state: "done" as const },
  { label: "Centrale Ideeënbus-ontvangst van andere apparaten/bezoekers", state: "attention" as const },
  { label: "Betrouwbare totaalteller bezoekers", state: "deferred" as const },
]

function readLocalIdeas(): IdeaItem[] {
  try {
    const raw = localStorage.getItem("via:ideas:drafts:v1")
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item): item is IdeaItem => typeof item === "object" && item !== null) : []
  } catch {
    return []
  }
}

function statusTone(value: string) {
  if (value === "OK" || value === "done") return { border: "#285f40", color: "#9adbb2", background: "rgba(12,35,22,.6)" }
  if (value === "attention" || value === "DEGRADED") return { border: "#735f2d", color: "#e1c879", background: "rgba(48,39,12,.45)" }
  if (value === "FAILED") return { border: "#773838", color: "#e6a6a6", background: "rgba(54,16,16,.45)" }
  return { border: "#343b37", color: "#8f9a94", background: "rgba(12,16,14,.55)" }
}

function statusLabel(value: string) {
  if (value === "done") return "Afgerond"
  if (value === "attention") return "Aandacht"
  if (value === "deferred") return "Bewust later"
  return value
}

export default function OwnerDashboard({ ownerPublicKey }: { ownerPublicKey: string | null }) {
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [live, setLive] = useState<LiveStatus>(initialLiveStatus)

  useEffect(() => {
    const session = restoreIdentitySession()
    setSessionKey(session?.publicKey ?? null)
    setIdeas(readLocalIdeas())
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function refreshHealth() {
      try {
        const [healthResponse, nodeResponse] = await Promise.all([
          fetch("/api/via/health", { cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } }),
          fetch("/api/via/deso-health", { cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } }),
        ])

        const health = healthResponse.ok ? await healthResponse.json() as HealthData : null
        const nodeHealth = nodeResponse.ok ? await nodeResponse.json() as DeSoHealthData : null
        if (!active) return

        const desoStatus = health?.deso?.status === "OK"
          ? "OK"
          : health?.deso?.status === "FAILED"
            ? "FAILED"
            : health?.deso?.status === "DEGRADED"
              ? "DEGRADED"
              : nodeHealth?.ok
                ? "OK"
                : "UNKNOWN"

        setLive({
          loading: false,
          via: health?.via?.status === "OK" ? "OK" : healthResponse.ok ? "DEGRADED" : "UNKNOWN",
          deso: desoStatus,
          latencyMs: typeof health?.deso?.latencyMs === "number" ? health.deso.latencyMs : null,
          activeEndpoint: typeof nodeHealth?.activeEndpoint === "string" ? nodeHealth.activeEndpoint : null,
          checkedAt: health?.checkedAt || nodeHealth?.checkedAt || new Date().toISOString(),
        })
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return
        setLive({ ...initialLiveStatus, loading: false })
      }
    }

    void refreshHealth()
    const timer = window.setInterval(refreshHealth, 60_000)
    return () => {
      active = false
      controller.abort()
      window.clearInterval(timer)
    }
  }, [])

  const isOwner = Boolean(ownerPublicKey && sessionKey && ownerPublicKey === sessionKey)
  const sortedIdeas = useMemo(() => [...ideas].sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))), [ideas])

  if (!ownerPublicKey) {
    return <Panel title="Owner verification unavailable" text="VIA could not verify the @OuwePiet owner key from DeSo right now. No private controls are shown." />
  }

  if (!sessionKey) {
    return <Panel title="Owner login required" text="Log in with the @OuwePiet DeSo account before opening this personal control room." />
  }

  if (!isOwner) {
    return <Panel title="Private owner area" text="This page is reserved for the verified @OuwePiet DeSo account." />
  }

  const viaTone = statusTone(live.via)
  const desoTone = statusTone(live.deso)

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <p style={eyebrowStyle}>Live status</p>
            <h2 style={{ margin: "5px 0 0", fontSize: 24 }}>VIA achter de schermen</h2>
          </div>
          <span style={pillStyle}>{live.loading ? "Controleren…" : live.checkedAt ? `Bijgewerkt ${formatTime(live.checkedAt)}` : "Status onbekend"}</span>
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 11 }}>
          <StatusCard title="VIA applicatie" value={live.via} detail="Live healthcheck van de VIA-applicatie." tone={viaTone} />
          <StatusCard title="DeSo verbinding" value={live.deso} detail={live.latencyMs !== null ? `${live.latencyMs} ms responstijd` : "Live DeSo-bereikbaarheid."} tone={desoTone} />
          <StatusCard title="Actieve DeSo-node" value={live.activeEndpoint ? "ACTIEF" : "ONBEKEND"} detail={live.activeEndpoint ?? "Nog geen actief endpoint bevestigd."} tone={statusTone(live.activeEndpoint ? "OK" : "UNKNOWN")} />
        </div>
      </section>

      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <p style={eyebrowStyle}>Deze opknapronde</p>
            <h2 style={{ margin: "5px 0 0", fontSize: 24 }}>Afgehandeld / nog aandacht</h2>
          </div>
          <span style={pillStyle}>{roundItems.filter((item) => item.state === "done").length} afgerond</span>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {roundItems.map((item) => {
            const tone = statusTone(item.state)
            return (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: "1px solid rgba(143,212,169,.12)", borderRadius: 12, padding: "10px 12px", background: "rgba(1,6,3,.5)" }}>
                <span style={{ color: "#dfe7e2", fontSize: 12, lineHeight: 1.45 }}>{item.label}</span>
                <span style={{ flexShrink: 0, border: `1px solid ${tone.border}`, color: tone.color, background: tone.background, borderRadius: 999, padding: "5px 8px", fontSize: 9, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>{statusLabel(item.state)}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <p style={eyebrowStyle}>Ideas Inbox</p>
            <h2 style={{ margin: "5px 0 0", fontSize: 24 }}>Binnengekomen ideeën</h2>
          </div>
          <span style={pillStyle}>{sortedIdeas.length} lokaal {sortedIdeas.length === 1 ? "item" : "items"}</span>
        </div>

        <p style={{ color: "#aebbb4", lineHeight: 1.6, marginBottom: 18 }}>
          Op dit moment zie je hier alleen ideeën die in deze browser zijn opgeslagen. Centrale ontvangst van ideeën van andere bezoekers/apparaten is nog niet aangesloten en staat hierboven daarom bewust op Aandacht.
        </p>

        {sortedIdeas.length === 0 ? (
          <div style={emptyStyle}>Nog geen ideeën op dit apparaat opgeslagen.</div>
        ) : (
          <div style={{ display: "grid", gap: 11 }}>
            {sortedIdeas.map((item, index) => (
              <article key={`${item.createdAt ?? "idea"}-${index}`} style={ideaStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ color: "#b9ffd4", fontSize: 12 }}>{item.category || "Other"}</strong>
                  <span style={{ color: "#7f8b85", fontSize: 10 }}>{formatDate(item.createdAt)}</span>
                </div>
                <p style={{ margin: "9px 0 0", color: "#e5ebe7", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{item.idea || "—"}</p>
                <div style={{ marginTop: 10 }}><span style={statusStyle}>{item.status || "Received"}</span></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatusCard({ title, value, detail, tone }: { title: string; value: string; detail: string; tone: { border: string; color: string; background: string } }) {
  return (
    <article style={{ border: "1px solid rgba(143,212,169,.14)", borderRadius: 14, padding: 14, background: "rgba(1,6,3,.62)" }}>
      <span style={{ color: "#87938d", fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</span>
      <div style={{ marginTop: 7 }}>
        <span style={{ display: "inline-flex", border: `1px solid ${tone.border}`, color: tone.color, background: tone.background, borderRadius: 999, padding: "5px 8px", fontSize: 10, fontWeight: 800 }}>{value}</span>
      </div>
      <p style={{ margin: "9px 0 0", color: "#aebbb4", fontSize: 11, lineHeight: 1.5, overflowWrap: "anywhere" }}>{detail}</p>
    </article>
  )
}

function Panel({ title, text }: { title: string; text: string }) {
  return (
    <section style={panelStyle}>
      <p style={eyebrowStyle}>VIA · OWNER</p>
      <h2 style={{ margin: "5px 0 8px", fontSize: 24 }}>{title}</h2>
      <p style={{ margin: 0, color: "#aebbb4", lineHeight: 1.6 }}>{text}</p>
    </section>
  )
}

function formatDate(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString()
}

function formatTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

const panelStyle = {
  border: "1px solid rgba(143,212,169,.24)",
  borderRadius: 20,
  background: "linear-gradient(145deg, rgba(7,17,11,.92), rgba(3,8,5,.96))",
  padding: 20,
  boxShadow: "0 18px 50px rgba(0,0,0,.22)",
} as const

const eyebrowStyle = { margin: 0, color: "#8fd4a9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" as const }
const pillStyle = { border: "1px solid #285f40", borderRadius: 999, padding: "7px 10px", color: "#9adbb2", fontSize: 10, fontWeight: 700 }
const emptyStyle = { border: "1px dashed rgba(143,212,169,.22)", borderRadius: 14, padding: 18, color: "#7f8b85", fontSize: 12 }
const ideaStyle = { border: "1px solid rgba(143,212,169,.15)", borderRadius: 14, background: "rgba(1,6,3,.68)", padding: 14 }
const statusStyle = { display: "inline-flex", border: "1px solid rgba(143,212,169,.22)", borderRadius: 999, padding: "5px 8px", color: "#8fd4a9", fontSize: 9, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" as const }
