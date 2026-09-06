import { fetchDeSo } from "./deso-api"

export type DeSoNFTPost = {
  PostHashHex?: string
  Body?: string
  ImageURLs?: string[]
  VideoURLs?: string[]
  NumNFTCopies?: number
  ProfileEntryResponse?: { Username?: string }
}

export type DeSoNFTEntry = {
  IsForSale?: boolean
  BuyNowPriceNanos?: number
  MinBidAmountNanos?: number
}

export type DeSoNFTCollection = {
  PostEntryResponse?: DeSoNFTPost
  NFTEntryResponses?: DeSoNFTEntry[]
}

/**
 * Read a user's public NFT map using only the documented request fields for
 * DeSo's get-nfts-for-user endpoint. Do not add cursor/limit fields unless
 * they are verified against the currently deployed DeSo API contract.
 */
export async function getNFTsForUser(publicKey: string) {
  const response = await fetchDeSo("get-nfts-for-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserPublicKeyBase58Check: publicKey,
      ReaderPublicKeyBase58Check: "",
    }),
  })

  if (!response.ok) {
    throw new Error("DESO_NFT_COLLECTION_UNAVAILABLE")
  }

  const data = await response.json()
  const values = Object.values(data.NFTsMap ?? {})

  return values.filter((value): value is DeSoNFTCollection => {
    if (!value || typeof value !== "object") return false
    const collection = value as DeSoNFTCollection
    return typeof collection.PostEntryResponse?.PostHashHex === "string"
  })
}
