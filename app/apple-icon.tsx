import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050807",
        }}
      >
        <img
          src="https://viadeso.online/via-leaf.svg"
          alt=""
          width="150"
          height="138"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
