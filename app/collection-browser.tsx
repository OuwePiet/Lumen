"use client"

import { useState, type ReactNode } from "react"
import AccountLookup from "./account-lookup"

const styles = {
  back: {
    background: "transparent",
    border: "1px solid #285f40",
    borderRadius: "999px",
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
    margin: "0 0 20px",
    padding: "9px 14px",
  },
}

export default function CollectionBrowser({
  children,
}: {
  children: ReactNode
}) {
  const [selectedAccount, setSelectedAccount] = useState(false)
  const [lookupKey, setLookupKey] = useState(0)

  const showDefaultCollection = () => {
    setSelectedAccount(false)
    setLookupKey((current) => current + 1)
    window.history.replaceState({}, "", window.location.pathname)
  }

  return (
    <>
      <AccountLookup
        key={lookupKey}
        onAccountSelected={() => setSelectedAccount(true)}
      />

      {selectedAccount ? (
        <button
          type="button"
          style={styles.back}
          onClick={showDefaultCollection}
        >
          Back to default @OuwePiet collection
        </button>
      ) : (
        children
      )}
    </>
  )
}
