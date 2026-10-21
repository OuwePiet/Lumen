const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')
const key = 'BC1' + 'A'.repeat(48), bidder = 'BC1' + 'B'.repeat(48)
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
function fixture({ fail = false, malformed = false } = {}) {
  const calls = []; let active = 0, peak = 0
  const fetchDeSo = async (endpoint, init) => {
    const b = JSON.parse(init.body); calls.push({ endpoint, ...b })
    if (endpoint === 'get-nfts-for-user') {
      const start = b.LastKeyHex ? 101 : 1, end = b.LastKeyHex ? 106 : 100
      return { ok: true, json: async () => ({ NFTsMap: Object.fromEntries(Array.from({ length: end-start+1 }, (_, i) => {
        const hash = (start+i).toString(16).padStart(64, '0')
        return [hash, { PostEntryResponse: { PostHashHex: hash }, NFTEntryResponses: [{ SerialNumber: 1, OwnerPublicKeyBase58Check: key }] }]
      })), LastKeyHex: b.LastKeyHex ? '' : 'aa' }) }
    }
    active++; peak = Math.max(peak, active)
    await new Promise(resolve => setTimeout(resolve, 1)); active--
    return { ok: !fail, json: async () => ({ BidEntryResponses: malformed ? {} : parseInt(b.PostHashHex, 16) === 106 ? [
      { SerialNumber: 1, PublicKeyBase58Check: bidder, BidAmountNanos: 500 },
      { SerialNumber: 1, PublicKeyBase58Check: bidder, BidAmountNanos: 500 },
      { SerialNumber: 2, PublicKeyBase58Check: bidder, BidAmountNanos: 900 },
    ] : [] }) }
  }
  const nfts = {}, reader = {}
  vm.runInNewContext(compile('app/deso-nfts.ts'), { exports: nfts, require: () => ({ fetchDeSo }), Map, Set })
  vm.runInNewContext(compile('app/nft-received-bids-reader.ts'), { exports: reader, require: name => name === './deso-nfts' ? nfts : { fetchDeSo }, Map, Set })
  return { run: () => reader.getReceivedNFTBids(key), calls, peak: () => peak }
}
test('received bids include editions after the first 100; requests bounded and bids deduplicated', async () => {
  const f = fixture(), rows = await f.run()
  assert.equal(rows.length, 1); assert.equal(parseInt(rows[0].hash, 16), 106)
  assert.equal(rows[0].serial, 1); assert.equal(rows[0].amount, 500)
  assert.equal(f.calls.filter(c => c.endpoint === 'get-nfts-for-user').length, 2)
  assert.ok(f.peak() <= 4)
  assert.ok(f.calls.every(c => c.endpoint.startsWith('get-')))
})
test('failed bid lookup rejects the complete inbox rather than hiding a failed subset', async () => {
  await assert.rejects(fixture({ fail: true }).run(), /NFT_BIDS_UNAVAILABLE/)
})
test('malformed bid response is not an empty inbox', async () => {
  await assert.rejects(fixture({ malformed: true }).run(), /NFT_BIDS_INVALID/)
})
