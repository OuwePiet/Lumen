const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const A = 'A'.repeat(40), B = 'B'.repeat(40)
function fixture({ legacy = true } = {}) {
  const entries = new Map([
    ['desoActivePublicKey', B],
    ['desoIdentityUsers', JSON.stringify({ [B]: { publicKey: B, primaryDerivedKey: {} } })],
    ['identityUsersV2', JSON.stringify({ [A]: { encryptedSeedHex: 'encrypted', accessLevelHmac: 'hmac', accessLevel: 3 } })],
  ])
  if (legacy) entries.set('viaActivePublicKey', A)
  const storage = {
    get length() { return entries.size },
    key: (i) => [...entries.keys()][i] ?? null,
    getItem: (k) => entries.get(k) ?? null,
    setItem: (k, v) => entries.set(k, v),
    removeItem: (k) => entries.delete(k), clear: () => entries.clear(),
  }
  const listeners = new Map(), cache = {}, notifications = []
  let provider
  const identity = {
    configure: ({ storageProvider }) => { provider = storageProvider },
    subscribe: (fn) => notifications.push(fn),
    snapshot() {
      const users = JSON.parse(provider.getItem('desoIdentityUsers') || '{}')
      return { currentUser: users[provider.getItem('desoActivePublicKey')] ?? null }
    },
  }
  const window = {
    localStorage: storage,
    addEventListener: (k, fn) => listeners.set(k, fn),
    removeEventListener: (k) => listeners.delete(k),
    dispatchEvent: (e) => listeners.get(e.type)?.(e),
    setInterval: () => 1, clearInterval() {}, setTimeout: () => 2, clearTimeout() {},
  }
  function load(name) {
    if (name === 'deso-protocol') return { identity }
    if (name === 'deso-protocol/src/identity/constants.js') return { DEFAULT_PERMISSIONS: { GlobalDESOLimit: 10000000 } }
    if (cache[name]) return cache[name]
    const exports = cache[name] = {}
    const source = fs.readFileSync(path.join(__dirname, '../app', name + '.ts'), 'utf8')
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
    vm.runInNewContext(code, { exports, require: load, window, localStorage: storage,
      CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail } } })
    return exports
  }
  const session = load('./deso-identity-session')
  return { session, identity, storage, window, listeners, get provider() { return provider } }
}

test('existing legacy selection wins over a conflicting SDK selection without moving credentials', () => {
  const f = fixture()
  assert.equal(f.session.restoreIdentitySession().publicKey, A)
  assert.equal(f.identity.snapshot().currentUser, null)
  assert.equal(JSON.parse(f.storage.getItem('desoIdentityUsers'))[B].publicKey, B)
})

test('SDK selection is visible to unchanged legacy page readers with no invented credentials', () => {
  const f = fixture()
  f.session.restoreIdentitySession()
  f.provider.setItem('desoActivePublicKey', B)
  assert.equal(f.session.restoreIdentitySession().publicKey, B)
  assert.equal(f.session.restoreIdentitySession().accessLevel, 0)
  assert.equal(f.session.restoreLegacyIdentitySession(), null)
  assert.equal(f.session.getIdentityCredentials(B), null)
})

test('existing SDK-only sessions migrate the selector without another login', () => {
  const f = fixture({ legacy: false })
  assert.equal(f.session.restoreIdentitySession().publicKey, B)
  assert.equal(f.storage.getItem('viaActivePublicKey'), B)
})

test('legacy switch selects one account for both boundaries', () => {
  const f = fixture({ legacy: false })
  f.session.restoreIdentitySession()
  f.session.switchIdentitySession(A)
  assert.equal(f.session.restoreIdentitySession().publicKey, A)
  assert.equal(f.identity.snapshot().currentUser, null)
})

test('clearing selection cannot resurrect a stale SDK account after navigation', () => {
  const f = fixture({ legacy: false })
  f.session.restoreIdentitySession()
  f.session.clearIdentitySession(B)
  assert.equal(f.session.restoreIdentitySession(), null)
  assert.equal(f.identity.snapshot().currentUser, null)
  assert.equal(f.storage.getItem('desoActivePublicKey'), null)
})

test('legacy logout validates both the Identity origin and its popup before clearing anything', async () => {
  const f = fixture()
  const popup = { closed: false, close() { this.closed = true }, postMessage() {} }
  f.window.open = (url) => { assert.ok(url.includes('/logout?publicKey=' + A)); return popup }
  let completed = false
  const promise = f.session.logoutLegacyIdentity(A).then(() => { completed = true })
  const response = { service: 'identity', method: 'login', payload: { users: {} } }
  const receive = f.listeners.get('message')
  receive({ origin: 'https://example.com', source: popup, data: response })
  receive({ origin: 'https://identity.deso.org', source: {}, data: response })
  await Promise.resolve()
  assert.equal(completed, false)
  assert.equal(f.session.restoreLegacyIdentitySession().publicKey, A)
  receive({ origin: 'https://identity.deso.org', source: popup, data: response })
  await promise
  assert.equal(completed, true)
  assert.equal(popup.closed, true)
})

test('a blocked legacy logout popup retains the working session', async () => {
  const f = fixture()
  f.window.open = () => null
  await assert.rejects(f.session.logoutLegacyIdentity(A), /blocked/)
  assert.equal(f.session.restoreLegacyIdentitySession().publicKey, A)
})
