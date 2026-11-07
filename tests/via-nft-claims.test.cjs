const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const model = {}; vm.runInNewContext(compile('lib/via/nft-claims.ts'), { exports: model })
const A = 'BC1'+'A'.repeat(48), B = 'BC1'+'B'.repeat(48), C = 'BC1'+'C'.repeat(48)
const ID = '1'.repeat(64), HASH = 'a'.repeat(64), OP = 'b'.repeat(64), OP2 = 'c'.repeat(64)
const campaign = () => ({ version: 1, id: ID, ownerPublicKey: A, postHash: HASH, title: 'Free NFT', serialNumbers: [1], startsAt: Date.now()-10000, endsAt: Date.now()+100000, perAccount: 1, requirement: 'free', claims: [] })
test('free reservation binds account, operation and one actual available edition', () => {
  const initial = campaign(), next = model.reserveNFTClaim(initial, B, OP, [1], Date.now())
  assert.equal(initial.claims.length, 0); assert.equal(next.claims[0].publicKey, B); assert.equal(next.claims[0].serialNumber, 1)
  assert.equal(model.reserveNFTClaim(next, B, OP, [1], Date.now()), next)
  assert.throws(() => model.reserveNFTClaim(next, C, OP, [1], Date.now()), /ACCOUNT_MISMATCH/)
  assert.throws(() => model.reserveNFTClaim(next, B, OP2, [1], Date.now()), /LIMIT_REACHED/)
  assert.throws(() => model.reserveNFTClaim(next, C, OP2, [1], Date.now()), /STOCK_UNAVAILABLE/)
})
for (const [name, edit, error] of [
  ['not started', data => { data.startsAt = Date.now()+10000 }, /NOT_STARTED/],
  ['ended', data => { data.endsAt = Date.now()-1 }, /ENDED/],
  ['stock gone', () => {}, /STOCK_UNAVAILABLE/],
]) test(`reservation rejects ${name}`, () => {
  const data = campaign(); edit(data)
  assert.throws(() => model.reserveNFTClaim(data, B, OP, name === 'stock gone' ? [] : [1], Date.now()), error)
})
for (const change of [{ requirement: 'diamond' }, { serialNumbers: [1,1] }, { perAccount: 0 }, { claims: [{ publicKey: B, operationId: OP, serialNumber: 99, requestedAt: Date.now() }] }]) test(`invalid or unpaid-atomic giveaway rejected: ${Object.keys(change)}`, () => {
  assert.equal(model.parseNFTGiveaway({ ...campaign(), ...change }), null)
})
test('unknown fields cannot leak through normalized public campaign records', () => {
  const parsed = model.parseNFTGiveaway({ ...campaign(), secret: 'must-not-persist' })
  assert.equal(parsed.secret, undefined)
})
function routeFixture(options = {}) {
  let data = options.empty ? null : campaign(), etag = 'v0', writes = 0
  const calls = [], exports = {}
  vm.runInNewContext(compile('app/api/via/nft/giveaway/route.ts'), { exports, URL, Date, require(name) {
    if (name === 'next/server') return { NextResponse: { json: (body, options) => ({ status: options?.status ?? 200, body }) } }
    if (name.includes('nft-claims')) return model
    if (name.includes('nft-claim-store')) return {
      nftClaimStorageConfigured: () => !options.unconfigured,
      readNFTGiveaway: async () => data ? { data: structuredClone(data), etag } : null,
      writeNFTGiveaway: async (next, expected) => {
        await new Promise(resolve => setImmediate(resolve))
        if ((expected === undefined && data) || (expected !== undefined && expected !== etag)) throw new Error('PRECONDITION_FAILED')
        data = structuredClone(next); etag = 'v'+(++writes)
        if (options.lostWriteResponse) throw new Error('TIMEOUT_AFTER_WRITE')
      },
    }
    if (name.includes('deso-api')) return { fetchDeSo: async (endpoint, init) => {
      const body = JSON.parse(init.body); calls.push(endpoint)
      assert.ok(['get-user-global-metadata','get-single-profile','get-nft-entries-for-nft-post','get-single-post'].includes(endpoint), 'only read-only DeSo calls')
      return { ok: !(endpoint === 'get-user-global-metadata' && body.JWT !== 'valid'), json: async () => endpoint === 'get-single-profile' ? { Profile: { PublicKeyBase58Check: A } } : endpoint === 'get-nft-entries-for-nft-post' ? { NFTEntryResponses: [{ SerialNumber: 1, OwnerPublicKeyBase58Check: A, IsPending: false, IsForSale: false }] } : { PostFound: { HasUnlockable: false } } }
    } }
    throw new Error(name)
  } })
  const request = (publicKey, body, jwt = 'valid') => ({ url: `https://via.example/api/via/nft/giveaway?id=${ID}`, headers: new Headers(publicKey ? { authorization: 'Bearer '+jwt, 'x-via-public-key': publicKey } : {}), json: async () => body })
  return { calls, get data() { return data }, get writes() { return writes }, post: (key, body, jwt) => exports.POST(request(key, body, jwt)), get: key => exports.GET(request(key)) }
}
test('simultaneous claims use CAS: only one stock reservation succeeds', async () => {
  const f = routeFixture()
  const results = await Promise.all([f.post(B, { action: 'reserve', id: ID, operationId: OP }), f.post(C, { action: 'reserve', id: ID, operationId: OP2 })])
  assert.deepEqual(results.map(result => result.status).sort(), [200,409]); assert.equal(f.writes, 1); assert.equal(f.data.claims.length, 1)
})
test('lost write response is uncertain; readonly readback finds the original reservation', async () => {
  const f = routeFixture({ lostWriteResponse: true })
  const result = await f.post(B, { action: 'reserve', id: ID, operationId: OP })
  assert.equal(result.status, 409); assert.equal(result.body.notApplied, false)
  const readback = await f.get(B); assert.equal(readback.body.claims[0].operationId, OP)
  const repeat = await f.post(B, { action: 'reserve', id: ID, operationId: OP })
  assert.equal(repeat.status, 200); assert.equal(f.writes, 1)
})
test('public reader hides claims; each JWT account only sees its own reservation; owner sees queue', async () => {
  const f = routeFixture(); await f.post(B, { action: 'reserve', id: ID, operationId: OP })
  assert.equal((await f.get(null)).body.claims.length, 0)
  assert.equal((await f.get(C)).body.claims.length, 0)
  assert.equal((await f.get(B)).body.claims.length, 1)
  assert.equal((await f.get(A)).body.claims.length, 1)
})
test('invalid JWT and missing storage fail closed before any write', async () => {
  const f = routeFixture(); assert.equal((await f.post(B, {}, 'bad')).status, 403); assert.equal(f.writes, 0)
  const missing = routeFixture({ unconfigured: true }); assert.equal((await missing.post(B, {})).status, 503); assert.equal(missing.calls.length, 0)
})
test('creating giveaway requires the current official OuwePiet owner identity', async () => {
  const f = routeFixture({ empty: true })
  assert.equal((await f.post(B, { action: 'create', id: ID, campaign: campaign() })).status, 403)
  const result = await f.post(A, { action: 'create', id: ID, campaign: campaign() })
  assert.equal(result.status, 201); assert.equal(f.writes, 1)
})
