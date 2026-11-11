import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
  // Use the same original logo file as the VIA homepage, without a network request.
  const logo = await readFile(join(process.cwd(), "public", "via-logo-original.jpg"))
  const src = `data:image/jpeg;base64,${logo.toString("base64")}`

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050807" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="VIA" width={176} height={116} style={{ objectFit: "contain" }} />
        <div style={{ color: "#ffffff", fontSize: 19, fontWeight: 800, letterSpacing: 0, marginTop: 5 }}>viadeso.online</div>
      </div>
    ),
    size,
  )
}
