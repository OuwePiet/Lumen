const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
let compareTransactionSpendingLimits
test.before(async () => {
  ;({ compareTransactionSpendingLimits } = await import('deso-protocol/src/identity/permissions-utils.js'))
})

// Execute the actual DiamondButton component and its prepare handler. React,
// Identity and HTTP are isolated boundaries: these tests never open Identity,
// sign a real transaction, broadcast to DeSo or spend DESO.
function fixture({
  legacy = false,
  switchAt = '',
  alreadyPermitted = true,
  spendAmountNanos = 10_000,
  feeNanos = 1_000,
  remainingBudget = alreadyPermitted ? 50_000 : 0,
  transferCount = 1,
  approvalConfirmed = true,
  browser = { storage: new Map(), locks: new Set() },
  submitTimeout = false,
  submitBadJson = false,
  refreshFails = false,
  storageFails = '',
  locksAvailable = true,
  activeAccount = 'account-A',
  postHash = 'a'.repeat(64),
  receiverPublicKey = 'account-R',
  holdAt = '',
  runEffects = false,
} = {}) {
  let activeKey = activeAccount
  let stateIndex = 0
  let refIndex = 0
  const refs = []
  const effects = []
  const listeners = new Map()
  let release
  const barrier = new Promise((resolve) => { release = resolve })
  let currentUserCalls = 0
  let permissionChecks = 0
  const states = []
  const calls = []
  const requests = []
  const permissionRequests = []
  const permissionChecksInput = []
  let actualPermissions = { GlobalDESOLimit: remainingBudget, TransactionCountLimitMap: { BASIC_TRANSFER: transferCount } }
  const levels = [{ level: 1, nanos: 10_000 }, { level: 2, nanos: 20_000 }]

  const react = {
    useState(initial) {
      const slot = stateIndex++
      if (!(slot in states)) states[slot] = slot === 7 ? levels : typeof initial === 'function' ? initial() : initial
      return [states[slot], (value) => {
        states[slot] = typeof value === 'function' ? value(states[slot]) : value
      }]
    },
    useEffect(fn) { effects.push(fn) },
    useRef(initial) { const slot = refIndex++; return refs[slot] ??= { current: initial } },
  }

  const identity = {
    async currentUser() {
      currentUserCalls += 1
      if (switchAt === 'before-permission' && currentUserCalls === 2) activeKey = 'account-B'
      if (switchAt === 'before-signing' && currentUserCalls === 5) activeKey = 'account-B'
      return { publicKey: activeKey }
    },
    async spendingLimits() {
      calls.push('spending-limits')
      if (holdAt === 'spending') await barrier
      if (switchAt === 'spending') activeKey = 'account-B'
      return actualPermissions
    },
    async hasPermissions(permissions) {
      permissionChecks += 1
      permissionChecksInput.push(permissions)
      calls.push(`has-permissions-${permissionChecks}`)
      if (switchAt === 'after-permission' && permissionChecks === (alreadyPermitted ? 1 : 2)) activeKey = 'account-B'
      return compareTransactionSpendingLimits(permissions, actualPermissions)
    },
    async requestPermissions(permissions) {
      calls.push('request-permissions')
      if (holdAt === 'permission') await barrier
      if (switchAt === 'request-permissions') activeKey = 'account-B'
      permissionRequests.push(permissions)
      if (approvalConfirmed) actualPermissions = permissions
    },
    async signTx(hex) {
      calls.push(`sign:${hex}`)
      if (holdAt === 'sign') await barrier
      if (switchAt === 'before-submit') activeKey = 'account-B'
      return 'signed-hex'
    },
    async refreshSpendingLimits() {
      calls.push('refresh-spending-limits')
      if (refreshFails) throw new Error('REFRESH_FAILED')
    },
  }

  const context = {
    exports: {},
    require(name) {
      if (name === 'react') return react
      if (name === 'react/jsx-runtime') return require(name)
      if (name === 'lucide-react') return { Gem: () => null }
      if (name === '../deso-identity-modern') return { viaModernIdentity: identity }
      if (name === '../deso-identity-session') {
        return {
          restoreIdentitySession: () => activeKey ? { publicKey: activeKey } : null,
          restoreLegacyIdentitySession: () => legacy ? { publicKey: activeKey } : null,
          VIA_IDENTITY_EVENT: 'via:identity-session',
        }
      }
      if (name === './diamond-submission') {
        const exports = {}
        const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app/social/diamond-submission.ts'), 'utf8'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
        }).outputText
        vm.runInNewContext(code, { ...context, exports })
        return exports
      }
      if (name === '../via-live-rates') return { fetchViaRates: async () => ({ rates: { USD: 10 } }) }
      throw new Error(`Unexpected import: ${name}`)
    },
    fetch: async (url, options = {}) => {
      const body = options.body ? JSON.parse(options.body) : null
      if (body?.action === 'levels') return { ok: true, json: async () => ({ ok: true, diamondLevelMap: { 1: 10_000 } }) }
      requests.push({ url, body })
      if (body?.action === 'prepare') {
        if (holdAt === 'prepare') await barrier
        if (switchAt === 'prepare') activeKey = 'account-B'
        return {
          ok: true,
          json: async () => ({
            ok: true,
            transactionHex: 'prepared-hex',
            diamondLevel: body.diamondLevel,
            spendAmountNanos,
            feeNanos,
          }),
        }
      }
      if (body?.action === 'submit') {
        assert.ok([...browser.storage.keys()].some((key) => key.endsWith(':pending')), 'persist uncertainty before HTTP submit')
        if (holdAt === 'submit') await barrier
        if (submitTimeout) throw new Error('NETWORK_TIMEOUT')
        if (submitBadJson) return { ok: true, json: async () => { throw new Error('BAD_JSON') } }
        return { ok: true, json: async () => ({ ok: true }) }
      }
      if (String(url).startsWith('/api/via/post?')) {
        return { ok: true, json: async () => ({ ok: true, post: { diamondCount: 7 } }) }
      }
      throw new Error(`Unexpected request: ${url}`)
    },
    window: {
      setTimeout() {},
      addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn) },
      removeEventListener(name, fn) { listeners.get(name)?.delete(fn) },
      dispatchEvent(event) { listeners.get(event.type)?.forEach((fn) => fn(event)) },
      localStorage: {
        getItem(key) { if (storageFails === 'read') throw new Error('STORAGE_READ'); return browser.storage.get(key) ?? null },
        setItem(key, value) { if (storageFails === 'write' || (storageFails === 'receipt' && key.endsWith(':submitted'))) throw new Error('STORAGE_WRITE'); browser.storage.set(key, value) },
        removeItem(key) { if (storageFails === 'remove') throw new Error('STORAGE_REMOVE'); browser.storage.delete(key) },
      },
    },
    navigator: { locks: locksAvailable ? {
      async request(name, options, callback) {
        if (browser.locks.has(name)) return callback(null)
        browser.locks.add(name)
        try { return await callback({ name }) } finally { browser.locks.delete(name) }
      },
    } : undefined },
    document: { addEventListener() {}, removeEventListener() {} },
    AbortController,
    Event,
    Error,
    Node: class Node {},
  }

  const source = fs.readFileSync(path.join(__dirname, '../app/social/diamond-button.tsx'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  vm.runInNewContext(compiled, context)
  let confirm
  const cleanups = []
  function render() {
  stateIndex = 0; refIndex = 0; effects.length = 0
  const tree = context.exports.default({ postHash, receiverPublicKey, initialCount: 3 })
  const nodes = []
  function walk(value) {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!value || typeof value !== 'object') return
    nodes.push(value)
    walk(value.props?.children)
  }
  walk(tree)
  confirm = nodes.find((node) => node.type === 'button' && JSON.stringify(node.props.children).includes('Bevestig'))
  assert.ok(confirm, 'actual DiamondButton confirmation action must be rendered')
  if (runEffects && cleanups.length === 0) effects.forEach((fn) => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup) })
  }
  render()

  return {
    async run() {
      confirm.props.onClick()
      // The UI handler intentionally starts `void prepare(...)`; drain its
      // promise chain before asserting the isolated Identity/HTTP boundaries.
      for (let index = 0; index < 8; index += 1) await new Promise((resolve) => setImmediate(resolve))
    },
    click: () => confirm.props.onClick(),
    render,
    unmount: () => cleanups.forEach((fn) => fn()),
    release: () => release(),
    switchAccount(key) { activeKey = key; context.window.dispatchEvent(new Event('via:identity-session')) },
    storageSelection(key) { context.window.dispatchEvent(Object.assign(new Event('storage'), { key: 'viaActivePublicKey', newValue: key })) },
    disabled: () => confirm.props.disabled,
    browser,
    calls,
    requests,
    states,
    permissionRequests,
    permissionChecksInput,
    signed: () => calls.some((call) => call.startsWith('sign:')),
    submitted: () => requests.some((request) => request.body?.action === 'submit'),
  }
}

