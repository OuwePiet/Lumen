"use client"

import { useState, type FormEvent } from "react"

const DESO_NODE = "https://node.deso.org"

type DeSoProfile = {
  Username?: string
  PublicKeyBase58Check?: string
}

function shortKey(publicKey?: string) {
  if (!publicKey) return "Public key unavailable"
  return `${publicKey.slice(0, 10)}...${publicKey.slice(-8)}`
}

const styles = {
  section: {
    background: "#0a100d",
    border: "1px solid #254233",
    borderRadius: "18px",
    marginBottom: "28px",
    padding: "20px",
  },
  heading: {
    color: "#b9ffd4",
    fontSize: "16px",
    margin: "0 0 8px",
  },
  text: {
    color: "#a9b8af",
    fontSize: "13px",
    lineHeight: 1.6,
    margin: "0 0 14px",
  },
  form: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "10px",
  },
  input: {
    flex: "1 1 260px",
    color: "#f4f7f5",
    background: "#050807",
    border: "1px solid #254233",
    borderRadius: "10px",
    fontSize: "14px",
    padding: "10px 12px",
  },
  button: {
    color: "#050807",
    background: "#5cff9d",
    border: "1px solid #5cff9d",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
    padding: "9px 14px",
  },
  result: {
    color: "#b9ffd4",
    background: "#10261a",
    border: "1px solid #285f40",
    borderRadius: "12px",
    marginTop: "14px",
    padding: "14px",
  },
  error: {
    color: "#f1d89a",
    background: "#211a0c",
    border: "1px solid #6e5721",
    borderRadius: "12px",
    marginTop: "14px",
    padding: "14px",
  },
  code: {
    display: "block",
    color: "#a9b8af",
    fontSize: "12px",
    marginTop: "6px",
    overflowWrap: "anywhere" as const,
  },
}

export default function AccountLookup() {
  const [username, setUsername] = useState("")
  const [profile, setProfile] = useState<DeSoProfile | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const findAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedUsername = username.trim().replace(/^@/, "")
    setProfile(null)
    setError("")

    if (!normalizedUsername) {
      setError("Enter a DeSo username.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${DESO_NODE}/api/v0/get-single-profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Username: normalizedUsername }),
        }
      )

      if (!response.ok) throw new Error("Profile request failed")

      const data = await response.json()
      const foundProfile: DeSoProfile =
        data.Profile ?? data.ProfileEntryResponse ?? {}

      if (!foundProfile.Username || !foundProfile.PublicKeyBase58Check) {
        setError("DeSo account not found.")
        return
      }

      setProfile(foundProfile)
    } catch {
      setError("The DeSo account could not be checked right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={styles.section} aria-labelledby="account-lookup-heading">
      <h2 id="account-lookup-heading" style={styles.heading}>
        Find DeSo account
      </h2>
      <p style={styles.text}>
        Read-only public profile check. No login, wallet connection or storage.
      </p>

      <form style={styles.form} onSubmit={findAccount}>
        <input
          type="search"
          aria-label="DeSo username"
          autoComplete="off"
          placeholder="Enter DeSo username"
          value={username}
          style={styles.input}
          onChange={(event) => setUsername(event.target.value)}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Checking…" : "Find DeSo account"}
        </button>
      </form>

      <div aria-live="polite">
        {profile ? (
          <div style={styles.result}>
            <strong>DeSo account found: @{profile.Username}</strong>
            <code style={styles.code}>
              {shortKey(profile.PublicKeyBase58Check)}
            </code>
          </div>
        ) : null}

        {error ? <div style={styles.error}>{error}</div> : null}
      </div>
    </section>
  )
}
