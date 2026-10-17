const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const A = 'BC1' + 'A'.repeat(48), B = 'BC1' + 'B'.repeat(48), HASH = 'a'.repeat(64)
const tick = () => new Promise(resolve => setImmediate(resolve))
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
function fixture(options = {}) {
  let now = Date.now()
  class Clock extends Date { static now() { return now } }
  let active = A, permission = options.permission ?? true
  const calls = [], storage = options.storage ?? new Map(), events = new EventTarget()
  const window = { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { if (options.storageFails || options.receiptFails && key.endsWith(':submitted')) throw new Error('blocked'); storage.set(key, value) }, removeItem: key => storage.delete(key) }, addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events) }
  const runStep = async name => { calls.push(name); if (options.expireAt === name) now += 121000; if (options.pause === name) await new Promise(resolve => { options.resume = resolve }); if (options.fail === name) throw new Error(name); if (options.accountChange === name) { active = B; window.dispatchEvent(new Event('via:identity')); active = A; window.dispatchEvent(new Event('via:identity')) } }
  const identity = {
    currentUser: async () => active ? { publicKey: active } : null,
    refreshSpendingLimits: async () => { await runStep('refresh'); if (options.failRefreshAfterSubmit && calls.includes('submit')) throw new Error('refresh') },
    spendingLimits: async () => { await runStep('limits'); return { GlobalDESOLimit: options.remaining ?? 1000 } },
    hasPermissions: async limits => { await runStep('hasPermissions'); calls.push(['required', limits.GlobalDESOLimit]); return permission },
    requestPermissions: async limits => { await runStep('requestPermissions'); calls.push(['requested', limits.GlobalDESOLimit]); permission = !options.deny },
    signTx: async () => { await runStep('sign'); return options.invalidSigned ? 'xyz' : 'abcd' },
  }
  const globals = { window, navigator: { locks: { request: async (_key, _options, fn) => fn({}) } }, Event, Date: Clock, console }
  const ledger = {}
  vm.runInNewContext(compile('financial-submission.ts'), { ...globals, exports: ledger })
  const exports = {}
  vm.runInNewContext(compile('nft-action.ts'), { ...globals, exports, require(name) {
    if (name === './deso-identity-modern') return { viaModernIdentity: identity }
    if (name === './deso-identity-session') return { restoreIdentitySession: () => active ? { publicKey: active } : null, VIA_IDENTITY_EVENT: 'via:identity' }
    if (name === './financial-submission') return ledger
    if (name === './deso-api') return { fetchDeSo: async () => { await runStep('balance'); return { ok: true, json: async () => ({ UserList: [{ PublicKeyBase58Check: options.wrongBalanceAccount ? B : A, BalanceNanos: options.balance ?? 1000 }] }) } } }
    throw new Error(name)
  }, fetch: async (_url, init) => {
    const body = JSON.parse(init.body)
    await runStep(body.action)
    if (body.action === 'prepare') return { ok: true, json: async () => ({ ok: true, transactionHex: options.invalidQuote ? 'zz' : 'aabb', feeNanos: options.fee ?? 100, spendAmountNanos: options.spend ?? 0 }) }
    assert.ok([...storage.keys()].some(key => key.endsWith(':pending')), 'pending must be durable before any broadcast')
    return { ok: !options.rejectSubmit, json: async () => { if (options.lostResponse) throw new Error('lost'); return { ok: !options.rejectSubmit, transaction: { TxnHashHex: HASH }, postHashHex: HASH } } }
  } })
  const runner = exports.createNFTActionRunner(async () => { await runStep('review'); return !options.cancelReview })
  const status = []
  const action = kind => ({ kind, publicKey: A, postHash: HASH, serialNumber: 1, body: kind === 'mint' ? { mint: { updaterPublicKey: A, nftPostHashHex: HASH } } : { [kind === 'transfer' ? 'senderPublicKey' : kind === 'accept-bid' ? 'ownerPublicKey' : 'publicKey']: A, postHash: HASH, serialNumber: 1 } })
  return { runner, storage, calls, status, action, options, setActive(value) { active = value; window.dispatchEvent(new Event('via:identity')) }, run(kind = 'burn') { return runner.run(action(kind), (value, message) => status.push({ value, message })) } }
}

