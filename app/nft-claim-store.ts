import { get, put } from "@vercel/blob"
import { parseNFTGiveaway, type NFTGiveaway } from "../lib/via/nft-claims"

const pathname = (id: string) => {
  if (!/^[a-f0-9]{64}$/.test(id)) throw new Error("INVALID_GIVEAWAY_ID")
  return `via-nft-giveaways/v1/${id}.json`
}
export function nftClaimStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim() || (process.env.BLOB_STORE_ID?.trim() && process.env.VERCEL_OIDC_TOKEN?.trim()))
}
export async function readNFTGiveaway(id: string) {
  const result = await get(pathname(id), { access: "private", useCache: false })
  if (!result) return null
  if (result.statusCode !== 200 || result.blob.size > 32_000) throw new Error("GIVEAWAY_READ_UNCERTAIN")
  const data = parseNFTGiveaway(await new Response(result.stream).json())
  if (!data || data.id !== id) throw new Error("GIVEAWAY_RECORD_INVALID")
  return { data, etag: result.blob.etag }
}
/** One conditional write commits stock and per-account limits together. No blind retry. */
export async function writeNFTGiveaway(data: NFTGiveaway, etag?: string) {
  if (!parseNFTGiveaway(data) || (etag !== undefined && !etag)) throw new Error("INVALID_GIVEAWAY_RECORD")
  await put(pathname(data.id), JSON.stringify(data), { access: "private", addRandomSuffix: false, allowOverwrite: etag !== undefined, ...(etag ? { ifMatch: etag } : {}), contentType: "application/json" })
}
