"use client"

import { useEffect, useState } from "react"
import MintMediaStep from "./mint-media-step"
import MintPreflight from "./mint-preflight"
import MintPreflightLocalizer from "./mint-preflight-localizer"

const NFT_TERMS_VERSION = "1.0"
const NFT_TERMS_STORAGE_KEY = `via:nft-terms:${NFT_TERMS_VERSION}`

export default function MintFlow() {
  const [postHash, setPostHash] = useState("")
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null)

  useEffect(() => {
    setTermsAccepted(window.localStorage.getItem(NFT_TERMS_STORAGE_KEY) === "accepted")
  }, [])

  function acceptTerms() {
    window.localStorage.setItem(NFT_TERMS_STORAGE_KEY, "accepted")
    setTermsAccepted(true)
  }

  if (termsAccepted === null) return null

  if (!termsAccepted) {
    return (
      <>
        <MintPreflightLocalizer />
        <section className="rounded-xl border border-zinc-800 bg-black/20 p-5" aria-labelledby="via-nft-terms-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">VIA NFT Terms · v{NFT_TERMS_VERSION}</p>
          <h2 id="via-nft-terms-heading" className="mt-2 text-xl font-semibold">Before your first VIA NFT mint</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Review the VIA NFT terms before starting an active mint. Browsing VIA remains available without accepting these terms.
          </p>
          <label className="mt-5 flex items-start gap-3 text-sm text-zinc-300">
            <input type="checkbox" id="via-nft-terms-confirmation" className="mt-1" />
            <span>I have read and accept the VIA NFT Terms v{NFT_TERMS_VERSION}.</span>
          </label>
          <button
            type="button"
            className="mt-5 rounded-lg border border-[#285f40] px-4 py-2 text-sm font-semibold text-[#9adbb2]"
            onClick={() => {
              const checkbox = document.getElementById("via-nft-terms-confirmation") as HTMLInputElement | null
              if (checkbox?.checked) acceptTerms()
            }}
          >
            Continue to Mint
          </button>
        </section>
      </>
    )
  }

  return (
    <>
      <MintPreflightLocalizer />
      <MintMediaStep onPostHash={setPostHash} />
      <MintPreflight initialPostHash={postHash} />
    </>
  )
}
