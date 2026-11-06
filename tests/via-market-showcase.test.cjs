const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(fetchDeSo, sensitive = false) {
  const exports = {}
  const source = fs.readFileSync('app/api/via/market/showcase/route.ts', 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(code, {
    exports,
    URL,
    require(name) {
      if (name === 'next/server') return { NextResponse: { json: (data, options) => ({ data, status: options?.status ?? 200, headers: options?.headers ?? {} }) } }
      if (name.includes('sensitive-content')) return { isViaSensitiveContent: () => sensitive }
      if (name.includes('deso-api')) return { fetchDeSo }
      throw new Error(`Unexpected import: ${name}`)
    },
  })
  return exports
}

test('public showcase keeps only verified for-sale hashes and safe monetary values', async () => {
  const hash = 'a'.repeat(64)
  let endpoint = ''
  const api = load(async (name) => {
    endpoint = name
    return { ok: true, json: async () => ({ NFTCollections: [
      { NumCopiesForSale: 2, LowestBuyNowPriceNanos: 1234, ProfileEntryResponse: { Username: 'Creator' }, PostEntryResponse: { PostHashHex: hash, Body: 'Artwork https://nftz.me/nft/' + hash, ImageURLs: ['https://images.example.test/a.jpg'] } },
      { NumCopiesForSale: 0, PostEntryResponse: { PostHashHex: 'b'.repeat(64) } },
      { NumCopiesForSale: 1, LowestBuyNowPriceNanos: Number.MAX_SAFE_INTEGER + 1, PostEntryResponse: { PostHashHex: 'c'.repeat(64), ImageURLs: ['javascript:alert(1)'] } },
      { NumCopiesForSale: 1, PostEntryResponse: { PostHashHex: 'invalid' } },
    ] }) }
  })
  const result = await api.GET()
  assert.equal(endpoint, 'get-nft-showcase')
  assert.equal(result.status, 200)
  assert.equal(result.data.items.length, 2)
  assert.equal(result.data.items[0].title, 'Artwork')
  assert.equal(result.data.items[0].buyNowNanos, 1234)
  assert.equal(result.data.items[1].buyNowNanos, null)
  assert.equal(result.data.items[1].image, '')
  assert.equal(result.data.source, 'deso-nft-showcase')
})

test('sensitive NFT metadata suppresses its image without hiding the listing', async () => {
  const api = load(async () => ({ ok: true, json: async () => ({ NFTCollections: [{ NumCopiesForSale: 1, PostEntryResponse: { PostHashHex: 'd'.repeat(64), ImageURLs: ['https://images.example.test/private.jpg'] } }] }) }), true)
  const result = await api.GET()
  assert.equal(result.data.items.length, 1)
  assert.equal(result.data.items[0].image, '')
})

test('unavailable and malformed sources return a non-cacheable 503', async () => {
  for (const fetchDeSo of [
    async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => ({}) }),
    async () => { throw new Error('timeout') },
  ]) {
    const result = await load(fetchDeSo).GET()
    assert.equal(result.status, 503)
    assert.equal(result.data.ok, false)
    assert.equal(result.headers['Cache-Control'], 'no-store')
  }
})

test('the public market route does not use Identity, signing or transaction endpoints', () => {
  const source = fs.readFileSync('app/api/via/market/showcase/route.ts', 'utf8')
  assert.match(source, /get-nft-showcase/)
  assert.doesNotMatch(source, /signTx|requestPermissions|submit-transaction|create-nft|update-nft|accept-nft|transfer-nft/)
})
