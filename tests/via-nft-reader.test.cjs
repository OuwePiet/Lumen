const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.join(__dirname, '..')
function load(file, globals) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(code, { exports, ...globals })
  return exports
}
const key = 'BC1' + 'A'.repeat(48)
const hash = 'a'.repeat(64)

test('public NFT reader retains edition, pending transfer and owner without unsafe amounts', async () => {
  let request
  const api = load('app/deso-nfts.ts', { require: () => ({ fetchDeSo: async (endpoint, init) => {
    request = { endpoint, body: JSON.parse(init.body) }
    return { ok: true, json: async () => ({ NFTsMap: { [hash]: { PostEntryResponse: { PostHashHex: hash }, NFTEntryResponses: [{ SerialNumber: 2, OwnerPublicKeyBase58Check: key, IsPending: true, IsBuyNow: true, BuyNowPriceNanos: 123, MinBidAmountNanos: Number.MAX_SAFE_INTEGER + 1 }] } } }) }
  } }) })
  const rows = await api.getNFTsForUser(key)
  assert.equal(rows[0].NFTEntryResponses[0].SerialNumber, 2)
  assert.equal(rows[0].NFTEntryResponses[0].OwnerPublicKeyBase58Check, key)
  assert.equal(rows[0].NFTEntryResponses[0].IsPending, true)
  assert.equal(rows[0].NFTEntryResponses[0].IsBuyNow, true)
  assert.equal(rows[0].NFTEntryResponses[0].MinBidAmountNanos, undefined)
  assert.equal(request.body.ReaderPublicKeyBase58Check, '')
  assert.equal(request.body.Limit, undefined)
})

function nodeFixture() {
  const calls = []
  const api = load('app/deso-api.ts', { process: { env: {} }, URL, AbortController, setTimeout, clearTimeout, fetch: async (url, init) => {
    calls.push({ url, init })
    return new Response('{}', { status: 503, headers: { 'content-type': 'application/json' } })
  } })
  return { ...api, calls }
}
test('association query allows the documented nested read endpoint and read retries', async () => {
  const f = nodeFixture()
  await f.fetchDeSo('post-associations/query', { method: 'POST', body: '{}' })
  assert.equal(f.calls.length, 2)
  assert.equal(f.calls[0].url, 'https://node.deso.org/api/v0/post-associations/query')
})
test('nested endpoint exceptions cannot be used for arbitrary paths or traversal', async () => {
  const f = nodeFixture()
  for (const endpoint of ['post-associations/create', '../submit-transaction', 'post-associations/query?x=1', 'https://evil.example/test', 'post-associations/query/../create']) {
    await assert.rejects(f.fetchDeSo(endpoint, { method: 'POST' }), /INVALID_DESO_ENDPOINT/)
  }
  assert.equal(f.calls.length, 0)
})
test('financial submit is still sent once even after a server error', async () => {
  const f = nodeFixture()
  await f.fetchDeSo('submit-transaction', { method: 'POST', body: '{}' })
  assert.equal(f.calls.length, 1)
})
