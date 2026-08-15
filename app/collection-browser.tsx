"use client"

import { useCallback, useState, type ReactNode } from "react"
import AccountLookup from "./account-lookup"

export default function CollectionBrowser({
  children,
  initialAccount,
}: {
  children: ReactNode
  initialAccount?: string
}) {
  const [selectedAccount, setSelectedAccount] = useState(
    Boolean(initialAccount)
  )
  const selectAccount = useCallback(() => setSelectedAccount(true), [])

  return (
    <>
      <AccountLookup onAccountSelected={selectAccount} />
      {selectedAccount ? null : children}
    </>
  )
}
