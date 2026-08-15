"use client"

import { useState, type ReactNode } from "react"
import AccountLookup from "./account-lookup"

export default function CollectionBrowser({
  children,
}: {
  children: ReactNode
}) {
  const [selectedAccount, setSelectedAccount] = useState(false)

  return (
    <>
      <AccountLookup onAccountSelected={() => setSelectedAccount(true)} />
      {selectedAccount ? null : children}
    </>
  )
}
