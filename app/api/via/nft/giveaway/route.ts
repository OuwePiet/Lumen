import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"
import { readNFTGiveaway, writeNFTGiveaway, nftClaimStorageConfigured } from "../../../../nft-claim-store"
import { parseNFTGiveaway, reserveNFTClaim } from "../../../../../lib/via/nft-claims"

export const dynamic = "force-dynamic"
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } })
async function readNode(endpoint: string, body: Record<string, unknown>) {
  const response = await fetchDeSo(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" })
  if (!response.ok) throw new Error("DESO_READ_UNAVAILABLE")
  return await response.json() as Record<string, unknown>
}
async function account(request: Request) {
  const publicKey = request.headers.get("x-via-public-key") ?? ""
  const auth = request.headers.get("authorization") ?? ""
  if (!/^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(publicKey) || !auth.startsWith("Bearer ") || auth.length > 16_000) throw new Error("CLAIM_AUTH_REQUIRED")
  await readNode("get-user-global-metadata", { UserPublicKeyBase58Check: publicKey, JWT: auth.slice(7) })
  return publicKey
}
async function ownerKey() {
  const data = await readNode("get-single-profile", { PublicKeyBase58Check: "", Username: "OuwePiet" })
  const key = (data.Profile as { PublicKeyBase58Check?: string } | undefined)?.PublicKeyBase58Check
  if (!key || !/^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(key)) throw new Error("GIVEAWAY_OWNER_UNAVAILABLE")
  return key
}
async function entries(postHash: string) {
  const result = await readNode("get-nft-entries-for-nft-post", { PostHashHex: postHash })
  if (!Array.isArray(result.NFTEntryResponses)) throw new Error("CLAIM_STOCK_UNAVAILABLE")
  return result.NFTEntryResponses as Array<{ SerialNumber?: number; OwnerPublicKeyBase58Check?: string; IsForSale?: boolean; IsPending?: boolean }>
}
export async function GET(request: Request) {
  if (!nftClaimStorageConfigured()) return json({ ok: false, configured: false, error: "GIVEAWAY_STORAGE_NOT_CONFIGURED" }, 503)
  const id = new URL(request.url).searchParams.get("id") ?? ""
  if (!/^[a-f0-9]{64}$/.test(id)) return json({ ok: false, error: "INVALID_GIVEAWAY_ID" }, 400)
  try {
    const record = await readNFTGiveaway(id)
    if (!record) return json({ ok: false, error: "GIVEAWAY_NOT_FOUND" }, 404)
    const campaign = record.data
    if (campaign.ownerPublicKey !== await ownerKey()) throw new Error("GIVEAWAY_OWNER_CHANGED")
    const current = await entries(campaign.postHash)
    // Public response never exposes the reservation list. JWT proves access to own requests or owner administration.
    let publicKey: string | null = null
    if (request.headers.has("authorization")) publicKey = await account(request)
    const visibleClaims = publicKey ? campaign.claims.filter(claim => publicKey === campaign.ownerPublicKey || claim.publicKey === publicKey).map(claim => {
      const entry = current.find(value => value.SerialNumber === claim.serialNumber)
      const state = entry?.OwnerPublicKeyBase58Check === claim.publicKey
        ? entry.IsPending ? "waiting-for-recipient" : "ownership-observed"
        : entry?.OwnerPublicKeyBase58Check === campaign.ownerPublicKey ? "waiting-for-owner" : "verification-required"
      return { ...claim, state }
    }) : []
    const reserved = new Set(campaign.claims.map(claim => claim.serialNumber))
    const available = current.filter(entry => campaign.serialNumbers.includes(entry.SerialNumber!) && !reserved.has(entry.SerialNumber!) && entry.OwnerPublicKeyBase58Check === campaign.ownerPublicKey && entry.IsForSale === false && entry.IsPending === false).length
    return json({ ok: true, campaign: { ...campaign, claims: undefined, reservedCount: campaign.claims.length, availableCount: available }, claims: visibleClaims, canManage: publicKey === campaign.ownerPublicKey })
  } catch { return json({ ok: false, error: "GIVEAWAY_READ_OR_AUTH_UNAVAILABLE" }, 503) }
}
export async function POST(request: Request) {
  if (!nftClaimStorageConfigured()) return json({ ok: false, configured: false, error: "GIVEAWAY_STORAGE_NOT_CONFIGURED" }, 503)
  let publicKey: string
  try { publicKey = await account(request) } catch { return json({ ok: false, error: "CLAIM_AUTH_REQUIRED" }, 403) }
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return json({ ok: false, error: "INVALID_GIVEAWAY_REQUEST" }, 400)
  let writeStarted = false
  try {
    const owner = await ownerKey()
    if (body.action === "create") {
      if (publicKey !== owner) return json({ ok: false, error: "GIVEAWAY_OWNER_ONLY" }, 403)
      if (typeof body.id !== "string" || !/^[a-f0-9]{64}$/.test(body.id)) return json({ ok: false, error: "INVALID_GIVEAWAY_ID" }, 400)
      const id = body.id
      const campaign = parseNFTGiveaway({ ...body.campaign as Record<string, unknown>, version: 1, id, ownerPublicKey: owner, claims: [] })
      if (!campaign) return json({ ok: false, error: "INVALID_FREE_GIVEAWAY", notApplied: true }, 400)
      const current = await entries(campaign.postHash)
      if (!campaign.serialNumbers.every(serial => current.some(entry => entry.SerialNumber === serial && entry.OwnerPublicKeyBase58Check === owner && entry.IsForSale === false && entry.IsPending === false))) return json({ ok: false, error: "GIVEAWAY_STOCK_CHANGED", notApplied: true }, 409)
      const source = await readNode("get-single-post", { PostHashHex: campaign.postHash, ReaderPublicKeyBase58Check: owner, FetchParents: false, CommentLimit: 0 })
      if ((source.PostFound as { HasUnlockable?: boolean } | undefined)?.HasUnlockable !== false) return json({ ok: false, error: "GIVEAWAY_UNLOCKABLE_UNSUPPORTED", notApplied: true }, 409)
      writeStarted = true
      await writeNFTGiveaway(campaign)
      return json({ ok: true, id }, 201)
    }
    if (body.action !== "reserve" || typeof body.id !== "string" || !/^[a-f0-9]{64}$/.test(body.id) || typeof body.operationId !== "string" || !/^[a-f0-9]{64}$/.test(body.operationId)) return json({ ok: false, error: "INVALID_CLAIM_REQUEST" }, 400)
    const record = await readNFTGiveaway(body.id)
    if (!record || record.data.ownerPublicKey !== owner) return json({ ok: false, error: "GIVEAWAY_UNAVAILABLE" }, 409)
    const current = await entries(record.data.postHash)
    const available = current.filter(entry => entry.OwnerPublicKeyBase58Check === owner && entry.IsForSale === false && entry.IsPending === false).map(entry => entry.SerialNumber!).filter(Number.isSafeInteger)
    const next = reserveNFTClaim(record.data, publicKey, body.operationId, available, Date.now())
    if (next !== record.data) { writeStarted = true; await writeNFTGiveaway(next, record.etag) }
    return json({ ok: true, state: "waiting-for-owner", claim: next.claims.find(claim => claim.operationId === body.operationId), financialTransaction: false })
  } catch (error) {
    // Conditional-write conflicts and timeouts are readback-only. Never automatically reallocate stock.
    return json({ ok: false, error: writeStarted ? "CLAIM_STATUS_UNCERTAIN_CHECK_EXISTING_REQUEST" : error instanceof Error && /^CLAIM_[A-Z_]+$/.test(error.message) ? error.message : "CLAIM_NOT_APPLIED", notApplied: !writeStarted, financialTransaction: false }, 409)
  }
}
