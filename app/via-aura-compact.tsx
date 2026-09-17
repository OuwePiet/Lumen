"use client"

import Link from "next/link"

type ViaAuraCompactProps = {
  publicKey: string
  username: string
  profilePic: string | null
  isVerified: boolean
  valueLabel: string
}

function initial(username: string) {
  return username.trim().slice(0, 1).toUpperCase() || "V"
}

export default function ViaAuraCompact({
  publicKey,
  username,
  profilePic,
  isVerified,
  valueLabel,
}: ViaAuraCompactProps) {
  const displayName = username ? `@${username}` : `${publicKey.slice(0, 10)}…${publicKey.slice(-6)}`

  return (
    <article className="group flex min-w-0 flex-1 items-center gap-3 rounded-[13px] border border-zinc-800/80 bg-black/20 px-3 py-3 transition-[border-color,background-color] hover:border-[#8fd4a9]/40 hover:bg-[#0b1510]/40">
      <Link
        href={`/profile/${encodeURIComponent(publicKey)}`}
        className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/25"
        aria-label={`Open ${displayName} profile`}
      >
        {profilePic ? (
          <img
            src={profilePic}
            alt=""
            referrerPolicy="no-referrer"
            className="h-11 w-11 rounded-full border border-[#8fd4a9]/25 object-cover"
          />
        ) : (
          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#8fd4a9]/25 bg-[#112019] text-sm font-semibold text-[#9adbb2]">
            {initial(username)}
          </span>
        )}
        <span
          aria-label="Active"
          title="Active creator holding"
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#050807] bg-[#8fd4a9]"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${encodeURIComponent(publicKey)}`}
          className="block truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-[#b9ffd4]"
        >
          {displayName}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-[#8fd4a9]/25 bg-[#0c1711]/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9adbb2]">Creator</span>
          {isVerified ? (
            <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300">✓ DeSo</span>
          ) : (
            <span className="rounded-full border border-zinc-700/80 px-2 py-0.5 text-[10px] text-zinc-500">DeSo</span>
          )}
          <span className="rounded-full border border-[#8fd4a9]/30 bg-[#0c1711]/35 px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-[#8fd4a9]">VIA</span>
          <span className="text-[10px] text-zinc-500">Active</span>
        </div>
      </div>

      <span className="shrink-0 text-right text-sm font-medium text-zinc-300">{valueLabel}</span>
    </article>
  )
}
