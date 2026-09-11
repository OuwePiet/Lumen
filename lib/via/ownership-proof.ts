type OwnershipEntry = {
  OwnerPublicKeyBase58Check?: unknown
  SerialNumber?: unknown
}

export type OwnershipProof = {
  ownsAnyEdition: boolean
  serialNumbers: number[]
}

/**
 * Pure read-only ownership check against NFT entries returned by DeSo.
 * This is intentionally not authentication: a public key can be inspected by anyone.
 */
export function verifyOwnershipFromEntries(
  publicKey: string,
  entries: OwnershipEntry[]
): OwnershipProof {
  if (!publicKey || publicKey.length > 128) {
    return { ownsAnyEdition: false, serialNumbers: [] }
  }

  const serialNumbers = entries
    .filter((entry) => entry.OwnerPublicKeyBase58Check === publicKey)
    .map((entry) =>
      typeof entry.SerialNumber === "number" &&
      Number.isInteger(entry.SerialNumber) &&
      entry.SerialNumber > 0
        ? entry.SerialNumber
        : undefined
    )
    .filter((serial): serial is number => serial !== undefined)
    .slice(0, 10_000)

  return {
    ownsAnyEdition: serialNumbers.length > 0,
    serialNumbers,
  }
}
