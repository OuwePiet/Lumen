const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
let compareLimits
test.before(async () => { ({ compareTransactionSpendingLimits: compareLimits } = await import('deso-protocol/src/identity/permissions-utils.js')) })
const A = 'A'.repeat(48), B = 'B'.repeat(48), HASH = 'a'.repeat(64), TXHASH = 'b'.repeat(64)
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText

// Actual component/ledger with isolated React, Identity and HTTP. No real
// construction, signatures, popups or financial broadcasts in these tests.
function fixture({ switchAt = '', timeout = false, badJson = false, refreshFails = false, legacy = false, remaining = 50_000_000, permitted = true, confirmedGrant = true, fee = 1000, spend = 10_000_000, balance = 50_000_000, preparedAt = Date.now(), transactionHex = '00aa', signedHex = '00bb', locksAvailable = true, storageFails = '', holdAt = '', browser = { storage: new Map(), locks: new Set() } } = {}) {
  let active = A, stateIndex = 0, refIndex = 0, release
  const states = [], refs = [], effects = [], listeners = new Map(), requests = [], signed = [], grants = [], permissionInputs = []
  const barrier = new Promise(resolve => { release = resolve })
  let actual = { GlobalDESOLimit: remaining, NFTOperationLimitMap: { [HASH]: { 1: { nft_bid: permitted ? 1 : 0 } } } }
  const react = {
    useState(initial) { const i = stateIndex++; if (!(i in states)) states[i] = [ { publicKey: A }, 1, '0.01', true, 'idle', '', null, '' ][i] ?? initial; return [states[i], v => { states[i] = typeof v === 'function' ? v(states[i]) : v }] },
    useRef(initial) { const i = refIndex++; return refs[i] ??= { current: initial } },
    useEffect(fn) { effects.push(fn) }, useMemo: fn => fn(),
  }
  const switchAccount = () => { active = B; listeners.get('via:identity-session')?.forEach(fn => fn({ type: 'via:identity-session' })) }
  const identity = {
    currentUser: async () => { if (holdAt === 'identity') await barrier; return { publicKey: active } }, subscribe: () => () => {},
    spendingLimits: async () => { if (holdAt === 'spending') await barrier; if (switchAt === 'spending') switchAccount(); return actual },
    hasPermissions: async p => { permissionInputs.push(p); if (switchAt === 'permission') switchAccount(); return compareLimits(p, actual) },
    requestPermissions: async p => { grants.push(p); if (switchAt === 'grant') switchAccount(); if (confirmedGrant) actual = p },
    signTx: async hex => { signed.push({ hex, account: active }); if (switchAt === 'sign') switchAccount(); return signedHex },
    refreshSpendingLimits: async () => { if (refreshFails && requests.some(x => x.body?.action === 'submit')) throw new Error('REFRESH_FAILED') },
  }
  const context = {
    exports: {}, Event, Date, Error,
    window: {
      localStorage: { getItem(k) { if (storageFails === 'read') throw new Error('STORAGE'); return browser.storage.get(k) ?? null }, setItem(k,v) { if (storageFails === 'write' || storageFails === 'receipt' && k.endsWith(':submitted')) throw new Error('STORAGE'); browser.storage.set(k,v) }, removeItem(k) { browser.storage.delete(k) } },
      addEventListener(n,fn) { if (!listeners.has(n)) listeners.set(n,new Set()); listeners.get(n).add(fn) }, removeEventListener(n,fn) { listeners.get(n)?.delete(fn) }, dispatchEvent(e) { listeners.get(e.type)?.forEach(fn => fn(e)) },
    },
    navigator: { locks: locksAvailable ? { async request(name,options,fn) { if (browser.locks.has(name)) return fn(null); browser.locks.add(name); try { await fn({ name }) } finally { browser.locks.delete(name) } } } : undefined },
    fetch: async (url, options = {}) => {
      const body = options.body ? JSON.parse(options.body) : null; requests.push({ url, body })
      if (body?.action === 'prepare') { if (holdAt === 'prepare') await barrier; if (switchAt === 'prepare') switchAccount(); return { ok: true, json: async () => ({ ok: true, transactionHex, publicKey: A, postHash: HASH, serialNumber: 1, bidAmountNanos: 10_000_000, feeNanos: fee, spendAmountNanos: spend, balanceNanos: balance, preparedAt }) } }
      if (body?.action === 'submit') { assert.ok([...browser.storage.keys()].some(k => k.endsWith(':pending')), 'pending persisted before broadcast'); if (timeout) throw new Error('TIMEOUT'); return { ok: true, json: async () => { if (badJson) throw new Error('BAD_JSON'); return { ok: true, transaction: { TxnHashHex: TXHASH } } } } }
      if (String(url).startsWith('/api/via/financial-status?')) return { ok: true, json: async () => ({ ok: true, found: true }) }
      throw new Error('Unexpected fetch '+url)
    },
    require(name) {
      if (name === './nft-action-review') return { useNFTActionReview: () => async () => true }
      if (name === 'react') return react
      if (name === 'react/jsx-runtime') return require(name)
      if (name === './deso-identity-modern') return { viaModernIdentity: identity }
      if (name === './deso-identity-session') return { restoreIdentitySession: () => legacy ? null : ({ publicKey: active }), VIA_IDENTITY_EVENT: 'via:identity-session' }
      if (name === './financial-submission') { const exports = {}; vm.runInNewContext(compile(fs.readFileSync(path.join(__dirname,'../app/financial-submission.ts'),'utf8')), { ...context, exports }); return exports }
      throw new Error('Unexpected import '+name)
    },
  }
  const source = fs.readFileSync(path.join(__dirname,'../app/nft-bid-control.tsx'),'utf8').replace('if (editions.length === 0) return null', 'exports.__prepare = prepare; exports.__invalidate = invalidateSelection; if (editions.length === 0) return null')
  vm.runInNewContext(compile(source), context)
  function render() { stateIndex = 0; refIndex = 0; effects.length = 0; context.exports.default({ postHash: HASH, editions: [{ serialNumber: 1, ownerPublicKey: B, minBidAmountNanos: 1, buyNowPriceNanos: 10_000_000, isBuyNow: true }] }); effects.forEach(fn => fn()) }
  render()
  return { run: (buyNow=false) => context.exports.__prepare(buyNow), invalidate: () => context.exports.__invalidate(), render, release, requests, signed, grants, permissionInputs, states, browser,
    switchABA() { switchAccount(); active = A; listeners.get('via:identity-session')?.forEach(fn => fn({type:'via:identity-session'})) },
    unmount() { effects.forEach(fn => { const cleanup = fn(); if (typeof cleanup === 'function') cleanup() }) },
    storageABA() { listeners.get('storage')?.forEach(fn => fn({ type:'storage', key:'viaActivePublicKey', newValue:B })) },
  }
}
const submits = f => f.requests.filter(x => x.body?.action === 'submit').length
test('NFT normal bid uses exact cost and edition permissions, receipt and safe readback', async () => { const f=fixture(); await f.run(); assert.equal(submits(f),1); assert.equal(f.grants.length,0); assert.equal(f.permissionInputs[0].GlobalDESOLimit,10_001_000); assert.match(f.states[5],/geen bewijs/); assert.ok([...f.browser.storage.keys()].some(k=>k.endsWith(':submitted'))); assert.equal([...f.browser.storage.keys()].some(k=>k.endsWith(':pending')),false) })
test('Buy Now uses the same protected single-flight flow', async () => { const f=fixture(); await Promise.all([f.run(true),f.run(true)]); assert.equal(submits(f),1); assert.equal(f.requests[0].body.buyNow,true) })
test('two reentrant calls enter only one prepare/sign/submit', async () => { const f=fixture(); await Promise.all([f.run(),f.run()]); assert.equal(submits(f),1); assert.equal(f.signed.length,1) })
test('two components/tabs for one sender cannot construct concurrently', async () => { const browser={storage:new Map(),locks:new Set()}; const a=fixture({browser,holdAt:'prepare'}),b=fixture({browser}); const pending=a.run(); await new Promise(r=>setImmediate(r)); await b.run(); assert.equal(b.requests.length,0); a.release(); await pending; assert.equal(submits(a),1) })
test('A to B to A while currentUser awaits cannot pass its earlier account check', async () => { const f=fixture({holdAt:'identity'}); const pending=f.run(); await new Promise(r=>setImmediate(r)); f.switchABA(); f.release(); await pending; assert.equal(f.requests.length,0); assert.equal(f.signed.length,0) })
for (const switchAt of ['prepare','spending','permission','grant','sign']) test('account change at '+switchAt+' blocks broadcast', async () => { const f=fixture({switchAt,permitted:switchAt!=='grant'}); await f.run(); assert.equal(submits(f),0); if(switchAt!=='sign')assert.equal(f.signed.length,0) })
for (const mode of ['switchABA','storageABA','invalidate','unmount']) test(mode+' during prepare invalidates even if selection returns', async () => { const f=fixture({holdAt:'prepare'});const pending=f.run();await new Promise(r=>setImmediate(r));f[mode]();f.release();await pending;assert.equal(submits(f),0);assert.equal(f.signed.length,0) })
test('legacy fails closed before financial SDK permissions/signing', async () => { const f=fixture({legacy:true});await f.run();assert.equal(f.requests.length,0);assert.equal(f.signed.length,0) })
test('exact remaining budget requires no extra grant', async () => { const f=fixture({remaining:10_001_000});await f.run();assert.equal(f.grants.length,0);assert.equal(submits(f),1) })
test('short budget requests bounded extension and rechecks exact cost', async () => { const f=fixture({remaining:10_000_999});await f.run();assert.equal(f.grants[0].GlobalDESOLimit,20_001_999);assert.equal(f.permissionInputs[1].GlobalDESOLimit,10_001_000);assert.equal(submits(f),1) })
test('unconfirmed permission never signs or broadcasts', async () => { const f=fixture({permitted:false,confirmedGrant:false});await f.run();assert.equal(f.signed.length,0);assert.equal(submits(f),0) })
for(const options of [{fee:null},{fee:-1},{fee:0.5},{spend:NaN},{spend:Number.MAX_SAFE_INTEGER},{balance:0},{preparedAt:Date.now()-130000}])test('unsafe cost/balance/quote '+JSON.stringify(options)+' blocks signing',async()=>{const f=fixture(options);await f.run();assert.equal(f.signed.length,0);assert.equal(submits(f),0)})
for(const options of [{timeout:true},{badJson:true}])test('uncertain submit survives reload and is never retried '+JSON.stringify(options),async()=>{const f=fixture(options);await f.run();assert.equal(submits(f),1);assert.match(f.states[5],/onzeker/);const reload=fixture({browser:f.browser});await reload.run();assert.equal(reload.requests.length,0)})
test('successful submit plus failed refresh remains receipted after reload',async()=>{const f=fixture({refreshFails:true});await f.run();assert.equal(submits(f),1);const reload=fixture({browser:f.browser});await reload.run();assert.equal(reload.requests.length,0)})
for(const options of [{locksAvailable:false},{storageFails:'read'},{storageFails:'write'}])test('missing lock/storage fails closed '+JSON.stringify(options),async()=>{const f=fixture(options);await f.run();assert.equal(submits(f),0)})
test('receipt-write failure after acceptance retains pending and honest status',async()=>{const f=fixture({storageFails:'receipt'});await f.run();assert.equal(submits(f),1);assert.match(f.states[5],/ontvangen/);assert.ok([...f.browser.storage.keys()].some(k=>k.endsWith(':pending')))})
test('malformed unsigned hex fails before permissions/signing',async()=>{const f=fixture({transactionHex:'not-hex'});await f.run();assert.equal(f.permissionInputs.length,0);assert.equal(f.signed.length,0);assert.equal(submits(f),0)})
test('malformed signature fails before pending and broadcast',async()=>{const f=fixture({signedHex:'not-hex'});await f.run();assert.equal(submits(f),0);assert.equal([...f.browser.storage.keys()].some(k=>k.endsWith(':pending')),false)})

