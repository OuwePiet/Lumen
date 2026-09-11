import type { ViaSupportLedgerEntry } from "./support-ledger"

export type ViaSupportLedgerSummary = {
  confirmedReceipts: number
  sponsorPayments: number
  communitySupports: number
  rewardAllocations: number
  treasuryForwards: number
}

export function summarizeSupportLedger(
  entries: ViaSupportLedgerEntry[]
): ViaSupportLedgerSummary {
  return entries.reduce<ViaSupportLedgerSummary>(
    (summary, entry) => {
      summary.confirmedReceipts +=
        entry.kind === "community-support" || entry.kind === "sponsor-payment" ? 1 : 0
      summary.sponsorPayments += entry.kind === "sponsor-payment" ? 1 : 0
      summary.communitySupports += entry.kind === "community-support" ? 1 : 0
      summary.rewardAllocations += entry.kind === "reward-allocation" ? 1 : 0
      summary.treasuryForwards += entry.kind === "forward-to-treasury" ? 1 : 0
      return summary
    },
    {
      confirmedReceipts: 0,
      sponsorPayments: 0,
      communitySupports: 0,
      rewardAllocations: 0,
      treasuryForwards: 0,
    }
  )
}

export const VIA_SUPPORT_LEDGER_ADMIN_COPY = {
  en: {
    title: "Support & sponsor ledger",
    receipts: "Confirmed receipts",
    sponsors: "Sponsor payments",
    community: "Community support",
    rewards: "Reward allocations",
    forwards: "Treasury forwards",
  },
  nl: {
    title: "Steun- en sponsoradministratie",
    receipts: "Bevestigde ontvangsten",
    sponsors: "Sponsorbetalingen",
    community: "Communitybijdragen",
    rewards: "Reward-reserveringen",
    forwards: "Doorstortingen naar treasury",
  },
} as const
