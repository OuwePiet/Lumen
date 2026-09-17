"use client"

import { useEffect, useState } from "react"
import { requestViaIdentityJwt } from "../deso-identity-jwt"
import { restoreIdentitySession } from "../deso-identity-session"

type IdeaItem = {
  category?: string
  idea?: string
  createdAt?: string
  status?: string
}

type IdeasResponse = {
  ok?: boolean
  configured?: boolean
  items?: IdeaItem[]
  error?: string
}

export default function CentralIdeasInbox({ ownerPublicKey }: { ownerPublicKey: string | null }) {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [items, setItems] = useState<IdeaItem[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let active = true
    void fetch("/api/via/ideas", { cache: "no-store", headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!active) return
        if (response.status === 401) {
          setConfigured(true)
          return
        }
        const data = await response.json().catch(() => null) as IdeasResponse | null
        setConfigured(data?.configured === true)
      })
      .catch(() => {
        if (active) setConfigured(false)
      })
    return () => { active = false }
  }, [])

  async function openInbox() {
    if (!ownerPublicKey) return
    const session = restoreIdentitySession()
    if (!session || session.publicKey !== ownerPublicKey) {
      setMessage("Log in with the verified @OuwePiet DeSo account first.")
      return
    }

    setBusy(true)
    setMessage("")
    try {
      const jwt = await requestViaIdentityJwt(ownerPublicKey)
      const response = await fetch("/api/via/ideas", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${jwt}`,
          "x-via-owner-public-key": ownerPublicKey,
        },
      })
      const data = await response.json().catch(() => null) as IdeasResponse | null
      if (!response.ok || !data?.ok) {
        setMessage(data?.error === "OWNER_AUTH_INVALID" ? "DeSo Identity verification was not accepted. Try again." : "Central Ideas Inbox is temporarily unavailable.")
        return
      }
      setConfigured(data.configured === true)
      setItems(Array.isArray(data.items) ? data.items : [])
      setMessage(data.configured ? "Central inbox updated." : "Central storage is not connected yet.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify the Owner session.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ marginTop: 18, border: "1px solid rgba(143,212,169,.24)", borderRadius: 20, background: "linear-gradient(145deg, rgba(7,17,11,.92), rgba(3,8,5,.96))", padding: 20, boxShadow: "0 18px 50px rgba(0,0,0,.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, color: "#8fd4a9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Secure Ideas Inbox</p>
          <h2 style={{ margin: "5px 0 0", fontSize: 24 }}>Centrale Ideeënbus</h2>
        </div>
        <span style={{ border: `1px solid ${configured ? "#285f40" : "#735f2d"}`, borderRadius: 999, padding: "7px 10px", color: configured ? "#9adbb2" : "#e1c879", fontSize: 10, fontWeight: 700 }}>
          {configured === null ? "Controleren…" : configured ? "Opslag gekoppeld" : "Opslag nog niet gekoppeld"}
        </span>
      </div>

      <p style={{ color: "#aebbb4", lineHeight: 1.6, margin: "14px 0" }}>
        Alleen het geverifieerde @OuwePiet DeSo-account kan de centrale inbox openen. De inhoud wordt pas opgehaald nadat DeSo Identity jouw korte, tijdelijke eigenaarstoken heeft bevestigd.
      </p>

      <button
        type="button"
        onClick={() => void openInbox()}
        disabled={busy || !ownerPublicKey}
        style={{ border: "1px solid #347d52", borderRadius: 999, padding: "10px 14px", background: "#0b1b11", color: "#b9ffd4", fontWeight: 800, cursor: busy ? "wait" : "pointer", opacity: busy ? .65 : 1 }}
      >
        {busy ? "Verifiëren…" : "Open / ververs centrale inbox"}
      </button>

      {message ? <p role="status" style={{ color: "#9adbb2", fontSize: 12, marginTop: 12 }}>{message}</p> : null}

      {items.length > 0 ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {items.map((item, index) => (
            <article key={`${item.createdAt ?? "idea"}-${index}`} style={{ border: "1px solid rgba(143,212,169,.15)", borderRadius: 14, background: "rgba(1,6,3,.68)", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ color: "#b9ffd4", fontSize: 12 }}>{item.category || "Other"}</strong>
                <span style={{ color: "#7f8b85", fontSize: 10 }}>{formatDate(item.createdAt)}</span>
              </div>
              <p style={{ margin: "9px 0 0", color: "#e5ebe7", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{item.idea || "—"}</p>
              <span style={{ display: "inline-flex", marginTop: 10, border: "1px solid #285f40", borderRadius: 999, padding: "5px 8px", color: "#9adbb2", fontSize: 9, fontWeight: 800 }}>{item.status || "Received"}</span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function formatDate(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString()
}
