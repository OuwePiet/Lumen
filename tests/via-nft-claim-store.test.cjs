const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const model = {}; vm.runInNewContext(compile('lib/via/nft-claims.ts'), { exports: model })
const ID = '1'.repeat(64), A = 'BC1'+'A'.repeat(48)
const data = { version: 1, id: ID, ownerPublicKey: A, postHash: 'a'.repeat(64), title: 'Free NFT', serialNumbers: [1], startsAt: 1, endsAt: 9999999999999, perAccount: 1, requirement: 'free', claims: [] }
function fixture(options = {}) {
  const calls = [], exports = {}
  vm.runInNewContext(compile('app/nft-claim-store.ts'), { exports, Response, process: { env: {} }, require(name) {
    if (name.includes('nft-claims')) return model
    if (name === '@vercel/blob') return {
      get: async (pathname, config) => { calls.push(['get', pathname, config]); if (options.readFails) throw new Error('read'); if (options.missing) return null; return { statusCode: 200, blob: { size: options.oversize ? 100000 : 200, etag: 'expected-etag' }, stream: new Response(JSON.stringify(options.corrupt ? {} : data)).body } },
      put: async (pathname, body, config) => { calls.push(['put', pathname, config]); if (options.writeFails) throw new Error('write') },
    }
    throw new Error(name)
  } })
  return { ...exports, calls }
}
test('private stock reads bypass CDN cache and retain authoritative ETag', async () => {
  const f = fixture(), result = await f.readNFTGiveaway(ID)
  assert.equal(result.etag, 'expected-etag'); assert.equal(f.calls[0][2].access, 'private'); assert.equal(f.calls[0][2].useCache, false)
})
test('new campaign uses one non-overwriting private path; reservation requires matching ETag', async () => {
  const f = fixture(); await f.writeNFTGiveaway(data); await f.writeNFTGiveaway(data, 'v1')
  assert.equal(f.calls[0][2].allowOverwrite, false); assert.equal(f.calls[0][2].addRandomSuffix, false)
  assert.equal(f.calls[1][2].ifMatch, 'v1'); assert.equal(f.calls[1][2].allowOverwrite, true); assert.equal(f.calls[1][2].access, 'private')
})
for (const options of [{ readFails: true }, { corrupt: true }, { oversize: true }]) test(`unknown storage state is never treated as empty inventory: ${JSON.stringify(options)}`, async () => {
  await assert.rejects(fixture(options).readNFTGiveaway(ID))
})
test('write failure is propagated once without application retry', async () => {
  const f = fixture({ writeFails: true }); await assert.rejects(f.writeNFTGiveaway(data, 'v1')); assert.equal(f.calls.length, 1)
})
test('arbitrary paths and external URLs never reach storage SDK', async () => {
  const f = fixture(); await assert.rejects(f.readNFTGiveaway('https://evil.example/')); assert.equal(f.calls.length, 0)
})
