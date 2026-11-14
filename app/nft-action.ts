"use client"

import { viaModernIdentity } from "./deso-identity-modern"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "./deso-identity-session"
import { fetchDeSo } from "./deso-api"
import { financialSubmissionBlock, markFinancialPending, markFinancialSubmitted, withFinancialAccountLock } from "./financial-submission"

export type NFTActionKind = "update-sale" | "transfer" | "burn" | "withdraw-bid" | "accept-bid" | "accept-transfer" | "mint" | "source-post"
export type NFTActionStatus = "preparing" | "approval" | "submitting" | "done" | "error"
export type NFTActionResult = { outcome: "accepted" | "uncertain" | "stopped"; message: string; postHashHex?: string }
type Action = {
  kind: NFTActionKind
  publicKey: string
  postHash?: string
  serialNumber?: number
  body: Record<string, unknown>
}
export type NFTActionReview = { publicKey: string; kind: NFTActionKind | "bid" | "buy-now"; postHash?: string; serialNumber?: number; body: Record<string, unknown>; feeNanos: number; spendNanos: number; expiresAt: number; isCurrent: () => boolean }
const operationNames: Partial<Record<NFTActionKind, string>> = {
  "update-sale": "update", transfer: "transfer", burn: "burn",
  "withdraw-bid": "nft_bid", "accept-bid": "accept_nft_bid", "accept-transfer": "accept_nft_transfer",
}
const validHex = (value: unknown): value is string => typeof value === "string" && value.length <= 500_000 && /^(?:[a-f0-9]{2})+$/i.test(value)
const safeNanos = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0