test('valid SDK account completes the existing Diamond prepare, permission, sign and submit flow', async () => {
  const flow = fixture()
  await flow.run()
  assert.deepEqual(Array.from(flow.calls), [
    'spending-limits',
    'has-permissions-1',
    'sign:prepared-hex',
    'refresh-spending-limits',
  ])
  assert.deepEqual(Array.from(flow.requests, (request) => request.body?.action ?? 'readback'), ['prepare', 'submit', 'readback'])
  assert.equal(flow.states[4], 'done')
  assert.equal(flow.states[1], 7, 'displayed count must come from official post readback')
})

test('two immediate confirmation clicks enter only one financial flow', async () => {
  const flow = fixture()
  flow.click()
  await flow.run()
  assert.equal(flow.requests.filter((request) => request.body?.action === 'prepare').length, 1)
  assert.equal(flow.requests.filter((request) => request.body?.action === 'submit').length, 1)
})

test('two components/tabs cannot prepare concurrently for the same account', async () => {
  const browser = { storage: new Map(), locks: new Set() }
  const first = fixture({ browser, holdAt: 'prepare' })
  const second = fixture({ browser })
  await first.run()
  await second.run()
  assert.equal(first.requests.length, 1)
  assert.equal(second.requests.length, 0)
  first.release()
  await new Promise((resolve) => setImmediate(resolve))
  await second.run()
  assert.equal(first.requests.filter((request) => request.body?.action === 'submit').length, 1)
  assert.equal(second.submitted(), false)
})

