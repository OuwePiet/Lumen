"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  publicKey: string
  username: string
}

export default function ProfileActionMenu({ publicKey, username }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  async function copyPublicKey() {
    try {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`More actions for @${username}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-full border border-zinc-700 text-lg text-zinc-300 transition hover:border-[#8fd4a9]/55 hover:text-[#9adbb2]"
      >
        ⋯
      </button>

      {open ? (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-[12px] border border-zinc-700 bg-[#0a0d0b] p-1 shadow-2xl">
          <button
            type="button"
            role="menuitem"
            onClick={() => void copyPublicKey()}
            className="flex w-full items-center justify-between rounded-[9px] px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-900"
          >
            <span>Copy public key</span>
            <span className="text-xs text-zinc-500">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
