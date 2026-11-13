const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8")

test("VIA Identity keeps both post association permissions in one login configuration", () => {
  const identity = read("app/deso-identity-modern.ts")
  assert.match(identity, /CREATE_POST_ASSOCIATION:\s*"UNLIMITED"/)
  assert.match(identity, /DELETE_POST_ASSOCIATION:\s*"UNLIMITED"/)
  assert.match(identity, /spendingLimitOptions:\s*VIA_BASE_SPENDING_LIMITS/)
})

test("VIA bookmarks are prepared and signed via the existing Identity adapter", () => {
  const button = read("app/social/local-save-button.tsx")
  assert.match(button, /viaModernIdentity\.signTx\(prepared\.transactionHex\)/)
  assert.match(button, /await findBookmark\(account, postHash\)/)
  assert.match(button, /DESO_ACCOUNT_CHANGED/)
  assert.doesNotMatch(button, /localStorage\.setItem/)
})

test("DeSo bookmark transactions have no extra VIA transaction fees", () => {
  const api = read("app/api/via/social/bookmark/route.ts")
  assert.match(api, /post-associations\/create/)
  assert.match(api, /post-associations\/delete/)
  assert.match(api, /post-associations\/query/)
  assert.match(api, /TransactionFees:\s*\[\]/)
  assert.match(api, /submit-transaction/)
  assert.match(api, /IncludePostEntry:\s*true/)
})

test("Earlier local bookmarks remain visible alongside account bookmarks", () => {
  const page = read("app/saved/page.tsx")
  assert.match(page, /<DeSoSavedPosts\s*\/>/)
  assert.match(page, /<SavedList\s*\/>/)
})

test("VIA Bookmarks uses shared action row and More menu", () => {
  const shared = read("app/social/via-post-action-bar.tsx")
  const bookmarks = read("app/saved/deso-saved-posts.tsx")
  assert.match(shared, /export function ViaPostActionBar/)
  assert.match(shared, /export function ViaMoreActions/)
  assert.match(bookmarks, /<ViaPostActionBar/)
  assert.match(bookmarks, /<ViaMoreActions>/)
})

test("Next.js client directives precede imports in every modified client component", () => {
  for (const file of [
    "app/social/public-posts.tsx",
    "app/notifications/notification-center.tsx",
    "app/profile/page.tsx",
    "app/saved/deso-saved-posts.tsx",
    "app/social/local-save-button.tsx",
    "app/social/via-post-action-bar.tsx",
  ]) {
    assert.match(read(file), /^"use client"\s*\n/, file)
  }
})

test("Every VIA post surface uses the shared action row", () => {
  for (const file of [
    "app/social/public-posts.tsx",
    "app/notifications/notification-center.tsx",
    "app/profile/page.tsx",
    "app/saved/deso-saved-posts.tsx",
  ]) {
    const source = read(file)
    assert.match(source, /<ViaPostActionBar\b/, file)
    assert.match(source, /<\/ViaPostActionBar>/, file)
  }
})

test("Shared VIA controls provide touch targets and constrain menus on narrow screens", () => {
  const shared = read("app/social/via-post-action-bar.tsx")
  assert.match(shared, /min-h-11 min-w-11/)
  assert.match(shared, /flex-wrap/)
  assert.match(shared, /max-w-\[calc\(100vw-2rem\)\]/)
})

test("No modified client surface places an import ahead of use client", () => {
  for (const file of [
    "app/social/public-posts.tsx",
    "app/notifications/notification-center.tsx",
    "app/profile/page.tsx",
  ]) {
    assert.ok(read(file).startsWith('"use client"'), file)
  }
})

test("Shared row enforces touch targets on direct buttons, links, and More triggers", () => {
  const shared = read("app/social/via-post-action-bar.tsx")
  assert.match(shared, /\[&>button\]:min-h-11/)
  assert.match(shared, /\[&>a\]:min-h-11/)
  assert.match(shared, /\[&>details>summary\]:min-h-11/)
})

test("Post Office More menu overlays posts without changing document flow", () => {
  const posts = read("app/social/public-posts.tsx")
  assert.match(posts, /absolute right-0 z-30 mt-2 flex w-max/)
  assert.match(posts, /max-w-\[calc\(100vw-2rem\)\]/)
  assert.match(posts, /aria-label="Meer postacties"/)
})

test("Notifications uses the shared Reward control without a second payment implementation", () => {
  const notifications = read("app/notifications/notification-center.tsx")
  const reward = read("app/social/via-reward-button.tsx")
  assert.match(notifications, /<ViaRewardButton recipientPublicKey=\{post\.publicKey\}/)
  assert.doesNotMatch(notifications, /async function sendReward/)
  assert.match(reward, /session\.publicKey === recipientPublicKey/)
  assert.match(reward, /viaModernIdentity\.signTx/)
  assert.match(reward, /Netwerkkosten:/)
  assert.match(reward, /window\.confirm/)
})

test("Post Office and Bookmarks share the same confirmed Reward component", () => {
  const reward = read("app/social/via-reward-button.tsx")
  const posts = read("app/social/public-posts.tsx")
  const saved = read("app/saved/deso-saved-posts.tsx")
  const profile = read("app/profile/page.tsx")
  assert.match(posts, /<ViaRewardButton recipientPublicKey=\{post\.publicKey\}/)
  assert.match(saved, /<ViaRewardButton recipientPublicKey=/)
  assert.match(profile, /<ViaRewardButton recipientPublicKey=\{session\.publicKey\} disabled/)
  assert.match(reward, /viaModernIdentity\.signTx/)
  assert.match(reward, /Netwerkkosten:/)
  assert.match(reward, /window\.confirm/)
  assert.match(reward, /ACCOUNT_CHANGED/)
})

test("Shared Reward refuses signing when network fee is unknown and shows feedback", () => {
  const reward = read("app/social/via-reward-button.tsx")
  assert.match(reward, /if \(feeText === "onbekend"\) throw new Error\("FEE_UNKNOWN"\)/)
  assert.match(reward, /role="status" aria-live="polite"/)
  assert.doesNotMatch(reward, /className="sr-only"\>\{message\}/)
})
