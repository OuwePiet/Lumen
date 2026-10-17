const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const A = 'A'.repeat(48), B = 'B'.repeat(48), OLD = 'C'.repeat(48)
const user = publicKey => ({ publicKey, primaryDerivedKey: { publicKeyBase58Check: publicKey, derivedKeyRegistered: true } })
const tick = () => new Promise(resolve => setImmediate(resolve))
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText

function fixture({ active = A, legacy = OLD, users = { [A]: user(A), [B]: user(B) } } = {}) {
  const storage = new Map([
    ['desoIdentityUsers', JSON.stringify(users)], ['identityUsersV2', JSON.stringify({ [legacy]: { encryptedSeedHex: 'encrypted-fixture', accessLevelHmac: 'fixture', accessLevel: 3 } })],
    ['viaActivePublicKey', legacy], ['via:financial:v1:test:pending', 'keep-pending'],
  ])
  if (active) storage.set('desoActivePublicKey', active)
  const events = new EventTarget()
  const window = { location: { origin: 'https://via.example' }, addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events) }
  const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }
  const calls = [], subscribers = []
  let loginResolve, loginReject
  const sdk = {
    configure(options) { calls.push(['configure', options]) },
    async subscribe(fn) { subscribers.push(fn) },
    login() { calls.push(['login']); return new Promise((resolve, reject) => { loginResolve = resolve; loginReject = reject }) },
    setActiveUser(publicKey) { storage.set('desoActivePublicKey', publicKey); subscribers.forEach(fn => fn({})) },
    async snapshot() { return { currentUser: user(storage.get('desoActivePublicKey')) } },
    async hasPermissions() { calls.push(['hasPermissions']); return false },
    async requestPermissions() { calls.push(['requestPermissions']); return {} },
    async refreshDerivedKeyPermissions() { calls.push(['refresh']) },
    async signTx() { calls.push(['sign']); return 'mock-signed' },
    async jwt() { calls.push(['jwt']); return 'mock-jwt' },
    async encryptMessage() { return 'mock-encrypted' },
    async decryptMessage() { return { DecryptedMessage: 'mock-decrypted' } },
  }
  const sessionExports = {}, modernExports = {}
  const context = { window, localStorage, CustomEvent, console, exports: sessionExports }
  vm.runInNewContext(compile('deso-identity-session.ts'), context)
  vm.runInNewContext(compile('deso-identity-modern.ts'), { ...context, exports: modernExports, require(name) { if (name === 'deso-protocol') return { identity: sdk }; if (name === './deso-identity-session') return sessionExports; throw new Error('Unexpected legacy import: '+name) } })
  return { storage, localStorage, window, calls, sdk, session: sessionExports, identity: modernExports.viaModernIdentity,
    resolveLogin() { loginResolve({ publicKeyBase58Check: A }) }, rejectLogin() { loginReject(new Error('cancelled')) },
    emitSDK() { subscribers.forEach(fn => fn({})) },
    event(type, fields = {}) { const event = new Event(type); Object.assign(event, fields); events.dispatchEvent(event) },
  }
}

