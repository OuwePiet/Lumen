"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function PublicAccountLabel({ publicKey }: { publicKey: string }) {
  const [profile, setProfile] = useState<{ key: string; name: string; image: string | null } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/via/profile?identity=" + encodeURIComponent(publicKey) + "&compact=1", { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (!controller.signal.aborted && data?.ok && data.profile?.username) setProfile({ key: publicKey, name: data.profile.username, image: typeof data.profile.profilePic === "string" && data.profile.profilePic.startsWith("https://") ? data.profile.profilePic : null }) })
      .catch(() => {})
    return () => controller.abort()
  }, [publicKey])
  const current = profile?.key === publicKey ? profile : null
  return <Link href={"/profile/" + encodeURIComponent(publicKey)} className="inline-flex min-w-0 items-center gap-2 text-sm text-[#9adbb2]" title={publicKey}>
    {current?.image ? <img src={current.image} alt="" width={28} height={28} className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" /> : null}
    <span className="truncate">{current ? "@" + current.name : publicKey.slice(0, 8) + "…" + publicKey.slice(-5)}</span>
  </Link>
}
