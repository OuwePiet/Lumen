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