test('canonical active SDK account wins over a different old account', async () => { const f = fixture(); assert.equal(f.session.restoreIdentitySession().publicKey, A); assert.equal((await f.identity.currentUser()).publicKey, A) })
test('legacy-only account is never silently restored as SDK login', async () => { const f = fixture({ active: null }); assert.equal(f.session.restoreIdentitySession(), null); assert.equal(await f.identity.currentUser(), null) })
test('a returned publicKeyAdded without registered SDK credentials is not a login', async () => { const f = fixture({ users: { [A]: { publicKey: A } } }); assert.equal(await f.identity.currentUser(), null); await assert.rejects(f.identity.setActiveUser(A)); await f.identity.logout(); assert.equal(f.storage.has('desoActivePublicKey'), false) })
test('pending/unregistered derived key does not expose a logged-in session', () => { const f = fixture({ users: { [A]: { ...user(A), primaryDerivedKey: { ...user(A).primaryDerivedKey, derivedKeyRegistered: false } } } }); assert.equal(f.session.restoreIdentitySession(), null) })
test('mismatched SDK owner fails closed', () => { const f = fixture({ users: { [A]: { ...user(A), primaryDerivedKey: user(B).primaryDerivedKey } } }); assert.equal(f.session.restoreIdentitySession(), null) })
test('corrupt SDK storage does not fall back to legacy', () => { const f = fixture(); f.storage.set('desoIdentityUsers', '{'); assert.equal(f.session.restoreIdentitySession(), null) })
test('unavailable browser storage fails closed', () => { const f = fixture(); f.localStorage.getItem = () => { throw new Error('blocked') }; assert.equal(f.session.restoreIdentitySession(), null) })
test('known accounts contain registered SDK users only', async () => { const f = fixture(); assert.deepEqual(Array.from(await f.identity.alternateUsers(), u => u.publicKey), [A, B]) })
test('switch uses SDK and removes only obsolete selection', async () => { const f = fixture(); await f.identity.setActiveUser(B); assert.equal((await f.identity.currentUser()).publicKey, B); assert.equal(f.storage.has('viaActivePublicKey'), false); assert.ok(f.storage.has('identityUsersV2')) })
test('legacy-only switch is rejected before SDK operation', async () => { const f = fixture(); await assert.rejects(f.identity.setActiveUser(OLD)); assert.equal(f.storage.get('desoActivePublicKey'), A) })
test('logout cannot resurrect SDK or legacy account after navigation', async () => { const f = fixture(); await f.identity.logout(); assert.equal(await f.identity.currentUser(), null); assert.equal(f.storage.has('desoActivePublicKey'), false); assert.equal(f.storage.has('viaActivePublicKey'), false); assert.ok(f.storage.has('desoIdentityUsers')); assert.ok(f.storage.has('identityUsersV2')); assert.equal(f.storage.get('via:financial:v1:test:pending'), 'keep-pending') })
test('all subscribers update immediately on local logout', async () => { const f = fixture(); const seen = []; f.identity.subscribe(u => seen.push(u?.publicKey ?? null)); await f.identity.logout(); assert.equal(seen.at(-1), null) })
test('SDK login event updates all pages', () => { const f = fixture({ active: null }); const seen = []; f.identity.subscribe(u => seen.push(u?.publicKey ?? null)); f.storage.set('desoActivePublicKey', B); f.emitSDK(); assert.equal(seen.at(-1), B) })
test('storage account switch updates other tabs', () => { const f = fixture(); const seen = []; f.identity.subscribe(u => seen.push(u?.publicKey ?? null)); f.storage.set('desoActivePublicKey', B); f.event('storage', { key: 'desoActivePublicKey', newValue: B }); assert.equal(seen.at(-1), B) })
test('storage clear logs out other tabs', () => { const f = fixture(); const seen = []; f.identity.subscribe(u => seen.push(u?.publicKey ?? null)); f.storage.clear(); f.event('storage', { key: null }); assert.equal(seen.at(-1), null) })
test('back-forward cache restore and focus re-read canonical session', () => { const f = fixture(); const seen = []; f.identity.subscribe(u => seen.push(u?.publicKey ?? null)); f.storage.set('desoActivePublicKey', B); f.event('pageshow'); assert.equal(seen.at(-1), B); f.storage.delete('desoActivePublicKey'); f.event('focus'); assert.equal(seen.at(-1), null) })
test('unsubscribed page receives no later updates', () => { const f = fixture(); let count = 0; const stop = f.identity.subscribe(() => count++); stop(); f.emitSDK(); assert.equal(count, 1) })
for (const device of ['iPhone', 'iPad', 'laptop']) {
  test(`${device}: login uses official SDK redirect to same-origin homepage`, async () => { const f = fixture(); const result = f.identity.login(); assert.equal(f.calls.find(c => c[0] === 'configure')[1].redirectURI, 'https://via.example/'); assert.equal(f.calls.find(c => c[0] === 'configure')[1].identityURI, 'https://identity.deso.org'); f.resolveLogin(); await result })
}
test('double click starts only one SDK login', async () => { const f = fixture(); const first = f.identity.login(); await assert.rejects(f.identity.login(), /already opening/); assert.equal(f.calls.filter(c => c[0] === 'login').length, 1); f.resolveLogin(); await first })
test('cancelled login allows explicit retry', async () => { const f = fixture(); const first = f.identity.login(); f.rejectLogin(); await assert.rejects(first); const retry = f.identity.login(); f.resolveLogin(); await retry; assert.equal(f.calls.filter(c => c[0] === 'login').length, 2) })
test('reading session, switching, and subscribing do not open login', async () => { const f = fixture(); await f.identity.currentUser(); f.identity.subscribe(() => {}); await f.identity.alternateUsers(); await f.identity.setActiveUser(B); assert.equal(f.calls.filter(c => c[0] === 'login').length, 0) })
test('permissions come from SDK, never implicit legacy true', async () => { const f = fixture(); assert.equal(await f.identity.hasPermissions({}), false); assert.equal(f.calls.filter(c => c[0] === 'hasPermissions').length, 1) })
test('JWT and signing use SDK account, no old iframe credentials', async () => { const f = fixture(); assert.equal(await f.identity.jwt(), 'mock-jwt'); assert.equal(await f.identity.signTx('mock-tx'), 'mock-signed') })
test('logged-out account cannot sign or request JWT', async () => { const f = fixture({ active: null }); await assert.rejects(f.identity.signTx('mock-tx')); await assert.rejects(f.identity.jwt()); assert.equal(f.calls.some(c => c[0] === 'jwt' || c[0] === 'sign'), false) })
test('account A→B→A during pending signing invalidates the result', async () => { const f = fixture(); let resolve; f.sdk.signTx = () => new Promise(r => { resolve = r }); const result = f.identity.signTx('mock-tx'); await f.identity.setActiveUser(B); await f.identity.setActiveUser(A); resolve('mock-signed'); await assert.rejects(result, /account changed/) })
test('cross-tab A→B→A invalidates pending JWT even when final storage is A', async () => { const f = fixture(); let resolve; f.sdk.jwt = () => new Promise(r => { resolve = r }); const result = f.identity.jwt(); f.event('storage', { key: 'desoActivePublicKey', newValue: B }); resolve('mock-jwt'); await assert.rejects(result, /account changed/) })
test('homepage no longer imports or opens legacy login', () => { const source = fs.readFileSync(path.join(__dirname, '../app/via-home-controls.tsx'), 'utf8'); assert.ok(source.includes('viaModernIdentity.login()')); assert.ok(!/persistIdentityLogin|DESO_LOGIN_URL|window\.open/.test(source)) })

