const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const A = 'BC1' + 'A'.repeat(48), B = 'BC1' + 'B'.repeat(48), hash = 'a'.repeat(64)
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app/nft-action-preflight.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
function fixture(options = {}) {
  const calls = [], exports = {}
  vm.runInNewContext(code, { exports, require: () => ({ fetchDeSo: async (endpoint, init) => {
    calls.push(endpoint)
    assert.equal(JSON.parse(init.body).PostHashHex, hash)
    return { ok: !options.unavailable, json: async () => endpoint === 'get-nft-entries-for-nft-post' ? { NFTEntryResponses: [{ SerialNumber: 1, OwnerPublicKeyBase58Check: options.owner ?? A, IsPending: options.pending ?? false, IsForSale: options.forSale ?? false }] } : endpoint === 'get-single-post' ? { PostFound: { HasUnlockable: options.unlockable ?? false } } : { BidEntryResponses: options.bids ?? [{ SerialNumber: 1, PublicKeyBase58Check: B, BidAmountNanos: 100 }] } }
  } }) })
  return { calls, check: (kind, extra = {}) => exports.assertNFTActionState(kind, { publicKey: A, ownerPublicKey: A, senderPublicKey: A, receiverPublicKey: B, bidderPublicKey: B, postHash: hash, serialNumber: 1, bidAmountNanos: 100, ...extra }) }
}
for (const kind of ['update-sale', 'transfer', 'burn']) test(`${kind} checks the actual owner`, async () => {
  await fixture().check(kind)
  await assert.rejects(fixture({ owner: B }).check(kind), /NFT_OWNER_CHANGED/)
})
for (const kind of ['update-sale', 'transfer', 'burn', 'accept-bid', 'withdraw-bid']) test(`${kind} stops for a pending transfer`, async () => {
  await assert.rejects(fixture({ pending: true }).check(kind), /NFT_TRANSFER_PENDING/)
})
test('incoming transfer requires current recipient and actual pending state', async () => {
  await fixture({ pending: true }).check('accept-transfer')
  await assert.rejects(fixture().check('accept-transfer'), /NFT_TRANSFER_NO_LONGER_PENDING/)
  await assert.rejects(fixture({ owner: B, pending: true }).check('accept-transfer'), /NFT_OWNER_CHANGED/)
})
for (const kind of ['transfer', 'burn']) test(`${kind} stops if the edition is for sale`, async () => {
  await assert.rejects(fixture({ forSale: true }).check(kind), /NFT_STILL_FOR_SALE/)
})
for (const kind of ['transfer', 'accept-bid', 'update-sale']) test(`${kind} uses authoritative unlockable state even if client says false`, async () => {
  await assert.rejects(fixture({ unlockable: true, forSale: kind === 'accept-bid' }).check(kind, { hasUnlockable: false, isBuyNow: true }), /NFT_UNLOCKABLE_REQUIRES_ENCRYPTION/)
})
test('accept bid requires the exact live bid, amount and bidder', async () => {
  await fixture({ forSale: true }).check('accept-bid')
  await assert.rejects(fixture({ forSale: true }).check('accept-bid', { bidAmountNanos: 101 }), /NFT_BID_CHANGED/)
  await assert.rejects(fixture({ forSale: true, bids: [] }).check('accept-bid'), /NFT_BID_CHANGED/)
})
test('withdrawal requires an existing bid from the actor', async () => {
  await fixture({ bids: [{ SerialNumber: 1, PublicKeyBase58Check: A, BidAmountNanos: 100 }] }).check('withdraw-bid')
  await assert.rejects(fixture().check('withdraw-bid'), /NFT_BID_CHANGED/)
})
test('read failure does not construct or submit any transaction', async () => {
  const f = fixture({ unavailable: true })
  await assert.rejects(f.check('transfer'), /NFT_STATE_UNAVAILABLE/)
  assert.deepEqual(f.calls, ['get-nft-entries-for-nft-post'])
})
