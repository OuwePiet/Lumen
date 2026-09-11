export type ViaMediaIntegrity = {
  url: string
  protocol: "ipfs" | "arweave" | "https" | "unknown"
  contentAddressed: boolean
  permanenceClaim: "not-verified" | "content-addressed"
}

export type ViaOwnershipRecord = {
  creatorPublicKey: string
  currentOwnerPublicKey?: string
  media: ViaMediaIntegrity[]
  license?: string
  royaltyBasisPoints?: number
  utility?: string[]
}

function mediaProtocol(url: string): ViaMediaIntegrity["protocol"] {
  if (/^ipfs:\/\//i.test(url)) return "ipfs"
  if (/^ar:\/\//i.test(url) || /arweave\.net\//i.test(url)) return "arweave"
  if (/^https:\/\//i.test(url)) return "https"
  return "unknown"
}

/**
 * VIA reports what can be verified from the reference itself. It never labels
 * ordinary HTTPS hosting as permanent and does not turn a storage reference
 * into a legal ownership or copyright claim.
 */
export function inspectMediaIntegrity(urls: string[]): ViaMediaIntegrity[] {
  return urls.slice(0, 16).map((url) => {
    const protocol = mediaProtocol(url)
    const contentAddressed = protocol === "ipfs" || protocol === "arweave"
    return {
      url,
      protocol,
      contentAddressed,
      permanenceClaim: contentAddressed ? "content-addressed" : "not-verified",
    }
  })
}

export function buildOwnershipRecord(input: ViaOwnershipRecord): ViaOwnershipRecord {
  return {
    creatorPublicKey: input.creatorPublicKey,
    currentOwnerPublicKey: input.currentOwnerPublicKey,
    media: input.media.slice(0, 16),
    license: input.license?.slice(0, 500),
    royaltyBasisPoints: Number.isFinite(input.royaltyBasisPoints) ? input.royaltyBasisPoints : undefined,
    utility: input.utility?.slice(0, 16),
  }
}
