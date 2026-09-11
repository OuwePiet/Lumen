export type ViaSupportLedgerKind =
  | "community-support"
  | "sponsor-payment"
  | "reward-allocation"
  | "forward-to-treasury"

export type ViaSupportLedgerEntry = {
  id: string
  kind: ViaSupportLedgerKind
  amountAtomic: string
  asset: "USD" | "EUR" | "BTC" | "DESO"
  confirmedAt: string
  reference: string
}

export type ViaSupportFlowState = {
  received: boolean
  confirmed: boolean
  allocatedAmountAtomic?: string
  forwardedAmountAtomic?: string
}

export const VIA_SUPPORT_LEDGER_GUIDE = {
  receipt:
    "Community support and sponsor income are recorded only after confirmed receipt at the configured VIA receiving identity.",
  allocation:
    "Amounts needed for approved VIA/community purposes remain distinguishable from amounts selected for treasury forwarding.",
  forwarding:
    "Treasury forwarding is a separate confirmed ledger event; VIA never treats an intended forwarding as completed until confirmation exists.",
  privacy:
    "Public pages do not expose receiving or treasury public keys merely because they are used by the internal payment flow.",
  audit:
    "Sponsor Admin can present receipt, allocation and forwarding as separate auditable states.",
} as const
