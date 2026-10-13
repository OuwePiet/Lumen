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
} = {}) {
  let activeKey = 'account-A'
  let stateIndex = 0
  let currentUserCalls = 0
  let permissionChecks = 0
  const states = []
  const calls = []
  const requests = []
  const permissionRequests = []
  const permissionChecksInput = []
  let actualPermissions = { GlobalDESOLimit: remainingBudget, TransactionCountLimitMap: { BASIC_TRANSFER: transferCount } }
  const levels = [{ level: 1, nanos: 10_000 }]

  const react = {
    useState(initial) {
      const slot = stateIndex++
      if (slot === 7) states[slot] = levels
      else states[slot] = typeof initial === 'function' ? initial() : initial
      return [states[slot], (value) => {
        states[slot] = typeof value === 'function' ? value(states[slot]) : value
      }]
    },
    useEffect() {},
    useRef: () => ({ current: null }),
  }

  const identity = {
    async currentUser() {
      currentUserCalls += 1
      if (switchAt === 'before-permission' && currentUserCalls === 2) activeKey = 'account-B'
      if (switchAt === 'before-signing' && currentUserCalls === 4) activeKey = 'account-B'
      return { publicKey: activeKey }
    },
    async spendingLimits() {
      calls.push('spending-limits')
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
      permissionRequests.push(permissions)
      if (approvalConfirmed) actualPermissions = permissions
    },
    async signTx(hex) {
      calls.push(`sign:${hex}`)
      if (switchAt === 'before-submit') activeKey = 'account-B'
      return 'signed-hex'
    },
    async refreshSpendingLimits() {
      calls.push('refresh-spending-limits')
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
        return { restoreLegacyIdentitySession: () => legacy ? { publicKey: 'account-A' } : null }
      }
      if (name === '../via-live-rates') return { fetchViaRates: async () => ({ rates: { USD: 10 } }) }
      throw new Error(`Unexpected import: ${name}`)
    },
    fetch: async (url, options = {}) => {
      const body = options.body ? JSON.parse(options.body) : null
      requests.push({ url, body })
      if (body?.action === 'prepare') {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            transactionHex: 'prepared-hex',
            diamondLevel: 1,
            spendAmountNanos,
            feeNanos,
          }),
        }
      }
      if (body?.action === 'submit') return { ok: true, json: async () => ({ ok: true }) }
      if (String(url).startsWith('/api/via/post?')) {
        return { ok: true, json: async () => ({ ok: true, post: { diamondCount: 7 } }) }
      }
      throw new Error(`Unexpected request: ${url}`)
    },
    window: { setTimeout() {}, dispatchEvent() {} },
    document: { addEventListener() {}, removeEventListener() {} },
    AbortController,
    Event,
    Node: class Node {},
  }

  const source = fs.readFileSync(path.join(__dirname, '../app/social/diamond-button.tsx'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  vm.runInNewContext(compiled, context)
  const tree = context.exports.default({ postHash: 'a'.repeat(64), receiverPublicKey: 'account-R', initialCount: 3 })

  const nodes = []
  function walk(value) {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!value || typeof value !== 'object') return
    nodes.push(value)
    walk(value.props?.children)
  }
  walk(tree)
  const confirm = nodes.find((node) => node.type === 'button' && JSON.stringify(node.props.children).includes('Bevestig'))
  assert.ok(confirm, 'actual DiamondButton confirmation action must be rendered')

  return {
    async run() {
      confirm.props.onClick()
      // The UI handler intentionally starts `void prepare(...)`; drain its
      // promise chain before asserting the isolated Identity/HTTP boundaries.
      for (let index = 0; index < 8; index += 1) await new Promise((resolve) => setImmediate(resolve))
    },
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
  assert.equal(flow.requests.length, 1)
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
