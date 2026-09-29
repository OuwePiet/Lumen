"use client"

import { useEffect, useRef, useState } from "react"
import {
  DESO_LOGIN_URL,
  clearIdentitySession,
  VIA_IDENTITY_EVENT,
  listIdentitySessions,
  persistIdentityLogin,
  restoreIdentitySession,
  switchIdentitySession,
  type ViaIdentitySession,
} from "../deso-identity-session"

function shortKey(publicKey: string) {
  return publicKey.length > 20 ? `${publicKey.slice(0, 10)}…${publicKey.slice(-6)}` : publicKey
}

export default function SocialAccountControl() {
  const identityWindowRef = useRef<Window | null>(null)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [accounts, setAccounts] = useState<ViaIdentitySession[]>([])
  const [open, setOpen] = useState(false)

  function sync() {
    setSession(restoreIdentitySession())
    setAccounts(listIdentitySessions())
  }

  useEffect(() => {
    sync()
    const onIdentity = () => sync()
    const onMessage = (event: MessageEvent) => {
      const identityWindow = identityWindowRef.current
      if (identityWindow && event.source !== identityWindow) return
      const next = persistIdentityLogin(event)
      if (!next) return
      identityWindowRef.current?.close()
      identityWindowRef.current = null
      sync()
      setOpen(false)
    }
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
      window.removeEventListener("message", onMessage)
    }
  }, [])

  function addAccount() {
    const popup = window.open(DESO_LOGIN_URL, "via-postoffice-deso-login", "popup=yes,width=800,height=900")
    if (popup) identityWindowRef.current = popup
  }

  function choose(publicKey: string) {
    if (!switchIdentitySession(publicKey)) return
    sync()
    setOpen(false)
  }

  function logout() {
    clearIdentitySession()
    sync()
    setOpen(false)
  }

  const others = accounts.filter((account) => account.publicKey !== session?.publicKey)

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300">
        Account{session ? ` · ${shortKey(session.publicKey)}` : ""}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 min-w-64 overflow-hidden rounded-xl border border-zinc-800 bg-[#050806] shadow-xl">
          {session ? <div className="border-b border-zinc-800 px-3 py-2 text-xs text-[#9adbb2]">Actief · {shortKey(session.publicKey)}</div> : <div className="border-b border-zinc-800 px-3 py-2 text-xs text-zinc-500">Geen actief DeSo-account</div>}
          {others.map((account) => (
            <button key={account.publicKey} type="button" onClick={() => choose(account.publicKey)} className="block w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.04]">
              Wissel · {shortKey(account.publicKey)}
            </button>
          ))}
          <button type="button" onClick={addAccount} className="block w-full border-t border-zinc-800 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.04]">DeSo-account toevoegen</button>
          {session ? <button type="button" onClick={logout} className="block w-full border-t border-zinc-800 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.04]">Uitloggen</button> : null}
          <button type="button" onClick={() => setOpen(false)} className="block w-full border-t border-zinc-800 px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/[0.04]">Sluiten</button>
        </div>
      ) : null}
    </div>
  )
}
