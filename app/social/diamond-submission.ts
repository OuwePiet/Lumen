"use client"

// This ledger is local to this browser origin. Never store credentials or a
// signed transaction, expire an uncertain submission, or retry it automatically.
export type DiamondSubmission = {
  publicKey: string
  postHash: string
  receiverPublicKey: string
  level: number
  startedAt: number
}

const prefix = "via:social:diamond:v1:"
export const DIAMOND_SUBMISSION_EVENT = "via:social:diamond-state"
const pendingKey = (publicKey: string) => `${prefix}${publicKey}:pending`
const receiptKey = (publicKey: string, postHash: string, receiverPublicKey: string) =>
  `${prefix}${publicKey}:${postHash}:${receiverPublicKey}:submitted`

export function diamondSubmissionBlock(publicKey: string, postHash: string, receiverPublicKey: string, level: number): string {
  const storage = window.localStorage
  // Even an unreadable/corrupt marker blocks: absence of evidence is not proof
  // that an earlier financial transaction failed.
  if (storage.getItem(pendingKey(publicKey)) !== null) return "Een eerdere Diamond is niet bevestigd. Controleer DeSo; nieuwe Diamonds met dit account blijven geblokkeerd."
  const raw = storage.getItem(receiptKey(publicKey, postHash, receiverPublicKey))
  if (raw !== null) {
    const receipt = JSON.parse(raw) as DiamondSubmission
    if (receipt.publicKey !== publicKey || receipt.postHash !== postHash || receipt.receiverPublicKey !== receiverPublicKey ||
      !Number.isInteger(receipt.level) || receipt.level < 1 || receipt.level > 8) throw new Error("INVALID_DIAMOND_RECEIPT")
    if (receipt.level >= level) return "Dit Diamond-niveau is al naar DeSo verzonden. Kies alleen een hoger niveau voor een nieuwe actie."
  }
  return ""
}

export function markDiamondPending(submission: DiamondSubmission) {
  const key = pendingKey(submission.publicKey)
  const raw = JSON.stringify(submission)
  window.localStorage.setItem(key, raw)
  if (window.localStorage.getItem(key) !== raw) throw new Error("DIAMOND_STORAGE_UNAVAILABLE")
  window.dispatchEvent(new Event(DIAMOND_SUBMISSION_EVENT))
}

export function markDiamondSubmitted(submission: DiamondSubmission) {
  const storage = window.localStorage
  const key = receiptKey(submission.publicKey, submission.postHash, submission.receiverPublicKey)
  const raw = JSON.stringify(submission)
  // Write the receipt before clearing uncertainty. Any storage failure leaves
  // the account blocked, including after the node has acknowledged submission.
  storage.setItem(key, raw)
  if (storage.getItem(key) !== raw) throw new Error("DIAMOND_STORAGE_UNAVAILABLE")
  storage.removeItem(pendingKey(submission.publicKey))
  if (storage.getItem(pendingKey(submission.publicKey)) !== null) throw new Error("DIAMOND_STORAGE_UNAVAILABLE")
  window.dispatchEvent(new Event(DIAMOND_SUBMISSION_EVENT))
}

export async function withDiamondAccountLock(publicKey: string, action: () => Promise<void>) {
  // Web Locks coordinate every component and tab on this origin. A localStorage
  // read/write alone is not an atomic cross-tab mutex. Fail closed on browsers
  // without this capability; never silently fall back to an unsafe mutex.
  if (!navigator.locks) throw new Error("DIAMOND_LOCK_UNAVAILABLE")
  await navigator.locks.request(`${prefix}${publicKey}`, { ifAvailable: true }, async (lock) => {
    if (!lock) throw new Error("DIAMOND_ALREADY_IN_PROGRESS")
    await action()
  })
}
