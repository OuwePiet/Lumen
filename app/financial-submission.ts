"use client"

// Non-secret, origin-local recovery state. Never persist signed transactions or
// credentials. Absence from the mempool is never proof that a payment failed.
export type FinancialSubmission = {
  publicKey: string
  intent: string
  amountNanos: number
  startedAt: number
  transactionHashHex?: string
}
const prefix = "via:financial:v1:"
export const FINANCIAL_SUBMISSION_EVENT = "via:financial-state"
const pendingKey = (key: string) => `${prefix}${key}:pending`
const receiptKey = (key: string, intent: string) => `${prefix}${key}:${encodeURIComponent(intent)}:submitted`

export function financialSubmissionBlock(publicKey: string, intent: string, allowNewConfirmedAction = false) {
  if (window.localStorage.getItem(pendingKey(publicKey)) !== null) return "Een eerdere financiële verzending is onzeker. Controleer DeSo; niet opnieuw verzenden."
  if (!allowNewConfirmedAction && window.localStorage.getItem(receiptKey(publicKey, intent)) !== null) return "Deze actie is al door DeSo ontvangen. Niet opnieuw verzenden."
  return ""
}

export function financialReceipt(publicKey: string, intent: string): FinancialSubmission | null {
  const raw = window.localStorage.getItem(receiptKey(publicKey, intent))
  if (raw === null) return null
  const receipt = JSON.parse(raw) as FinancialSubmission
  if (receipt.publicKey !== publicKey || receipt.intent !== intent || !Number.isSafeInteger(receipt.amountNanos) || receipt.amountNanos < 1 ||
    !Number.isSafeInteger(receipt.startedAt) || receipt.startedAt < 1 ||
    (receipt.transactionHashHex !== undefined && !/^[0-9a-f]{64}$/i.test(receipt.transactionHashHex))) throw new Error("INVALID_FINANCIAL_RECEIPT")
  return receipt
}

function writeVerified(key: string, value: FinancialSubmission) {
  const raw = JSON.stringify(value)
  window.localStorage.setItem(key, raw)
  if (window.localStorage.getItem(key) !== raw) throw new Error("FINANCIAL_STORAGE_UNAVAILABLE")
}

export function markFinancialPending(value: FinancialSubmission) {
  if (window.localStorage.getItem(pendingKey(value.publicKey)) !== null) throw new Error("FINANCIAL_SUBMISSION_UNCERTAIN")
  writeVerified(pendingKey(value.publicKey), value)
  window.dispatchEvent(new Event(FINANCIAL_SUBMISSION_EVENT))
}

export function markFinancialSubmitted(value: FinancialSubmission, transactionHashHex?: unknown) {
  // Receipt first. Failure at any stage preserves the account-level block.
  const pending = window.localStorage.getItem(pendingKey(value.publicKey))
  if (pending !== JSON.stringify(value)) throw new Error("FINANCIAL_PENDING_CHANGED")
  const hash = typeof transactionHashHex === "string" && /^[0-9a-f]{64}$/i.test(transactionHashHex) ? transactionHashHex.toLowerCase() : undefined
  writeVerified(receiptKey(value.publicKey, value.intent), { ...value, ...(hash ? { transactionHashHex: hash } : {}) })
  window.localStorage.removeItem(pendingKey(value.publicKey))
  if (window.localStorage.getItem(pendingKey(value.publicKey)) !== null) throw new Error("FINANCIAL_STORAGE_UNAVAILABLE")
  window.dispatchEvent(new Event(FINANCIAL_SUBMISSION_EVENT))
}

export async function withFinancialAccountLock(publicKey: string, action: () => Promise<void>) {
  if (!navigator.locks) throw new Error("FINANCIAL_LOCK_UNAVAILABLE")
  await navigator.locks.request(`${prefix}${publicKey}`, { ifAvailable: true }, async (lock) => {
    if (!lock) throw new Error("FINANCIAL_ALREADY_IN_PROGRESS")
    await action()
  })
}

export async function readFinancialReceipt(publicKey: string, intent: string) {
  const receipt = financialReceipt(publicKey, intent)
  if (!receipt?.transactionHashHex) return "Geen betrouwbare transactiereferentie beschikbaar. Niet opnieuw verzenden; controleer DeSo handmatig."
  const response = await fetch(`/api/via/financial-status?hash=${encodeURIComponent(receipt.transactionHashHex)}`, { cache: "no-store" })
  const data = await response.json() as { ok?: boolean; found?: boolean }
  if (!response.ok || !data.ok || typeof data.found !== "boolean") throw new Error("FINANCIAL_READBACK_UNAVAILABLE")
  // get-txn establishes mempool visibility, not block inclusion or ownership.
  // Neither result clears pending/receipts or starts a new financial action.
  return data.found
    ? "DeSo ziet deze transactie. Dit is nog geen bewijs van definitieve block inclusion of NFT-eigendom."
    : "DeSo bevestigt deze referentie nog niet. Dat bewijst geen mislukking. Niet opnieuw verzenden."
}
