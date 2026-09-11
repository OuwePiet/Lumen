import Link from "next/link"

export default function ViaPaymentAvailabilityLink() {
  return (
    <Link
      href="/payments"
      style={{
        display: "inline-block",
        color: "#9adbb2",
        fontSize: 13,
        textDecoration: "none",
        border: "1px solid rgba(143,212,169,.28)",
        borderRadius: 10,
        padding: "9px 12px",
      }}
    >
      Payment availability
    </Link>
  )
}
