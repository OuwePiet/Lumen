"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { viaModernIdentity } from "../deso-identity-modern"

export default function MarketIdentityRedirect() {
  const router = useRouter()

  useEffect(() => {
    const openActiveAccount = (publicKey?: string) => {
      if (publicKey) router.replace("/market?publicKey=" + encodeURIComponent(publicKey))
    }

    void viaModernIdentity.currentUser().then((user) => openActiveAccount(user?.publicKey))
    const unsubscribe = viaModernIdentity.subscribe((user) => openActiveAccount(user?.publicKey))
    return unsubscribe
  }, [router])

  return null
}
