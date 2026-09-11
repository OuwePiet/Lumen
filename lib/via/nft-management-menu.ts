export type ViaNftManagementAction =
  | "sale"
  | "auction"
  | "giveaway"
  | "transfer"
  | "bulk-distribute"
  | "claim"
  | "content"
  | "burn"

export type ViaNftManagementItem = {
  action: ViaNftManagementAction
  label: string
  destructive?: boolean
}

export const VIA_NFT_MANAGEMENT_MENU: ViaNftManagementItem[] = [
  { action: "sale", label: "Sale" },
  { action: "auction", label: "Auction" },
  { action: "giveaway", label: "🎁 Giveaway" },
  { action: "transfer", label: "Transfer / Gift" },
  { action: "bulk-distribute", label: "Bulk Distribute" },
  { action: "claim", label: "Claim" },
  { action: "content", label: "Content" },
  { action: "burn", label: "Burn", destructive: true },
]

export function managementActionsForEdition(input: {
  ownedByViewer: boolean
  forSale: boolean
}) {
  if (!input.ownedByViewer) return []

  return VIA_NFT_MANAGEMENT_MENU.map((item) => ({
    ...item,
    enabled:
      item.action === "transfer" ||
      item.action === "giveaway" ||
      item.action === "bulk-distribute"
        ? !input.forSale
        : true,
    reason:
      input.forSale &&
      (item.action === "transfer" ||
        item.action === "giveaway" ||
        item.action === "bulk-distribute")
        ? "Remove sale price first"
        : undefined,
  }))
}
