import { getNFTsForUser } from "../../app/deso-nfts"

export type ViaDeSoListingEvidence = {
  nftId: string
  sellerPublicKey: string
  forSale: boolean
  copiesObserved: number
  copiesForSale: number
  buyNowPricesNanos: number[]
  minBidAmountsNanos: number[]
}

export async function resolveDeSoListingEvidence(input: {
  nftId: string
  sellerPublicKey: string
}): Promise<ViaDeSoListingEvidence | null> {
  const nftId = input.nftId.toLowerCase()
  const collections = await getNFTsForUser(input.sellerPublicKey)
  const collection = collections.find(
    (item) => item.PostEntryResponse?.PostHashHex === nftId,
  )

  if (!collection) return null

  const entries = collection.NFTEntryResponses ?? []
  const forSaleEntries = entries.filter((entry) => entry.IsForSale === true)
  const buyNowPricesNanos = forSaleEntries
    .map((entry) => entry.BuyNowPriceNanos)
    .filter((value): value is number => Number.isFinite(value) && value! >= 0)
  const minBidAmountsNanos = forSaleEntries
    .map((entry) => entry.MinBidAmountNanos)
    .filter((value): value is number => Number.isFinite(value) && value! >= 0)

  return {
    nftId,
    sellerPublicKey: input.sellerPublicKey,
    forSale: forSaleEntries.length > 0,
    copiesObserved: entries.length,
    copiesForSale: forSaleEntries.length,
    buyNowPricesNanos,
    minBidAmountsNanos,
  }
}
