const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const A = 'BC1'+'A'.repeat(48), B = 'BC1'+'B'.repeat(48), HASH = 'a'.repeat(64)
const editions = {}; vm.runInNewContext(compile('lib/via/nft-actionable-editions.ts'), { exports: editions })
test('missing, duplicate, unsafe or unknown edition state never becomes a financial control', () => {
  const base = { SerialNumber: 2, OwnerPublicKeyBase58Check: A, IsPending: false, IsForSale: false }
  const entries = [base, { ...base, SerialNumber: undefined }, { ...base, SerialNumber: 0 }, { ...base, SerialNumber: 0.5 }, { ...base, SerialNumber: 3 }, { ...base, SerialNumber: 3, OwnerPublicKeyBase58Check: B }, { ...base, SerialNumber: 4, IsPending: undefined }, { ...base, SerialNumber: 5, OwnerPublicKeyBase58Check: 'invalid' }]
  const actual = editions.actionableNFTEntries(entries)
  assert.equal(actual.length, 1); assert.equal(actual[0].SerialNumber, 2)
})
test('account recovery shows only the selected account and retains corrupt uncertainty', () => {
  const storage = new Map(), exports = {}
  vm.runInNewContext(compile('app/financial-submission.ts'), { exports, window: { localStorage: { get length() { return storage.size }, key: index => [...storage.keys()][index] ?? null, getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }, dispatchEvent() {} }, Event })
  const receipt = { publicKey: A, intent: 'nft-burn:test', amountNanos: 100, startedAt: 1 }
  exports.markFinancialPending(receipt); exports.markFinancialSubmitted(receipt, HASH)
  storage.set(`via:financial:v1:${A}:pending`, 'corrupt but blocking')
  storage.set(`via:financial:v1:${B}:other:submitted`, 'other account record')
  const before = [...storage]
  const result = exports.financialAccountRecovery(A)
  assert.equal(result.uncertain, true); assert.equal(result.receipts.length, 1); assert.equal(result.receipts[0].publicKey, A)
  assert.deepEqual([...storage], before, 'readback must never reset recovery state')
})
const mint = { updaterPublicKey: A, nftPostHashHex: HASH, numCopies: 1, hasUnlockable: false, isForSale: false, minBidAmountNanos: 0, creatorRoyaltyBasisPoints: 100, coinRoyaltyBasisPoints: 50, isBuyNow: false, buyNowPriceNanos: 0 }
function mintRoute(change = {}) {
  const validation = {}; vm.runInNewContext(compile('lib/via/mint-preflight.ts'), { exports: validation })
  const calls = [], exports = {}
  vm.runInNewContext(compile('app/api/via/mint/execute/route.ts'), { exports, Date, process: { env: {} }, require(name) {
    if (name === 'next/server') return { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } }
    if (name.includes('mint-preflight')) return validation
    if (name.includes('deso-api')) return { fetchDeSo: async (endpoint, init) => {
      calls.push({ endpoint, body: JSON.parse(init.body) })
      return { ok: true, json: async () => endpoint === 'get-single-post' ? { PostFound: { PublicKeyBase58Check: A, IsNFT: false, IsHidden: false, ...change } } : { TransactionHex: 'aabb', FeeNanos: 100, SpendAmountNanos: 1000 } }
    } }
    throw new Error(name)
  } })
  return { calls, run: () => exports.POST({ json: async () => ({ action: 'prepare', mint }) }) }
}
test('mint verifies actual source ownership and preserves royalties, fees and destinations', async () => {
  const f = mintRoute(); assert.equal((await f.run()).status, 200)
  assert.deepEqual(f.calls.map(call => call.endpoint), ['get-single-post','create-nft'])
  const constructed = f.calls[1].body
  assert.equal(constructed.NFTRoyaltyToCreatorBasisPoints, 100); assert.equal(constructed.NFTRoyaltyToCoinBasisPoints, 50)
  assert.deepEqual(constructed.TransactionFees, []); assert.deepEqual(constructed.AdditionalDESORoyaltiesMap, {})
})
for (const change of [{ PublicKeyBase58Check: B }, { IsNFT: true }, { IsHidden: true }, { IsNFT: undefined }]) test(`unproven or changed source stops mint construction: ${Object.keys(change)}`, async () => {
  const f = mintRoute(change); assert.equal((await f.run()).status, 409); assert.equal(f.calls.length, 1)
})