test('an uncertain HTTP submission survives remount and blocks all Diamonds for that sender', async () => {
  const first = fixture({ submitTimeout: true })
  await first.run()
  assert.equal(first.submitted(), true)
  assert.ok([...first.browser.storage.keys()].some((key) => key.endsWith(':pending')))
  const reloaded = fixture({ browser: first.browser, postHash: 'b'.repeat(64), runEffects: true })
  await reloaded.run()
  reloaded.render()
  assert.equal(reloaded.disabled(), true)
  assert.equal(reloaded.requests.length, 0)
  assert.match(reloaded.states[9], /niet bevestigd/)
})

test('bad submit JSON retains uncertainty and never automatically retries', async () => {
  const flow = fixture({ submitBadJson: true })
  await flow.run()
  await flow.run()
  assert.equal(flow.requests.filter((request) => request.body?.action === 'submit').length, 1)
  assert.ok([...flow.browser.storage.keys()].some((key) => key.endsWith(':pending')))
})

test('a successful submit remains completed after permission refresh failure and reload', async () => {
  const flow = fixture({ refreshFails: true })
  await flow.run()
  assert.equal(flow.states[4], 'done')
  assert.ok([...flow.browser.storage.keys()].some((key) => key.endsWith(':submitted')))
  assert.equal([...flow.browser.storage.keys()].some((key) => key.endsWith(':pending')), false)
  const reloaded = fixture({ browser: flow.browser })
  await reloaded.run()
  assert.equal(reloaded.requests.length, 0)
  assert.match(reloaded.states[9], /al naar DeSo verzonden/)
})

test('a higher Diamond level is allowed after a recorded successful lower level', async () => {
  const first = fixture()
  await first.run()
  const upgrade = fixture({ browser: first.browser })
  upgrade.states[0] = 2
  upgrade.render()
  await upgrade.run()
  assert.equal(upgrade.requests[0].body.diamondLevel, 2)
  assert.equal(upgrade.submitted(), true)
})

test('pending account A cannot be retried by switching away and back, but does not block account B', async () => {
  const first = fixture({ submitTimeout: true })
  await first.run()
  const second = fixture({ browser: first.browser, activeAccount: 'account-B' })
  await second.run()
  assert.equal(second.requests[0].body.senderPublicKey, 'account-B')
  assert.equal(second.submitted(), true)
  second.switchAccount('account-A')
  await second.run()
  assert.equal(second.requests.filter((request) => request.body?.action === 'submit').length, 1)
})

test('missing Web Locks fails closed before preparation and signing', async () => {
  const flow = fixture({ locksAvailable: false })
  await flow.run()
  assert.equal(flow.requests.length, 0)
  assert.equal(flow.signed(), false)
  assert.match(flow.states[5], /actuele browser/)
})

