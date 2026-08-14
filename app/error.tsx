"use client"

import { useEffect } from "react"

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#050807",
    color: "#f4f7f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "40px 20px",
  },
  panel: {
    width: "min(100%, 560px)",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "18px",
    padding: "28px",
  },
  brand: {
    color: "#5cff9d",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    margin: "0 0 12px",
    textTransform: "uppercase" as const,
  },
  heading: {
    fontSize: "clamp(26px, 5vw, 40px)",
    lineHeight: 1.1,
    margin: "0 0 14px",
  },
  message: {
    color: "#a9b8af",
    fontSize: "16px",
    lineHeight: 1.6,
    margin: "0 0 22px",
  },
  button: {
    appearance: "none" as const,
    color: "#050807",
    background: "#5cff9d",
    border: "1px solid #5cff9d",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 800,
    padding: "10px 16px",
  },
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main style={styles.page}>
      <section style={styles.panel} role="alert">
        <p style={styles.brand}>Lumen</p>
        <h1 style={styles.heading}>The collection could not be loaded.</h1>
        <p style={styles.message}>
          DeSo is temporarily unavailable or the connection was interrupted.
          Your collection has not been changed.
        </p>
        <button type="button" style={styles.button} onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  )
}
