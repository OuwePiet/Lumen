import type { ViaNftRecord } from "./nft-record"
import { inspectMediaIntegrity, type ViaOwnershipRecord } from "./digital-ownership"
import { normalizeRightsDeclaration, type ViaRightsDeclaration } from "./nft-rights"
import { normalizeNftUtilities, type ViaNftUtility } from "./nft-utility"

export type ViaDigitalOwnershipView = {
  nft: ViaNftRecord
  ownership: ViaOwnershipRecord
  rights: ViaRightsDeclaration
  utility: ViaNftUtility[]
}

export function composeDigitalOwnership(input: {
  nft: ViaNftRecord
  rights?: Parameters<typeof normalizeRightsDeclaration>[0]
  utility?: unknown
  royaltyBasisPoints?: number
}): ViaDigitalOwnershipView {
  const rights = normalizeRightsDeclaration(input.rights ?? {})
  const utility = normalizeNftUtilities(input.utility)

  return {
    nft: input.nft,
    ownership: {
      creatorPublicKey: input.nft.creatorPublicKey ?? "",
      currentOwnerPublicKey:
        input.nft.editionCount === 1 ? input.nft.ownerPublicKeys[0] : undefined,
      media: inspectMediaIntegrity(input.nft.mediaUrls),
      license: rights.declaredByCreator ? rights.kind : undefined,
      royaltyBasisPoints: input.royaltyBasisPoints,
      utility: utility.map((item) => item.kind),
    },
    rights,
    utility,
  }
}
