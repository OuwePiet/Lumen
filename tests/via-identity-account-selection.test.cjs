const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

// Execute the actual adapter with isolated Identity boundaries. No credentials,
// popups, node requests or on-chain transactions are used by these tests.
function adapterFixture({ failLogin = false, failSwitch = false } = {}) {
  const legacyUsers = new Map([['account-A', { publicKey: 'account-A' }]])
  let selectedLegacy = 'account-A'
  let sdkUser = null
  const calls = []
  const listeners = new Map()
  const sdkListeners = []
  const identity = {
    configure() {},
    snapshot: async () => ({ currentUser: sdkUser, alternateUsers: {} }),
    login: async () => {
      if (failLogin) throw new Error('LOGIN_CANCELLED')
      sdkUser = { publicKey: 'account-B' }
      sdkListeners.forEach((listener) => listener())
      return { publicKeyBase58Check: 'account-B' }
    },
    setActiveUser: async (publicKey) => {
      if (failSwitch) throw new Error('SWITCH_FAILED')
      sdkUser = { publicKey }
      sdkListeners.forEach((listener) => listener())
    },
    signTx: async (hex) => {
      calls.push(['sdk-sign', sdkUser?.publicKey, hex])
      return 'sdk-signed'
    },
    subscribe(listener) {
      sdkListeners.push(listener)
      void Promise.resolve().then(listener)
    },
  }
  const session = {
    VIA_IDENTITY_EVENT: 'via:identity-session',
    restoreIdentitySession: () => legacyUsers.get(selectedLegacy) ?? null,
    listIdentitySessions: () => [...legacyUsers.values()],
    switchIdentitySession: (key) => {
      if (!legacyUsers.has(key)) return null
      selectedLegacy = key
      return legacyUsers.get(key)
    },
    clearIdentitySession: () => {
      selectedLegacy = null
      listeners.get('via:identity-session')?.()
    },
  }
  const modules = {
    'deso-protocol': { identity },
    './deso-identity-session': session,
    './deso-identity-sign': {
      signViaTransaction: async (key, hex) => {
        calls.push(['legacy-sign', key, hex])
        return 'legacy-signed'
      },
    },
    './deso-identity-jwt': {},
  }
  const source = fs.readFileSync(path.join(__dirname, '../app/deso-identity-modern.ts'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const context = {
    exports: {},
    require: (name) => {
      if (!(name in modules)) throw new Error(`Unexpected import: ${name}`)
      return modules[name]
    },
    window: { addEventListener: (name, callback) => listeners.set(name, callback) },
  }
  vm.runInNewContext(compiled, context)
  return { adapter: context.exports.viaModernIdentity, calls, legacyUsers }
}

test('SDK login selects the same account for the UI, composer and signer', async () => {
  const { adapter, calls, legacyUsers } = adapterFixture()
  assert.equal((await adapter.currentUser()).publicKey, 'account-A')
  const loggedIn = await adapter.login()
  assert.equal(loggedIn.publicKey, 'account-B')
  assert.equal((await adapter.currentUser()).publicKey, loggedIn.publicKey)
  await adapter.signTx('prepared-for-B')
  assert.deepEqual(calls, [['sdk-sign', 'account-B', 'prepared-for-B']])
  assert.equal(legacyUsers.has('account-A'), true, 'legacy credentials must remain available')
})

test('existing subscribers receive the new SDK account after login', async () => {
  const { adapter } = adapterFixture()
  const users = []
  const unsubscribe = adapter.subscribe((user) => users.push(user?.publicKey))
  await adapter.login()
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(users.at(-1), 'account-B')
  unsubscribe()
})

test('cancelled SDK login preserves the previous working legacy selection', async () => {
  const { adapter, calls } = adapterFixture({ failLogin: true })
  await assert.rejects(adapter.login(), /LOGIN_CANCELLED/)
  assert.equal((await adapter.currentUser()).publicKey, 'account-A')
  await adapter.signTx('prepared-for-A')
  assert.deepEqual(calls, [['legacy-sign', 'account-A', 'prepared-for-A']])
})

test('successful SDK switch removes the stale legacy selection', async () => {
  const { adapter, calls } = adapterFixture()
  await adapter.setActiveUser('account-B')
  assert.equal((await adapter.currentUser()).publicKey, 'account-B')
  await adapter.signTx('prepared-for-B')
  assert.deepEqual(calls, [['sdk-sign', 'account-B', 'prepared-for-B']])
})

test('failed SDK switch keeps the previous account usable', async () => {
  const { adapter } = adapterFixture({ failSwitch: true })
  await assert.rejects(adapter.setActiveUser('account-B'), /SWITCH_FAILED/)
  assert.equal((await adapter.currentUser()).publicKey, 'account-A')
})

test('explicitly selecting an existing legacy account keeps its Identity signer', async () => {
  const { adapter, calls } = adapterFixture()
  await adapter.login()
  await adapter.setActiveUser('account-A')
  assert.equal((await adapter.currentUser()).publicKey, 'account-A')
  await adapter.signTx('prepared-for-A')
  assert.deepEqual(calls, [['legacy-sign', 'account-A', 'prepared-for-A']])
})