test('unavailable storage fails closed before preparation', async () => {
  const flow = fixture({ storageFails: 'read' })
  await flow.run()
  assert.equal(flow.requests.length, 0)
  assert.equal(flow.signed(), false)
})

test('failure to persist pending state prevents broadcast', async () => {
  const flow = fixture({ storageFails: 'write' })
  await flow.run()
  assert.equal(flow.signed(), true)
  assert.equal(flow.submitted(), false)
})

test('failure to save a successful receipt retains the pending guard', async () => {
  const flow = fixture({ storageFails: 'receipt' })
  await flow.run()
  assert.equal(flow.states[4], 'done')
  const reloaded = fixture({ browser: flow.browser })
  await reloaded.run()
  assert.equal(reloaded.submitted(), false)
  assert.match(reloaded.states[9], /niet bevestigd/)
})

test('failure to clear pending after saving receipt remains safely blocked', async () => {
  const flow = fixture({ storageFails: 'remove' })
  await flow.run()
  const reloaded = fixture({ browser: flow.browser })
  await reloaded.run()
  assert.equal(reloaded.requests.length, 0)
})

test('corrupt pending state has no timeout and cannot be silently discarded', async () => {
  const browser = { storage: new Map([['via:social:diamond:v1:account-A:pending', 'not-json']]), locks: new Set() }
  const flow = fixture({ browser })
  await flow.run()
  assert.equal(flow.requests.length, 0)
  assert.equal(browser.storage.size, 1)
})

test('corrupt successful receipt fails closed before preparation', async () => {
  const browser = { storage: new Map([['via:social:diamond:v1:account-A:' + 'a'.repeat(64) + ':account-R:submitted', 'not-json']]), locks: new Set() }
  const flow = fixture({ browser })
  await flow.run()
  assert.equal(flow.requests.length, 0)
})

