"use client"

import { useEffect, useState } from "react"
import { viaModernIdentity } from "./deso-identity-modern"
import { restoreIdentitySession, type ViaIdentitySession } from "./deso-identity-session"

export function useViaIdentitySession() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  useEffect(() => {
    setSession(restoreIdentitySession())
    return viaModernIdentity.subscribe(() => setSession(restoreIdentitySession()))
  }, [])
  return session
}
