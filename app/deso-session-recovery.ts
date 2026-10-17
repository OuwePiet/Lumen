"use client"

import { SDK_ACTIVE_PUBLIC_KEY, SDK_IDENTITY_USERS, VIA_IDENTITY_EVENT } from "./deso-identity-session"

const publicKey = (value: unknown): value is string => typeof value === "string" && /^[1-9A-HJ-NP-Za-km-z]{20,100}$/.test(value)
const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value))
function usableKey(user: unknown, owner: string) {
  if (!record(user) || user.publicKey !== owner || !record(user.primaryDerivedKey)) return null
  const key = user.primaryDerivedKey
  if (key.publicKeyBase58Check !== owner || !publicKey(key.derivedPublicKeyBase58Check) || typeof key.derivedSeedHex !== "string" || !/^[a-f0-9]{64}$/i.test(key.derivedSeedHex)) return null
  return key
}

/** Public identifiers only. Incomplete SDK entries must never make Identity skip derivation. */
export function usableSDKLoginAccounts() {
  try {
    const users: unknown = JSON.parse(localStorage.getItem(SDK_IDENTITY_USERS) ?? "{}")
    if (!record(users)) return []
    return Object.entries(users).filter(([owner, user]) => publicKey(owner) && usableKey(user, owner)?.derivedKeyRegistered === true).map(([owner]) => owner)
  } catch { return [] }
}

export function hasUnfinishedSDKLogin() {
  try {
    const active = localStorage.getItem(SDK_ACTIVE_PUBLIC_KEY)
    const users: unknown = JSON.parse(localStorage.getItem(SDK_IDENTITY_USERS) ?? "{}")
    if (!publicKey(active) || !record(users) || !record(users[active])) return false
    const key = users[active].primaryDerivedKey
    return !record(key) || key.publicKeyBase58Check !== active || key.derivedKeyRegistered !== true
  } catch { return false }
}

/** Keep the SDK-generated flow and permissions; correct only its stale authenticatedUsers hint. */
export function checkedIdentityLoginURL(value: string, origin: string) {
  const url = new URL(value)
  if (url.origin !== "https://identity.deso.org" || url.pathname !== "/derive" || url.searchParams.get("redirect_uri") !== `${origin}/`) throw new Error("INVALID_IDENTITY_LOGIN_URL")
  const usable = new Set(usableSDKLoginAccounts())
  const accounts = (url.searchParams.get("authenticatedUsers") ?? "").split(",").filter(key => usable.has(key))
  if (accounts.length) url.searchParams.set("authenticatedUsers", accounts.join(","))
  else url.searchParams.delete("authenticatedUsers")
  return url.href
}

/** Recover an existing authorization by public node read only. Never sign or authorize a key. */
async function recoverExistingSDKSessionOnce(): Promise<boolean> {
  try {
    const active = localStorage.getItem(SDK_ACTIVE_PUBLIC_KEY)
    const raw = localStorage.getItem(SDK_IDENTITY_USERS)
    if (!publicKey(active) || !raw) return false
    const users: unknown = JSON.parse(raw)
    if (!record(users)) return false
    const user = users[active]
    const key = usableKey(user, active)
    if (!key || key.derivedKeyRegistered === true) return false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    let response: Response
    try { response = await fetch(`https://node.deso.org/api/v0/get-single-derived-key/${encodeURIComponent(active)}/${encodeURIComponent(String(key.derivedPublicKeyBase58Check))}`, { method: "GET", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", signal: controller.signal }) }
    finally { clearTimeout(timer) }
    if (!response.ok) return false
    const data = await response.json() as { DerivedKey?: { IsValid?: unknown; OwnerPublicKeyBase58Check?: unknown; DerivedPublicKeyBase58Check?: unknown; TransactionSpendingLimit?: unknown } }
    const proof = data.DerivedKey
    if (proof?.IsValid !== true || (proof.OwnerPublicKeyBase58Check !== undefined && proof.OwnerPublicKeyBase58Check !== active) || (proof.DerivedPublicKeyBase58Check !== undefined && proof.DerivedPublicKeyBase58Check !== key.derivedPublicKeyBase58Check)) return false
    if (localStorage.getItem(SDK_ACTIVE_PUBLIC_KEY) !== active || localStorage.getItem(SDK_IDENTITY_USERS) !== raw) return false
    // Update this existing SDK record in place; no extra copy of credentials, no pending/receipt deletion.
    users[active] = { ...user as Record<string, unknown>, primaryDerivedKey: { ...key, derivedKeyRegistered: true, IsValid: true, transactionSpendingLimits: record(proof.TransactionSpendingLimit) ? proof.TransactionSpendingLimit : null } }
    localStorage.setItem(SDK_IDENTITY_USERS, JSON.stringify(users))
    window.dispatchEvent(new CustomEvent(VIA_IDENTITY_EVENT))
    return true
  } catch { return false }
}

let recoveryFlight: Promise<boolean> | null = null
export function recoverExistingSDKSession(): Promise<boolean> {
  if (!recoveryFlight) recoveryFlight = recoverExistingSDKSessionOnce().finally(() => { recoveryFlight = null })
  return recoveryFlight
}
