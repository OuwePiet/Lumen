const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

// Execute the actual DiamondButton component and its private prepare handler.
// React, Identity and HTTP are isolated boundaries: no real Identity window is
// opened and no transaction is signed or submitted to DeSo by these tests.
function fixture({ initiallyPermitted = true, approvalConfirmed = true } = {}) {
  let stateIndex = 0
  let permissionChecks = 0
  let permitted = initiallyPermitted
  const states = []
  const calls = []
  const requests = []
  const levels = [{ level: 1, nanos: 10_000 }]

  const react = {
    useState(initial) {
      const slot = stateIndex++
      if (!(slot in states)) states[slot] = slot === 7 ? levels : typeof initial === 'function' ? initial() : initial
      return [states[slot], (value) => {
        states[slot] = typeof value === 'function' ? value(states[slot]) : value
      }]
    },
    useEffect() {},
    useRef: () => ({ current: null }),
  }

  const identity = {
    async currentUser() {
      calls.push('current-user')
      return { publicKey: 'account-A' }
    },
    async spendingLimits() {
      calls.push('spending-limits')
      return { GlobalDESOLimit: 50_000 }
    },
    async hasPermissions() {
      permissionChecks += 1
      calls.push(`has-permissions-${permissionChecks}`)
      // Yield once so a missing `await` cannot accidentally look correct.
      await new Promise((resolve) => setImmediate(resolve))
      return permitted
    },
    async requestPermissions() {
      calls.push('request-permissions')
      if (approvalConfirmed) permitted = true
    },
    async signTx(hex) {
      calls.push(`sign:${hex}`)
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
      if (name === '../via-live-rates') return { fetchViaRates: async () => ({ rates: { USD: 10 } }) }
      throw new Error(`Unexpected import: ${name}`)
    },
    fetch: async (url, options = {}) => {
      const body = options.body ? JSON.parse(options.body) : null
      if (body?.action === 'levels') return { ok: true, json: async () => ({ ok: true, diamondLevelMap: { 1: 10_000 } }) }
      requests.push({ url, body })
      if (body?.action === 'prepare') {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            transactionHex: 'prepared-hex',
            diamondLevel: 1,
            spendAmountNanos: 10_000,
            feeNanos: 1_000,
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
    Error,
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
  assert.ok(confirm, 'the actual DiamondButton confirmation action must be rendered')

  return {
    async run() {
      confirm.props.onClick()
      for (let index = 0; index < 10; index += 1) await new Promise((resolve) => setImmediate(resolve))
    },
    calls,
    requests,
    signed: () => calls.some((call) => call.startsWith('sign:')),
    submitted: () => requests.some((request) => request.body?.action === 'submit'),
  }
}

test('an already permitted SDK account signs without requesting approval', async () => {
  const flow = fixture()
  await flow.run()
  assert.equal(flow.calls.filter((call) => call === 'request-permissions').length, 0)
  assert.equal(flow.signed(), true)
  assert.equal(flow.submitted(), true)
})

test('an async false permission result is awaited before approval is requested', async () => {
  const flow = fixture({ initiallyPermitted: false })
  await flow.run()
  assert.deepEqual(Array.from(flow.calls).slice(1, 5), [
    'spending-limits',
    'has-permissions-1',
    'request-permissions',
    'has-permissions-2',
  ])
  assert.equal(flow.signed(), true)
  assert.equal(flow.submitted(), true)
})

test('an unconfirmed permission request never signs or submits', async () => {
  const flow = fixture({ initiallyPermitted: false, approvalConfirmed: false })
  await flow.run()
  assert.equal(flow.calls.filter((call) => call === 'request-permissions').length, 1)
  assert.equal(flow.signed(), false)
  assert.equal(flow.submitted(), false)
})

test('permission checks execute before the component reaches signing', async () => {
  const flow = fixture()
  await flow.run()
  const permissionIndex = flow.calls.indexOf('has-permissions-1')
  const signingIndex = flow.calls.findIndex((call) => call.startsWith('sign:'))
  assert.ok(permissionIndex >= 0)
  assert.ok(signingIndex > permissionIndex)
})
