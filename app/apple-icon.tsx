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
          borderRadius: 36,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            color: "#f4f7f5",
            fontSize: 78,
            fontWeight: 300,
            letterSpacing: 8,
            lineHeight: 1,
          }}
        >
          VIA
        </div>
        <div
          style={{
            position: "absolute",
            right: 28,
            bottom: 28,
            width: 54,
            height: 24,
            borderRadius: "60% 10% 60% 10%",
            background: "linear-gradient(135deg, #d9f4df, #8fd4a9 58%, #5f9d77)",
            transform: "rotate(-28deg)",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
