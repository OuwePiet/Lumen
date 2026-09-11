"use client"

import { useState } from "react"

type EditionOwner = {
  serialNumber: number
  owner: string
  publicKey?: string
}

function ownerCollectionHref(owner: string, publicKey: string) {
  const username = owner.replace(/^@/, "").trim().slice(0, 64)
  const safePublicKey = publicKey.trim().slice(0, 128)
  if (!username || !safePublicKey) return undefined

  const params = new URLSearchParams({
    account: username,
    accountKey: safePublicKey,
    view: "nfts",
  })

  return `/?${params.toString()}#account-lookup-heading`
}

const PAGE_SIZE = 25

const styles = {
  owners: {
    background: "#070b09",
    border: "1px solid #254233",
    borderRadius: "12px",
    marginTop: "20px",
    padding: "14px",
  },
  summary: {
    color: "#c4cec8",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 800,
    minHeight: "44px",
    padding: "11px 0",
  },
  list: {
    listStyle: "none",
    margin: "8px 0 0",
    padding: 0,
  },
  row: {
    alignItems: "center",
    borderTop: "1px solid #1b3327",
    display: "grid",
    gap: "6px 12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    padding: "12px 0",
  },
  owner: {
    color: "#f4f7f5",
    fontWeight: 700,
    overflowWrap: "anywhere" as const,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  fallbackOwner: {
    color: "#c4cec8",
    overflowWrap: "anywhere" as const,
  },
  button: {
    background: "transparent",
    border: "1px solid #285f40",
    borderRadius: "999px",
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
    marginTop: "12px",
    minHeight: "44px",
    padding: "8px 14px",
  },
  status: {
    color: "#84958b",
    fontSize: "12px",
    margin: "10px 0 0",
  },
}

export default function EditionOwners({
  editions,
}: {
  editions: EditionOwner[]
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visibleEditions = editions.slice(0, visibleCount)
  const remaining = editions.length - visibleEditions.length

  return (
    <details style={styles.owners}>
      <summary style={styles.summary}>
        View edition owners ({editions.length})
      </summary>
      <ol style={styles.list}>
        {visibleEditions.map((edition) => {
          const href =
            edition.publicKey && edition.owner.startsWith("@")
              ? ownerCollectionHref(edition.owner, edition.publicKey)
              : undefined

          return (
            <li key={edition.serialNumber} style={styles.row}>
              <span>{edition.label ?? `Edition #${edition.serialNumber}`}</span>
              {href ? (
                <a href={href} style={styles.owner}>
                  {edition.owner}
                </a>
              ) : (
                <span style={styles.fallbackOwner}>{edition.owner}</span>
              )}
            </li>
          )
        })}
      </ol>
      <p style={styles.status} aria-live="polite">
        Showing {visibleEditions.length} of {editions.length} editions.
      </p>
      {remaining > 0 ? (
        <button
          type="button"
          style={styles.button}
          aria-label={`Show ${Math.min(PAGE_SIZE, remaining)} more edition owners`}
          onClick={() =>
            setVisibleCount((current) =>
              Math.min(current + PAGE_SIZE, editions.length)
            )
          }
        >
          Show next {Math.min(PAGE_SIZE, remaining)}
        </button>
      ) : null}
    </details>
  )
}
