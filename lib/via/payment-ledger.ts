export type ViaLedgerStage =
  | "received"
  | "allocated"
  | "forwarding-required"
  | "forwarded"
  | "confirmed"

export type ViaLedgerEntry = {
  orderId: string
  stage: ViaLedgerStage
  receivedAmountMinor: number
  allocatedAmountMinor: number
  forwardedAmountMinor: number
  destinationRef: string | null
}

export function createViaLedgerEntry(input: {
  orderId: string
  receivedAmountMinor: number
}): ViaLedgerEntry | null {
  if (!input.orderId.trim()) return null
  if (!Number.isSafeInteger(input.receivedAmountMinor) || input.receivedAmountMinor < 1) return null

  return {
    orderId: input.orderId,
    stage: "received",
    receivedAmountMinor: input.receivedAmountMinor,
    allocatedAmountMinor: 0,
    forwardedAmountMinor: 0,
    destinationRef: null,
  }
}

export function allocateViaLedgerEntry(
  entry: ViaLedgerEntry,
  allocatedAmountMinor: number,
): ViaLedgerEntry | null {
  if (entry.stage !== "received") return null
  if (!Number.isSafeInteger(allocatedAmountMinor)) return null
  if (allocatedAmountMinor < 0 || allocatedAmountMinor > entry.receivedAmountMinor) return null

  return {
    ...entry,
    stage: "allocated",
    allocatedAmountMinor,
  }
}

export function requireViaForwarding(
  entry: ViaLedgerEntry,
  destinationRef: string,
): ViaLedgerEntry | null {
  if (entry.stage !== "allocated") return null
  if (!destinationRef.trim()) return null

  return {
    ...entry,
    stage: "forwarding-required",
    destinationRef,
  }
}

export function markViaLedgerForwarded(
  entry: ViaLedgerEntry,
  forwardedAmountMinor: number,
): ViaLedgerEntry | null {
  if (entry.stage !== "forwarding-required") return null
  if (!Number.isSafeInteger(forwardedAmountMinor) || forwardedAmountMinor < 1) return null
  if (forwardedAmountMinor > entry.receivedAmountMinor) return null

  return {
    ...entry,
    stage: "forwarded",
    forwardedAmountMinor,
  }
}

export function confirmViaLedgerEntry(entry: ViaLedgerEntry): ViaLedgerEntry | null {
  if (entry.stage !== "allocated" && entry.stage !== "forwarded") return null

  return {
    ...entry,
    stage: "confirmed",
  }
}

export const VIA_LEDGER_RULES = {
  separation:
    "Receipt, allocation, optional forwarding and final confirmation are recorded as separate stages.",
  privacy:
    "Public keys, wallet addresses and private accounting notes must not be exposed by public VIA interfaces.",
  forwarding:
    "Forwarding is optional and policy-driven; VIA must never infer or publish a private destination from this ledger model.",
  activation:
    "Ledger confirmation does not replace payment-provider confirmation and must not independently activate sponsor benefits.",
} as const
