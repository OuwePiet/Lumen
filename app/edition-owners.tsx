"use client"

import { useState } from "react"

type EditionOwner = {
  serialNumber: number
  owner: string
  publicKey?: string
}

function ownerCollectionHref(owner: string, publicKey: string) {
  const params = new URLSearchParams({
    account: owner.replace(/^@/, ""),
    accountKey: publicKey,
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
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 800,
  },
  list: {
    listStyle: "none",
    margin: "14px 0 0",
    padding: 0,
  },
  row: {
    alignItems: "center",
    borderTop: "1px solid #1b3327",
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px 16px",
    justifyContent: "space-between",
    padding: "10px 0",
  },
  owner: {
    color: "#f4f7f5",
    fontWeight: 700,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
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
    padding: "8px 12px",
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
        {visibleEditions.map((edition) => (
          <li key={edition.serialNumber} style={styles.row}>
            <span>Edition #{edition.serialNumber}</span>
            {edition.publicKey && edition.owner.startsWith("@") ? (
              <a
                href={ownerCollectionHref(
                  edition.owner,
                  edition.publicKey
                )}
                style={styles.owner}
              >
                {edition.owner}
              </a>
            ) : (
              <span>{edition.owner}</span>
            )}
          </li>
        ))}
      </ol>
      {remaining > 0 ? (
        <button
          type="button"
          style={styles.button}
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
