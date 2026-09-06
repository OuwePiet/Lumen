"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { fetchDeSo } from "./deso-api"
import PublicAccountNFTs from "./public-account-nfts"

type DeSoProfile = {
  Username?: string
  PublicKeyBase58Check?: string
  ProfilePic?: string
  Description?: string
}

function shortKey(publicKey?: string) {
  if (!publicKey) return "Public key unavailable"
  return `${publicKey.slice(0, 10)}...${publicKey.slice(-8)}`
}

const styles = {
  section: { background: "#0a100d", border: "1px solid #254233", borderRadius: "18px", marginBottom: "28px", padding: "20px" },
  heading: { color: "#b9ffd4", fontSize: "16px", margin: "0 0 8px" },
  text: { color: "#a9b8af", fontSize: "13px", lineHeight: 1.6, margin: "0 0 14px" },
  form: { display: "flex", flexWrap: "wrap" as const, gap: "10px" },
  input: { flex: "1 1 260px", color: "#f4f7f5", background: "#050807", border: "1px solid #254233", borderRadius: "10px", fontSize: "14px", padding: "10px 12px" },
  button: { color: "#050807", background: "#5cff9d", border: "1px solid #5cff9d", borderRadius: "999px", cursor: "pointer", fontSize: "13px", fontWeight: 800, padding: "9px 14px" },
  result: { color: "#b9ffd4", background: "#10261a", border: "1px solid #285f40", borderRadius: "12px", marginTop: "14px", padding: "14px" },
  error: { color: "#f1d89a", background: "#211a0c", border: "1px solid #6e5721", borderRadius: "12px", marginTop: "14px", padding: "14px" },
  code: { display: "block", color: "#a9b8af", fontSize: "12px", marginTop: "6px", overflowWrap: "anywhere" as const },
  profileHeader: { alignItems: "center", display: "flex", gap: "12px" },
  profileText: { minWidth: 0 },
  description: { color: "#d5e2da", fontSize: "13px", lineHeight: 1.55, margin: "12px 0 0", whiteSpace: "pre-wrap" as const },
  keyDetails: { color: "#a9b8af", fontSize: "12px", marginTop: "12px" },
  keySummary: { color: "#b9ffd4", cursor: "pointer", fontWeight: 700 },
  choices: { background: "#07100b", border: "1px solid #285f40", borderRadius: "12px", listStyle: "none", margin: "14px 0 0", padding: "8px" },
  choiceButton: { alignItems: "center", background: "transparent", border: 0, borderRadius: "9px", color: "#b9ffd4", cursor: "pointer", display: "flex", gap: "10px", padding: "10px", textAlign: "left" as const, width: "100%" },
  avatar: { borderRadius: "50%", height: "36px", objectFit: "cover" as const, width: "36px" },
  avatarFallback: { alignItems: "center", background: "#254233", borderRadius: "50%", color: "#b9ffd4", display: "flex", fontWeight: 800, height: "36px", justifyContent: "center", width: "36px" },
}