for (const kind of ['update-sale', 'transfer', 'burn', 'withdraw-bid', 'accept-bid', 'accept-transfer', 'mint', 'source-post']) test(`${kind}: one broadcast, durable receipt, honest non-final success`, async () => {
  const f = fixture(); const result = await f.run(kind)
  assert.equal(result.outcome, 'accepted'); assert.match(result.message, /nog worden gecontroleerd/)
  assert.equal(f.calls.filter(x => x === 'submit').length, 1)
  assert.ok([...f.storage.keys()].some(key => key.endsWith(':submitted')))
  assert.equal([...f.storage.keys()].some(key => key.endsWith(':pending')), false)
  assert.equal((await f.run(kind)).outcome, 'stopped')
  assert.equal(f.calls.filter(x => x === 'submit').length, 1)
})
test('synchronous single flight blocks the second click before the first await', async () => {
  const f = fixture({ pause: 'prepare' }); const first = f.run(); const second = await f.run()
  assert.equal(second.outcome, 'stopped'); await tick(); f.options.resume(); assert.equal((await first).outcome, 'accepted')
  assert.equal(f.calls.filter(x => x === 'prepare').length, 1)
})
for (const step of ['prepare', 'balance', 'review', 'refresh', 'limits', 'hasPermissions', 'requestPermissions', 'sign']) test(`A→B→A during ${step} invalidates action permanently`, async () => {
  const f = fixture({ accountChange: step, permission: step === 'requestPermissions' ? false : true })
  assert.equal((await f.run()).outcome, 'stopped'); assert.equal(f.calls.includes('submit'), false)
})
test('cancelling the exact action review never requests permission, signs or submits', async () => {
  const f = fixture({ cancelReview: true }); assert.equal((await f.run()).outcome, 'stopped')
  assert.equal(f.calls.includes('hasPermissions'), false); assert.equal(f.calls.includes('sign'), false); assert.equal(f.calls.includes('submit'), false)
})
for (const options of [{ lostResponse: true }, { fail: 'submit' }, { rejectSubmit: true }]) test(`uncertain submit persists across reload: ${JSON.stringify(options)}`, async () => {
  const f = fixture(options); assert.equal((await f.run()).outcome, 'uncertain')
  assert.ok([...f.storage.keys()].some(key => key.endsWith(':pending')))
  const reload = fixture({ storage: f.storage }); assert.equal((await reload.run()).outcome, 'stopped'); assert.equal(reload.calls.includes('prepare'), false)
})
test('sufficient remaining budget does not open a new permission request', async () => {
  const f = fixture({ remaining: 9999 }); assert.equal((await f.run()).outcome, 'accepted'); assert.equal(f.calls.includes('requestPermissions'), false)
})
test('missing operation allowance requests remaining plus fee, then verifies grant', async () => {
  const f = fixture({ permission: false, remaining: 500, fee: 100 }); assert.equal((await f.run()).outcome, 'accepted')
  assert.deepEqual(f.calls.find(x => Array.isArray(x) && x[0] === 'requested'), ['requested', 600])
})
for (const options of [{ deny: true, permission: false }, { fee: -1 }, { fee: 0.5 }, { fee: Number.MAX_SAFE_INTEGER + 1 }, { balance: 1 }, { wrongBalanceAccount: true }, { invalidQuote: true }, { invalidSigned: true }, { storageFails: true }]) test(`invalid preflight or unavailable recovery fails before broadcast: ${JSON.stringify(options)}`, async () => {
  const f = fixture(options); assert.equal((await f.run()).outcome, 'stopped'); assert.equal(f.calls.includes('submit'), false)
})
test('accepted submit remains accepted when refreshing spending limits fails', async () => {
  const f = fixture({ failRefreshAfterSubmit: true }); assert.equal((await f.run()).outcome, 'accepted'); assert.equal(f.calls.filter(x => x === 'submit').length, 1)
})
test('leaving the page while approval is pending stops signing and submission', async () => {
  const f = fixture({ pause: 'requestPermissions', permission: false }); const pending = f.run(); await tick(); f.runner.dispose(); f.options.resume()
  assert.equal((await pending).outcome, 'stopped'); assert.equal(f.calls.includes('sign'), false)
})
test('changing the selected edition during prepare invalidates the action', async () => {
  const f = fixture({ pause: 'prepare' }); const pending = f.run(); await tick(); f.runner.invalidate(); f.options.resume()
  assert.equal((await pending).outcome, 'stopped'); assert.equal(f.calls.includes('sign'), false)
})
for (const kind of ['mint', 'source-post']) {
  test(`${kind}: lost response blocks a reload without re-preparing`, async () => {
    const f = fixture({ lostResponse: true }); assert.equal((await f.run(kind)).outcome, 'uncertain')
    const reload = fixture({ storage: f.storage }); assert.equal((await reload.run(kind)).outcome, 'stopped'); assert.equal(reload.calls.includes('prepare'), false)
  })
  test(`${kind}: account switch during signing stops broadcast`, async () => {
    const f = fixture({ accountChange: 'sign' }); assert.equal((await f.run(kind)).outcome, 'stopped'); assert.equal(f.calls.includes('submit'), false)
  })
}
test('mint budget includes the full node-reported spend plus network fee', async () => {
  const f = fixture({ spend: 450, fee: 100, balance: 600 })
  assert.equal((await f.run('mint')).outcome, 'accepted')
  assert.deepEqual(f.calls.find(x => Array.isArray(x) && x[0] === 'required'), ['required', 550])
  const insufficient = fixture({ spend: 450, fee: 100, balance: 500 })
  assert.equal((await insufficient.run('mint')).outcome, 'stopped'); assert.equal(insufficient.calls.includes('sign'), false)
})
test('received source-post hash is exposed without inventing confirmation', async () => {
  const f = fixture(); const result = await f.run('source-post')
  assert.equal(result.postHashHex, HASH); assert.match(result.message, /nog worden gecontroleerd/)
})
for (const step of ['review','sign']) test(`expired quote during ${step} never broadcasts`, async () => {
  const f = fixture({ expireAt: step }); assert.equal((await f.run()).outcome, 'stopped'); assert.equal(f.calls.includes('submit'), false)
})
test('lost recovery write after acknowledgement keeps uncertainty and never retries', async () => {
  const f = fixture({ receiptFails: true }); assert.equal((await f.run()).outcome, 'uncertain')
  assert.ok([...f.storage.keys()].some(key => key.endsWith(':pending')))
  assert.equal((await f.run()).outcome, 'stopped'); assert.equal(f.calls.filter(value => value === 'submit').length, 1)
})
