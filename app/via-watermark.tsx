export default function ViaWatermark() {
  return (
    <img
      src="/via-watermark.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        position: "absolute",
        right: "4%",
        bottom: "4%",
        width: "22%",
        maxWidth: "92px",
        height: "auto",
        opacity: 0.16,
        pointerEvents: "none",
        userSelect: "none",
        objectFit: "contain",
      }}
    />
  )
}
