"use client"

import { useEffect, useState } from "react"

export default function ViaHomeEarth() {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    async function loadEarth() {
      try {
        const response = await fetch("/via-earth-home.webp", { cache: "no-store" })
        if (!response.ok) throw new Error(`Earth asset ${response.status}`)

        let encoded = (await response.text()).trim()
        if (encoded.startsWith('"') && encoded.endsWith('"')) {
          encoded = JSON.parse(encoded)
        }
        encoded = encoded.replace(/\s+/g, "")

        const binary = atob(encoded)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)

        const blob = new Blob([bytes], { type: "image/webp" })
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setSrc(objectUrl)
      } catch (error) {
        console.error("VIA Earth background failed to decode", error)
      }
    }

    loadEarth()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  return (
    <div aria-hidden="true" className="via-earth-review">
      {src ? <img src={src} alt="" className="via-earth-image" /> : null}
      <style jsx>{`
        .via-earth-review {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: #010403;
        }

        .via-earth-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }
      `}</style>
    </div>
  )
}