export default function AccountLookup({ onAccountSelected }: { onAccountSelected?: () => void }) {
  const [username, setUsername] = useState("")
  const [profile, setProfile] = useState<DeSoProfile | null>(null)
  const [matches, setMatches] = useState<DeSoProfile[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [autoLoadNFTs, setAutoLoadNFTs] = useState(false)

  const rememberSelectedAccount = (selectedProfile: DeSoProfile, openNFTs = false) => {
    if (typeof window === "undefined" || !selectedProfile.Username) return
    const params = new URLSearchParams({ account: selectedProfile.Username })
    if (openNFTs) params.set("view", "nfts")
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}#account-lookup-heading`)
  }

  const selectProfile = (selectedProfile: DeSoProfile) => {
    rememberSelectedAccount(selectedProfile)
    setUsername(selectedProfile.Username ?? "")
    setProfile(selectedProfile)
    onAccountSelected?.()
    setMatches([])
    setError("")
  }

  const lookupAccount = useCallback(async (requestedUsername: string, expectedPublicKey?: string, openNFTs = false) => {
    const normalizedUsername = requestedUsername.trim().replace(/^@/, "")
    setUsername(normalizedUsername)
    setProfile(null)
    setMatches([])
    setError("")
    if (!normalizedUsername) { setError("Enter a DeSo username."); return }
    setLoading(true)
    try {
      const response = await fetchDeSo("get-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UsernamePrefix: normalizedUsername, NumToFetch: 25, ReaderPublicKeyBase58Check: "" }),
      })
      if (!response.ok) { setError("The DeSo account could not be checked right now."); return }
      const data = await response.json()
      const profiles: DeSoProfile[] = data.ProfilesFound ?? data.Profiles ?? []
      const usableProfiles = profiles.filter((candidate) => candidate.Username && candidate.PublicKeyBase58Check)
      const exactProfile = usableProfiles.find((candidate) => candidate.Username?.toLocaleLowerCase() === normalizedUsername.toLocaleLowerCase())
      if (exactProfile) {
        if (expectedPublicKey && exactProfile.PublicKeyBase58Check !== expectedPublicKey) {
          setError("This VIA link contains an account key that does not match the DeSo profile. Nothing was loaded.")
          return
        }
        rememberSelectedAccount(exactProfile, openNFTs)
        setProfile(exactProfile)
        setAutoLoadNFTs(openNFTs)
        onAccountSelected?.()
        return
      }
      if (expectedPublicKey) { setError("The VIA account link could not be verified against DeSo. Nothing was loaded."); return }
      if (usableProfiles.length === 0) { setError("DeSo account not found."); return }
      setMatches(usableProfiles.slice(0, 10))
    } catch { setError("The DeSo account could not be checked right now.") }
    finally { setLoading(false) }
  }, [onAccountSelected])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedAccount = params.get("account")
    const requestedPublicKey = params.get("accountKey") ?? undefined
    const shouldOpenNFTs = params.get("view") === "nfts"
    setAutoLoadNFTs(shouldOpenNFTs)
    if (requestedAccount) void lookupAccount(requestedAccount, requestedPublicKey, shouldOpenNFTs)
  }, [lookupAccount])

  const findAccount = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void lookupAccount(username) }

  return (
    <section style={styles.section} aria-labelledby="account-lookup-heading">
      <h2 id="account-lookup-heading" style={styles.heading}>Find DeSo account</h2>
      <p style={styles.text}>Read-only public profile check. No login, wallet connection or storage.</p>
      <form style={styles.form} onSubmit={findAccount}>
        <input type="search" aria-label="DeSo username" autoComplete="off" placeholder="Enter DeSo username" value={username} style={styles.input} onChange={(event) => setUsername(event.target.value)} />
        <button type="submit" disabled={loading} style={styles.button}>{loading ? "Checking…" : "Find DeSo account"}</button>
      </form>
      <div aria-live="polite">
        {profile ? (
          <div style={styles.result}>
            <div style={styles.profileHeader}>
              {profile.ProfilePic ? <img src={profile.ProfilePic} alt="" width={52} height={52} style={{ ...styles.avatar, height: "52px", width: "52px" }} /> : <span style={{ ...styles.avatarFallback, height: "52px", width: "52px" }} aria-hidden="true">{(profile.Username ?? "?").slice(0, 1).toUpperCase()}</span>}
              <div style={styles.profileText}><strong>DeSo account found: @{profile.Username}</strong><code style={styles.code}>{shortKey(profile.PublicKeyBase58Check)}</code></div>
            </div>
            {profile.Description ? <p style={styles.description}>{profile.Description}</p> : null}
            <details style={styles.keyDetails}><summary style={styles.keySummary}>View full public key</summary><code style={styles.code}>{profile.PublicKeyBase58Check}</code></details>
            <PublicAccountNFTs key={profile.PublicKeyBase58Check} publicKey={profile.PublicKeyBase58Check!} username={profile.Username!} autoLoad={autoLoadNFTs} />
          </div>
        ) : null}
        {matches.length > 0 ? (
          <ul style={styles.choices} aria-label="Matching DeSo accounts">
            {matches.map((candidate) => <li key={candidate.PublicKeyBase58Check}><button type="button" style={styles.choiceButton} onClick={() => selectProfile(candidate)}>{candidate.ProfilePic ? <img src={candidate.ProfilePic} alt="" width={36} height={36} style={styles.avatar} /> : <span style={styles.avatarFallback} aria-hidden="true">{(candidate.Username ?? "?").slice(0, 1).toUpperCase()}</span>}<span><strong>@{candidate.Username}</strong><code style={styles.code}>{shortKey(candidate.PublicKeyBase58Check)}</code></span></button></li>)}
          </ul>
        ) : null}
        {error ? <div style={styles.error}>{error}</div> : null}
      </div>
    </section>
  )
}