test('all page and component imports avoid legacy login, JWT, signing and message adapters', () => {
  const app = path.join(__dirname, '../app')
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) { visit(file); continue }
      if (!/\.tsx?$/.test(file)) continue
      const source = fs.readFileSync(file, 'utf8')
      assert.ok(!/(?:from\s*|import\s*\()["'][^"']*(?:deso-identity-(?:jwt|sign|messages)|social\/identity-jwt)["']/.test(source), file)
      assert.ok(!/persistIdentityLogin|switchIdentitySession|accessLevelRequest=3/.test(source), file)
    }
  }
  visit(app)
})

test('installed SDK 3.4.1 really launches derive login by redirect, without popup or financial API', async () => {
  const { Identity } = await import('deso-protocol/src/identity/identity.js')
  const store = new Map(), requests = []
  const storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) }
  const browser = { location: { search: '', href: 'https://via.example/' }, open() { throw new Error('Popup must not open') } }
  const sdk = new Identity(browser, { get() { requests.push('get'); throw new Error('Unexpected API') }, post() { requests.push('post'); throw new Error('Financial API forbidden') } })
  sdk.configure({ storageProvider: storage, identityURI: 'https://identity.deso.org', nodeURI: 'https://node.deso.org', redirectURI: 'https://via.example/', appName: 'VIA' })
  void sdk.login().catch(() => {})
  for (let i = 0; i < 10 && !browser.location.href.includes('/derive?'); i++) await tick()
  const url = new URL(browser.location.href)
  assert.equal(url.origin, 'https://identity.deso.org')
  assert.equal(url.pathname, '/derive')
  assert.equal(url.searchParams.get('redirect_uri'), 'https://via.example/')
  assert.equal(requests.length, 0)
})
