"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  persistIdentityLogin,
  restoreIdentitySession,
  type ViaIdentitySession,
} from "./deso-identity-session"

type PublicProfile = {
  username?: string
  profilePic?: string | null
}

type ProfileResponse = {
  ok?: boolean
  profile?: PublicProfile
}

const nav = [
  ["Home", "/"],
  ["Social", "/social"],
  ["Discover", "/discover"],
  ["NFTs", "/collection"],
  ["Market", "/market"],
  ["Studio", "/studio"],
  ["Live", "/live"],
  ["Communities", "/communities"],
  ["My VIA", "/my-via"],
] as const

function safeProfileImage(value?: string | null) {
  if (!value) return undefined
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" ? parsed.toString() : undefined
  } catch {
    return undefined
  }
}

export default function ViaSiteHeader() {
  const pathname = usePathname()
  const identityWindowRef = useRef<Window | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [status, setStatus] = useState<"idle" | "waiting" | "blocked">("idle")

  useEffect(() => {
    setSession(restoreIdentitySession())

    function handleIdentityMessage(event: MessageEvent) {
      const identityWindow = identityWindowRef.current
      if (identityWindow && event.source !== identityWindow) return
      const nextSession = persistIdentityLogin(event)
      if (!nextSession) return
      setSession(nextSession)
      setStatus("idle")
      identityWindowRef.current?.close()
      identityWindowRef.current = null
    }

    window.addEventListener("message", handleIdentityMessage)
    return () => window.removeEventListener("message", handleIdentityMessage)
  }, [])

  useEffect(() => {
    if (!session?.publicKey) {
      setProfile(null)
      return
    }
    const controller = new AbortController()
    void fetch(`/api/via/profile?identity=${encodeURIComponent(session.publicKey)}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null
        const data = (await response.json()) as ProfileResponse
        return data.ok && data.profile ? data.profile : null
      })
      .then((nextProfile) => setProfile(nextProfile))
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setProfile(null)
      })
    return () => controller.abort()
  }, [session?.publicKey])

  function openDeSoIdentity() {
    const width = Math.min(800, window.screen.availWidth)
    const height = Math.min(900, window.screen.availHeight)
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)
    const identityWindow = window.open(
      DESO_LOGIN_URL,
      "via-deso-identity",
      `popup=yes,width=${Math.round(width)},height=${Math.round(height)},left=${Math.round(left)},top=${Math.round(top)}`,
    )
    if (!identityWindow) {
      setStatus("blocked")
      return
    }
    identityWindowRef.current = identityWindow
    setStatus("waiting")
    identityWindow.focus()
  }

  const avatar = safeProfileImage(profile?.profilePic)
  const accountLabel = profile?.username ? `@${profile.username}` : session ? "DeSo connected" : "Login"

  return (
    <header className="via-site-header">
      <div className="via-site-header__inner">
        <Link href="/" className="via-site-brand" aria-label="VIA home">
          <img src="/via-logo.svg" alt="VIA" className="via-site-brand__logo" />
          <span className="via-site-brand__domain">viadeso.online</span>
        </Link>

        <nav className="via-site-nav" aria-label="VIA main navigation">
          {nav.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link key={href} href={href} className={active ? "via-site-nav__link is-active" : "via-site-nav__link"}>
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="via-site-account">
          <button type="button" className="via-site-account__button" onClick={openDeSoIdentity} aria-label={session ? "Change DeSo account" : "Login with DeSo"}>
            {avatar ? <img src={avatar} alt="" className="via-site-account__avatar" referrerPolicy="no-referrer" /> : <span className="via-site-account__avatar via-site-account__avatar--fallback" aria-hidden="true">{profile?.username?.slice(0, 1).toUpperCase() ?? "V"}</span>}
            <span>{status === "waiting" ? "Connecting…" : accountLabel}</span>
          </button>
          {status === "blocked" ? <span className="via-site-account__status" role="status">Allow pop-ups to log in.</span> : null}
        </div>
      </div>
    </header>
  )
}
