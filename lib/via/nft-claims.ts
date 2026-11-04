export type NFTClaimReservation = { publicKey: string; serialNumber: number; operationId: string; requestedAt: number }
export type NFTGiveaway = {
  version: 1; id: string; ownerPublicKey: string; postHash: string; title: string
  serialNumbers: number[]; startsAt: number; endsAt: number; perAccount: number
  requirement: "free"; claims: NFTClaimReservation[]
}
const key = (value: unknown): value is string => typeof value === "string" && /^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(value)
const hash = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value)
const positive = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0
export function parseNFTGiveaway(value: unknown): NFTGiveaway | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const data = value as NFTGiveaway
  if (data.version !== 1 || !hash(data.id) || !hash(data.postHash) || !key(data.ownerPublicKey) || typeof data.title !== "string" || !data.title.trim() || data.title.length > 120 ||
    !positive(data.startsAt) || !positive(data.endsAt) || data.endsAt <= data.startsAt || !positive(data.perAccount) || data.perAccount > 50 || data.requirement !== "free" ||
    !Array.isArray(data.serialNumbers) || data.serialNumbers.length < 1 || data.serialNumbers.length > 50 || !data.serialNumbers.every(positive) || new Set(data.serialNumbers).size !== data.serialNumbers.length ||
    !Array.isArray(data.claims) || data.claims.length > data.serialNumbers.length) return null
  const serials = new Set<number>(), operations = new Set<string>(), counts = new Map<string, number>()
  for (const claim of data.claims) {
    if (!claim || !key(claim.publicKey) || !hash(claim.operationId) || !positive(claim.requestedAt) || !data.serialNumbers.includes(claim.serialNumber) || serials.has(claim.serialNumber) || operations.has(claim.operationId)) return null
    serials.add(claim.serialNumber); operations.add(claim.operationId)
    const count = (counts.get(claim.publicKey) ?? 0) + 1
    if (count > data.perAccount) return null
    counts.set(claim.publicKey, count)
  }
  return { version: 1, id: data.id, ownerPublicKey: data.ownerPublicKey, postHash: data.postHash, title: data.title.trim(), serialNumbers: [...data.serialNumbers], startsAt: data.startsAt, endsAt: data.endsAt, perAccount: data.perAccount, requirement: "free", claims: data.claims.map(claim => ({ publicKey: claim.publicKey, serialNumber: claim.serialNumber, operationId: claim.operationId, requestedAt: claim.requestedAt })) }
}

export function reserveNFTClaim(campaign: NFTGiveaway, publicKey: string, operationId: string, availableSerials: number[], now: number): NFTGiveaway {
  if (!parseNFTGiveaway(campaign) || !key(publicKey) || !hash(operationId) || !positive(now)) throw new Error("INVALID_CLAIM")
  const previous = campaign.claims.find(claim => claim.operationId === operationId)
  if (previous) {
    if (previous.publicKey !== publicKey) throw new Error("CLAIM_OPERATION_ACCOUNT_MISMATCH")
    return campaign // Readback of the same request; never allocate another edition.
  }
  if (publicKey === campaign.ownerPublicKey) throw new Error("CLAIM_OWNER_CANNOT_CLAIM")
  if (now < campaign.startsAt) throw new Error("CLAIM_NOT_STARTED")
  if (now >= campaign.endsAt) throw new Error("CLAIM_ENDED")
  if (campaign.claims.filter(claim => claim.publicKey === publicKey).length >= campaign.perAccount) throw new Error("CLAIM_LIMIT_REACHED")
  const reserved = new Set(campaign.claims.map(claim => claim.serialNumber))
  const serialNumber = campaign.serialNumbers.find(serial => availableSerials.includes(serial) && !reserved.has(serial))
  if (serialNumber === undefined) throw new Error("CLAIM_STOCK_UNAVAILABLE")
  return { ...campaign, claims: [...campaign.claims, { publicKey, operationId, serialNumber, requestedAt: now }] }
}
