"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "../deso-identity-session"

export default function MarketIdentityRedirect() {
  const router = useRouter()

  useEffect(() => {
    const openActiveAccount = () => {
      const publicKey = restoreIdentitySession()?.publicKey
      if (publicKey) router.replace("/market?publicKey=" + encodeURIComponent(publicKey))
    }
    openActiveAccount()
    window.addEventListener(VIA_IDENTITY_EVENT, openActiveAccount)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, openActiveAccount)
  }, [router])

  return null
}
