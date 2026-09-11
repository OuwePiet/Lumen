export type ViaEditionIdentity = {
  postHashHex: string
  serialNumber: number
  totalCopies: number
  displayLabel: string
}

export function buildEditionIdentity(input: {
  postHashHex: string
  serialNumber: number
  totalCopies: number
}): ViaEditionIdentity | null {
  const postHashHex = input.postHashHex.trim().toLowerCase()
  const serialNumber = Math.floor(input.serialNumber)
  const totalCopies = Math.floor(input.totalCopies)

  if (!postHashHex || serialNumber < 1 || totalCopies < 1 || serialNumber > totalCopies) {
    return null
  }

  return {
    postHashHex,
    serialNumber,
    totalCopies,
    displayLabel:
      totalCopies === 1
        ? "1 of 1"
        : `Edition #${serialNumber} of ${totalCopies}`,
  }
}

export function sameEdition(
  a: Pick<ViaEditionIdentity, "postHashHex" | "serialNumber">,
  b: Pick<ViaEditionIdentity, "postHashHex" | "serialNumber">
) {
  return (
    a.postHashHex.toLowerCase() === b.postHashHex.toLowerCase() &&
    a.serialNumber === b.serialNumber
  )
}

/**
 * VIA identifies a DeSo NFT edition by PostHash + SerialNumber. The friendly
 * edition label never replaces those blockchain identifiers.
 */