test('switching accounts while permissions are requested prevents signing', async () => {
  const flow = fixture({ remainingBudget: 0, switchAt: 'request-permissions' })
  await flow.run()
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('a switch during spending-limit lookup prevents requesting permission for the wrong account', async () => {
  const flow = fixture({ remainingBudget: 0, switchAt: 'spending' })
  await flow.run()
  assert.equal(flow.permissionRequests.length, 0)
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('A to B to A during preparation invalidates the confirmed operation', async () => {
  const flow = fixture({ holdAt: 'prepare', runEffects: true })
  await flow.run()
  flow.switchAccount('account-B')
  flow.switchAccount('account-A')
  flow.release()
  await flow.run()
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('delayed cross-tab storage events invalidate A to B to A even when storage already reads A', async () => {
  const flow = fixture({ holdAt: 'prepare', runEffects: true })
  await flow.run()
  flow.storageSelection('account-B')
  flow.storageSelection('account-A')
  flow.release()
  await flow.run()
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('guest confirmation sends no HTTP request or signing request', async () => {
  const flow = fixture({ activeAccount: null })
  await flow.run()
  assert.equal(flow.requests.length, 0)
  assert.equal(flow.signed(), false)
})

test('unmount during signing prevents later broadcast from the abandoned component', async () => {
  const flow = fixture({ holdAt: 'sign', runEffects: true })
  await flow.run()
  assert.equal(flow.signed(), true)
  flow.unmount()
  flow.release()
  await flow.run()
  assert.equal(flow.submitted(), false)
})

test('a component remounted while HTTP submit is pending cannot start another request', async () => {
  const first = fixture({ holdAt: 'submit' })
  await first.run()
  assert.equal(first.submitted(), true)
  const reloaded = fixture({ browser: first.browser })
  await reloaded.run()
  assert.equal(reloaded.requests.length, 0)
  first.release()
  await new Promise((resolve) => setImmediate(resolve))
})

test('pre-submit account failure releases the flight lock and permits a reviewed new attempt', async () => {
  const flow = fixture({ switchAt: 'prepare' })
  await flow.run()
  assert.equal(flow.submitted(), false)
  flow.switchAccount('account-B')
  await flow.run()
  assert.equal(flow.submitted(), true)
  assert.equal(flow.requests[1].body.senderPublicKey, 'account-B')
})

test('persisted ledger contains only account/action metadata, never signed hex or credentials', async () => {
  const flow = fixture()
  await flow.run()
  const receipt = JSON.parse([...flow.browser.storage.values()][0])
  assert.deepEqual(Object.keys(receipt).sort(), ['level', 'postHash', 'publicKey', 'receiverPublicKey', 'startedAt'])
  assert.equal(receipt.publicKey, 'account-A')
  assert.equal(receipt.receiverPublicKey, 'account-R')
})

test('a sufficient finite remaining budget uses the SDK comparison without another approval', async () => {
  const flow = fixture({ remainingBudget: 50_000 })
  await flow.run()
  assert.equal(flow.permissionRequests.length, 0)
  assert.equal(flow.permissionChecksInput[0].GlobalDESOLimit, 11_000)
  assert.equal(flow.submitted(), true)
})

test('an exact remaining budget needs no new approval', async () => {
  const flow = fixture({ remainingBudget: 11_000 })
  await flow.run()
  assert.equal(flow.permissionRequests.length, 0)
  assert.equal(flow.submitted(), true)
})

test('insufficient remaining budget requests approval and rechecks the actual action cost', async () => {
  const flow = fixture({ remainingBudget: 10_999 })
  await flow.run()
  assert.equal(flow.permissionRequests.length, 1)
  assert.equal(flow.permissionRequests[0].GlobalDESOLimit, 21_999)
  assert.equal(flow.permissionChecksInput[1].GlobalDESOLimit, 11_000)
  assert.equal(flow.submitted(), true)
})

test('missing BASIC_TRANSFER permission still requires approval even with enough budget', async () => {
  const flow = fixture({ remainingBudget: 50_000, transferCount: 0 })
  await flow.run()
  assert.equal(flow.permissionRequests.length, 1)
  assert.equal(flow.submitted(), true)
})

test('unconfirmed approval never signs or broadcasts', async () => {
  const flow = fixture({ remainingBudget: 0, approvalConfirmed: false })
  await flow.run()
  assert.equal(flow.permissionRequests.length, 1)
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('legacy account fails closed before SDK permission lookup, signing or broadcast', async () => {
  const flow = fixture({ legacy: true })
  await flow.run()
  assert.deepEqual(Array.from(flow.calls), [])
  assert.equal(flow.requests.length, 0)
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
  assert.equal(flow.states[4], 'error')
})

test('account switch before permission lookup prevents permission checks, signing and broadcast', async () => {
  const flow = fixture({ switchAt: 'before-permission' })
  await flow.run()
  assert.deepEqual(Array.from(flow.calls), [])
  assert.equal(flow.requests.length, 1)
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('account switch after permission confirmation prevents signing and broadcast', async () => {
  const flow = fixture({ switchAt: 'after-permission', alreadyPermitted: false })
  await flow.run()
  assert.deepEqual(Array.from(flow.calls), [
    'spending-limits',
    'has-permissions-1',
    'request-permissions',
    'has-permissions-2',
  ])
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('account switch immediately before signing prevents signing and broadcast', async () => {
  const flow = fixture({ switchAt: 'before-signing' })
  await flow.run()
  assert.deepEqual(Array.from(flow.calls), ['spending-limits', 'has-permissions-1'])
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('account switch after signing but before submit prevents broadcast', async () => {
  const flow = fixture({ switchAt: 'before-submit' })
  await flow.run()
  assert.equal(flow.signed(), true)
  assert.equal(flow.submitted(), false)
  assert.deepEqual(Array.from(flow.requests, (request) => request.body?.action), ['prepare'])
})

test('unsafe spend plus fee is rejected before permission lookup, signing or broadcast', async () => {
  const flow = fixture({ spendAmountNanos: Number.MAX_SAFE_INTEGER, feeNanos: 1 })
  await flow.run()
  assert.deepEqual(Array.from(flow.calls), [])
  assert.equal(flow.requests.length, 1)
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
  assert.equal(flow.states[4], 'error')
})

test('every tested guard failure prevents broadcast and all pre-sign guards prevent signing', async (t) => {
  const cases = [
    ['legacy', { legacy: true }, false],
    ['before permission', { switchAt: 'before-permission' }, false],
    ['after permission', { switchAt: 'after-permission', alreadyPermitted: false }, false],
    ['before signing', { switchAt: 'before-signing' }, false],
    ['before submit', { switchAt: 'before-submit' }, true],
    ['invalid spend limit', { spendAmountNanos: Number.MAX_SAFE_INTEGER, feeNanos: 1 }, false],
  ]
  for (const [name, options, signingExpected] of cases) {
    await t.test(name, async () => {
      const flow = fixture(options)
      await flow.run()
      assert.equal(flow.signed(), signingExpected)
      assert.equal(flow.submitted(), false)
    })
  }
})