// Actual server preflight route, all node calls isolated.
function routeFixture({ price=10_000_000, owner=B, forSale=true, pending=false, balance=50_000_000, fee=1000, spend=0 }={}) {
 const calls=[];const context={exports:{},process:{env:{}},Date,require(name){if(name==='next/server')return{NextResponse:{json:(data,options={})=>({data,status:options.status??200})}};if(name==='../../../../deso-api')return{fetchDeSo:async(endpoint,options)=>{calls.push({endpoint,body:JSON.parse(options.body)});const data=endpoint==='get-nft-entries-for-nft-post'?{NFTEntryResponses:[{SerialNumber:1,OwnerPublicKeyBase58Check:owner,IsForSale:forSale,IsPending:pending,IsBuyNow:true,BuyNowPriceNanos:price,MinBidAmountNanos:1}]}:endpoint==='get-users-stateless'?{UserList:[{PublicKeyBase58Check:A,BalanceNanos:balance}]}:{TransactionHex:'00aa',FeeNanos:fee,SpendAmountNanos:spend};return{ok:true,json:async()=>data}}};throw new Error(name)}};
 vm.runInNewContext(compile(fs.readFileSync(path.join(__dirname,'../app/api/via/nft/bid/route.ts'),'utf8')),context)
 return{run:()=>context.exports.POST({json:async()=>({action:'prepare',publicKey:A,postHash:HASH,serialNumber:1,bidAmountNanos:10_000_000,buyNow:true,expectedOwnerPublicKey:B})}),calls}
}
test('server preflight preserves request amount/fees and returns exact bound quote',async()=>{const f=routeFixture();const r=await f.run();assert.equal(r.status,200);assert.equal(r.data.publicKey,A);assert.equal(r.data.bidAmountNanos,10_000_000);assert.equal(f.calls.at(-1).body.MinFeeRateNanosPerKB,1000);assert.deepEqual(Array.from(f.calls.at(-1).body.TransactionFees),[])})
for(const options of [{price:20_000_000},{owner:A},{forSale:false},{pending:true},{fee:null},{balance:0},{spend:0.5}])test('server rejects stale listing/invalid financial preflight '+JSON.stringify(options),async()=>{const f=routeFixture(options);const r=await f.run();assert.ok(r.status>=400);assert.equal(f.calls.some(x=>x.endpoint==='submit-transaction'),false)})
