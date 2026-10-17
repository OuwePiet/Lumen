"use client"

import { useEffect, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "./deso-identity-modern"

/** Shared account for current and future VIA pages. Never starts a login. */
export function useViaIdentitySession() {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  useEffect(() => viaModernIdentity.subscribe(setSession), [])
  return session
}
