import { fetchDeSo } from "./deso-api"
import type { NFTCollectionManifest } from "../lib/via/nft-collection-manifest"

/** Referenced posts must actually be NFTs; curating them does not establish ownership. */
export async function assertNFTCollectionItems(manifest: NFTCollectionManifest) {
  let nextIndex = 0
  const checkNext = async () => {
    while (nextIndex < manifest.items.length) {
      const hash = manifest.items[nextIndex++]
      const response = await fetchDeSo("get-single-post", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ PostHashHex: hash, ReaderPublicKeyBase58Check: "", FetchParents: false, CommentLimit: 0 }) })
      if (!response.ok) throw new Error("NFT_COLLECTION_ITEM_UNAVAILABLE")
      const data = await response.json() as { PostFound?: { PostHashHex?: string; IsNFT?: boolean; IsHidden?: boolean } }
      if (data.PostFound?.PostHashHex?.toLowerCase() !== hash || data.PostFound.IsNFT !== true || data.PostFound.IsHidden !== false) throw new Error("NFT_COLLECTION_ITEM_INVALID")
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, manifest.items.length) }, checkNext))
}
