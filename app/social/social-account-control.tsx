"use client"

import { useEffect, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"

function shortKey(publicKey: string) {
  return publicKey.length > 20 ? `${publicKey.slice(0, 10)}…${publicKey.slice(-6)}` : publicKey
}

export default function SocialAccountControl() {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [open, setOpen] = useState(false)

  async function sync() {
    setSession(await viaModernIdentity.currentUser())
  }

  useEffect(() => {
    void sync()
  }, [])

  async function addAccount() {
    const next = await viaModernIdentity.login()
    setSession(next)
    setOpen(false)
  }

  async function choose(publicKey: string) {
    await viaModernIdentity.setActiveUser(publicKey)
    await sync()
    setOpen(false)
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300">
        Account{session ? ` · ${shortKey(session.publicKey)}` : ""}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 min-w-64 overflow-hidden rounded-xl border border-zinc-800 bg-[#050806] shadow-xl">
          {session ? <div className="border-b border-zinc-800 px-3 py-2 text-xs text-[#9adbb2]">Actief · {shortKey(session.publicKey)}</div> : <div className="border-b border-zinc-800 px-3 py-2 text-xs text-zinc-500">Geen actief DeSo-account</div>}
          {session ? (
            <button type="button" onClick={() => void choose(session.publicKey)} className="block w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.04]">
              Actief DeSo-account · {shortKey(session.publicKey)}
            </button>
          ) : null}
          <button type="button" onClick={() => void addAccount()} className="block w-full border-t border-zinc-800 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.04]">DeSo-account toevoegen / wisselen</button>
          <button type="button" onClick={() => setOpen(false)} className="block w-full border-t border-zinc-800 px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/[0.04]">Sluiten</button>
        </div>
      ) : null}
    </div>
  )
}