/** One runner per mounted control. Lock is synchronous; persistent state is shared with bids and sponsors. */
export function createNFTActionRunner(review?: (quote: NFTActionReview) => Promise<boolean>) {
  let running = false
  let invalidated = false
  let disposed = false
  return {
    invalidate() { invalidated = true },
    dispose() { disposed = true; invalidated = true },
    async run(action: Action, status: (value: NFTActionStatus, message: string) => void): Promise<NFTActionResult> {
      if (running || disposed) return { outcome: "stopped", message: "Er loopt al een NFT-actie of deze pagina is verlaten." }
      running = true // Before the first await, including Identity and Web Locks.
      invalidated = false
      let sent = false
      let accepted = false
      let result: NFTActionResult = { outcome: "stopped", message: "NFT-actie niet verzonden." }
      const check = () => {
        if (invalidated || disposed || restoreIdentitySession()?.publicKey !== action.publicKey) throw new Error("ACCOUNT_OR_SELECTION_CHANGED")
      }
      const identityChanged = (event: Event) => {
        if (event.type === "storage") {
          const change = event as StorageEvent
          if (change.key === null || change.key === "desoIdentityUsers" || (change.key === "desoActivePublicKey" && change.newValue !== action.publicKey)) invalidated = true
        }
        if (restoreIdentitySession()?.publicKey !== action.publicKey) invalidated = true
      }
      const assertAccount = async () => {
        check()
        const user = await viaModernIdentity.currentUser()
        check()
        if (user?.publicKey !== action.publicKey) throw new Error("ACCOUNT_CHANGED")
      }
      window.addEventListener(VIA_IDENTITY_EVENT, identityChanged)
      window.addEventListener("storage", identityChanged)
      try {
        const editionAction = Object.hasOwn(operationNames, action.kind)
        if (!editionAction && action.kind !== "mint" && action.kind !== "source-post") throw new Error("INVALID_NFT_ACTION")
        if (editionAction && (!action.postHash || !/^[a-f0-9]{64}$/i.test(action.postHash) || !Number.isSafeInteger(action.serialNumber) || action.serialNumber! < 1)) throw new Error("INVALID_NFT_ACTION")
        // Snapshot payload once: changing inputs during any await cannot change the reviewed action.
        const payload = JSON.parse(JSON.stringify(action.body)) as Record<string, unknown>
        const senderField = action.kind === "transfer" ? "senderPublicKey" : action.kind === "accept-bid" ? "ownerPublicKey" : "publicKey"
        const mint = payload.mint as Record<string, unknown> | undefined
        if (action.kind === "mint" ? (!mint || mint.updaterPublicKey !== action.publicKey || mint.nftPostHashHex !== action.postHash) : payload[senderField] !== action.publicKey) throw new Error("INVALID_NFT_SENDER")
        if (editionAction && (payload.postHash !== action.postHash || payload.serialNumber !== action.serialNumber)) throw new Error("INVALID_NFT_EDITION")
        const intent = `nft-${action.kind}:${JSON.stringify(Object.fromEntries(Object.entries(payload).sort(([a], [b]) => a.localeCompare(b))))}`
        await withFinancialAccountLock(action.publicKey, async () => {
          await assertAccount()
          const blocked = financialSubmissionBlock(action.publicKey, intent)
          if (blocked) throw new Error(blocked)
          status("preparing", "Actuele NFT-transactie en netwerkkosten controleren…")
          const endpoint = action.kind === "mint" ? "/api/via/mint/execute" : action.kind === "source-post" ? "/api/via/social/post" : `/api/via/nft/${action.kind}`
          const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ ...payload, action: "prepare" }) })
          check()
          const quote = await response.json() as { ok?: boolean; transactionHex?: string; feeNanos?: number; spendAmountNanos?: number; error?: string }
          await assertAccount()
          if (!response.ok || !quote.ok || !validHex(quote.transactionHex) || !safeNanos(quote.feeNanos)) throw new Error(quote.error || "INVALID_NFT_QUOTE")
          if (action.kind === "mint" && !safeNanos(quote.spendAmountNanos)) throw new Error("INVALID_MINT_SPEND")
          const cost = quote.feeNanos + (action.kind === "mint" ? quote.spendAmountNanos! : 0)
          if (!safeNanos(cost)) throw new Error("INVALID_NFT_COST")
          const preparedAt = Date.now()
          const fresh = () => { if (Date.now() < preparedAt || Date.now() - preparedAt > 120_000) throw new Error("NFT_QUOTE_EXPIRED") }
          const balanceResponse = await fetchDeSo("get-users-stateless", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ PublicKeysBase58Check: [action.publicKey], SkipForLeaderboard: true, GetUnminedBalance: true }) })
          check()
          const users = await balanceResponse.json() as { UserList?: Array<{ PublicKeyBase58Check?: string; BalanceNanos?: number }> }
          await assertAccount()
          const balance = users.UserList?.find(user => user.PublicKeyBase58Check === action.publicKey)?.BalanceNanos
          if (!balanceResponse.ok || !safeNanos(balance) || balance < cost) throw new Error("INSUFFICIENT_OR_UNKNOWN_BALANCE")
          if (!review || !await review({ publicKey: action.publicKey, kind: action.kind, postHash: action.postHash, serialNumber: action.serialNumber, body: payload, feeNanos: quote.feeNanos, spendNanos: cost - quote.feeNanos, expiresAt: preparedAt + 120_000, isCurrent: () => { try { check(); fresh(); return true } catch { return false } } })) throw new Error("NFT_REVIEW_CANCELLED")
          await assertAccount()
          fresh()
          await viaModernIdentity.refreshSpendingLimits()
          await assertAccount()
          const limits = await viaModernIdentity.spendingLimits()
          await assertAccount()
          const remaining = limits?.GlobalDESOLimit ?? 0
          if (!safeNanos(remaining)) throw new Error("INVALID_SPENDING_LIMIT")
          const permission = editionAction
            ? { GlobalDESOLimit: cost, NFTOperationLimitMap: { [action.postHash!]: { [action.serialNumber!]: { [operationNames[action.kind]!]: 1 } } } }
            : { GlobalDESOLimit: cost, TransactionCountLimitMap: { [action.kind === "mint" ? "CREATE_NFT" : "SUBMIT_POST"]: 1 } }
          const permitted = await viaModernIdentity.hasPermissions(permission)
          await assertAccount()
          if (!permitted) {
            const requested = remaining + cost
            if (!safeNanos(requested)) throw new Error("INVALID_SPENDING_LIMIT")
            status("approval", "DeSo-toestemming voor deze editie en netwerkkosten controleren…")
            await viaModernIdentity.requestPermissions({ ...permission, GlobalDESOLimit: requested })
            await assertAccount()
            const granted = await viaModernIdentity.hasPermissions(permission)
            await assertAccount()
            if (!granted) throw new Error("PERMISSION_NOT_CONFIRMED")
          }
          fresh()
          status("approval", "Deze NFT-actie met DeSo Identity ondertekenen…")
          const signedTransactionHex = await viaModernIdentity.signTx(quote.transactionHex)
          await assertAccount()
          fresh()
          if (!validHex(signedTransactionHex)) throw new Error("INVALID_SIGNED_TRANSACTION")
          const submission = { publicKey: action.publicKey, intent, amountNanos: Math.max(1, cost), startedAt: Date.now() }
          markFinancialPending(submission)
          check()
          status("submitting", "Verzenden naar DeSo; bij een onzekere response niet opnieuw verzenden…")
          sent = true
          const submit = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ action: "submit", signedTransactionHex }) })
          const receipt = await submit.json() as { ok?: boolean; transaction?: { TxnHashHex?: unknown }; postHashHex?: string }
          if (!submit.ok || !receipt.ok) throw new Error("SUBMIT_STATUS_UNCERTAIN")
          accepted = true
          markFinancialSubmitted(submission, receipt.transaction?.TxnHashHex)
          result = { outcome: "accepted", message: "DeSo heeft de NFT-transactie ontvangen. Definitieve verwerking en eigendom moeten nog worden gecontroleerd; niet opnieuw verzenden." }
          if (action.kind === "source-post" && typeof receipt.postHashHex === "string" && /^[a-f0-9]{64}$/i.test(receipt.postHashHex)) result.postHashHex = receipt.postHashHex.toLowerCase()
          status("done", result.message)
          try { await assertAccount(); await viaModernIdentity.refreshSpendingLimits() } catch { /* ACK and recovery record remain authoritative; never retry. */ }
        })
      } catch (error) {
        result = sent || accepted
          ? { outcome: "uncertain", message: accepted ? "DeSo heeft de transactie ontvangen, maar de herstelregistratie is onzeker. Niet opnieuw verzenden." : "Verzendstatus onzeker. Controleer DeSo; niet opnieuw verzenden, ook niet na herladen." }
          : { outcome: "stopped", message: `Niet verzonden door VIA. ${error instanceof Error ? error.message : "Controleer account, toestemming en herstelstatus."}` }
        status("error", result.message)
      } finally {
        window.removeEventListener(VIA_IDENTITY_EVENT, identityChanged)
        window.removeEventListener("storage", identityChanged)
        running = false
      }
      return result
    },
  }
}
