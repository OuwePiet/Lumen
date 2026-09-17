"use client"

import { useEffect, useMemo, useState } from "react"
import { restoreIdentitySession } from "../deso-identity-session"

type IdeaItem = {
  category?: string
  idea?: string
  createdAt?: string
  status?: string
}

function readLocalIdeas(): IdeaItem[] {
  try {
    const raw = localStorage.getItem("via:ideas:drafts:v1")
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item): item is IdeaItem => typeof item === "object" && item !== null) : []
  } catch {
    return []
  }
}

export default function OwnerDashboard({ ownerPublicKey }: { ownerPublicKey: string | null }) {
  const [sessionKey, setSessionKey] = useState<string | null>(null)
  const [ideas, setIdeas] = useState<IdeaItem[]>([])

  useEffect(() => {
    const session = restoreIdentitySession()
    setSessionKey(session?.publicKey ?? null)
    setIdeas(readLocalIdeas())
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

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <p style={eyebrowStyle}>Ideas Inbox</p>
            <h2 style={{ margin: "5px 0 0", fontSize: 24 }}>Incoming ideas</h2>
          </div>
          <span style={pillStyle}>{sortedIdeas.length} local test {sortedIdeas.length === 1 ? "item" : "items"}</span>
        </div>

        <p style={{ color: "#aebbb4", lineHeight: 1.6, marginBottom: 18 }}>
          This inbox currently shows ideas saved through VIA on this browser. Central cross-device delivery is not yet active, so VIA does not present these as received from other visitors until a safe shared intake layer is connected.
        </p>

        {sortedIdeas.length === 0 ? (
          <div style={emptyStyle}>No ideas stored on this device yet.</div>
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

      <section style={panelStyle}>
        <p style={eyebrowStyle}>Owner workspace</p>
        <h2 style={{ margin: "5px 0 8px", fontSize: 22 }}>What happens / what still needs attention</h2>
        <p style={{ margin: 0, color: "#aebbb4", lineHeight: 1.6 }}>
          This private page is the base for the VIA owner overview. New control blocks are added here only when their data source is real and verified; no mock counters or pretend queues are shown.
        </p>
      </section>
    </div>
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
