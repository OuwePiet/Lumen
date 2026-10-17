const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const exportsManifest = {}
vm.runInNewContext(compile('lib/via/nft-collection-manifest.ts'), { exports: exportsManifest })
const { parseNFTCollectionManifest: parse } = exportsManifest
const key = 'BC1' + 'A'.repeat(48), hash = 'a'.repeat(64)
const data = { version: 1, creatorPublicKey: key, title: 'Series', description: 'Public curation', category: 'art', items: [hash] }
test('versioned manifest binds the publisher and preserves order', () => {
  const parsed = parse(data, key); assert.equal(parsed.creatorPublicKey, key); assert.equal(parsed.items[0], hash)
})
for (const change of [{ version: 2 }, { creatorPublicKey: 'BC1'+'B'.repeat(48) }, { items: [] }, { items: [hash, hash.toUpperCase()] }, { items: ['../bad'] }, { items: Array(51).fill(hash) }, { title: '' }, { description: 'a'.repeat(1001) }, { category: 'verified-owner' }]) test(`invalid publication manifest rejected: ${Object.keys(change)}`, () => {
  assert.equal(parse({ ...data, ...change }, key), null)
})
function preflight(options = {}) {
  const exports = {}, calls = []
  vm.runInNewContext(compile('app/nft-collection-preflight.ts'), { exports, require: () => ({ fetchDeSo: async (_endpoint, init) => {
    const body = JSON.parse(init.body); calls.push(body)
    return { ok: !options.unavailable, json: async () => ({ PostFound: { PostHashHex: body.PostHashHex, IsNFT: options.isNFT ?? true, IsHidden: options.hidden ?? false } }) }
  } }) })
  return { calls, run: () => exports.assertNFTCollectionItems(data) }
}
test('publication verifies actual native NFT references using only read endpoints', async () => {
  const f = preflight(); await f.run(); assert.equal(f.calls.length, 1); assert.equal(f.calls[0].ReaderPublicKeyBase58Check, '')
})
for (const options of [{ unavailable: true }, { isNFT: false }, { hidden: true }]) test(`unproven NFT reference stops publication: ${JSON.stringify(options)}`, async () => {
  await assert.rejects(preflight(options).run(), /NFT_COLLECTION_ITEM/)
})
