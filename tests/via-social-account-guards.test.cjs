const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const components = {
  like: { file: 'like-button.tsx', props: { postHash: 'a'.repeat(64), initialCount: 0 }, label: 'Like · 0', states: { 0: { publicKey: 'account-A' } } },
  follow: { file: 'follow-button.tsx', props: { followedPublicKey: 'account-Z' }, label: 'Follow', states: { 0: { publicKey: 'account-A' }, 3: true } },
  repost: { file: 'repost-button.tsx', props: { postHash: 'a'.repeat(64), initialCount: 0 }, label: 'Repost · 0', states: { 0: { publicKey: 'account-A' } } },
}

function fixture(kind, switchAt) {
  const spec = components[kind]
  let activeKey = 'account-A'
  let stateIndex = 0
  const states = []
  const requests = []
  const signed = []
  const react = {
    useState(initial) {
      const slot = stateIndex++
      states[slot] = Object.hasOwn(spec.states, slot) ? spec.states[slot] : initial
      return [states[slot], (value) => { states[slot] = typeof value === 'function' ? value(states[slot]) : value }]
    },
    useEffect() {},
    useRef: (initial) => ({ current: initial }),
  }
  const identity = {
    currentUser: async () => ({ publicKey: activeKey }),
    subscribe: () => () => {},
    signTx: async (hex) => {
      signed.push(hex)
      if (switchAt === 'sign') activeKey = 'account-B'
      return 'signed-hex'
    },
    jwt: async () => 'unused-jwt',
  }
  const context = {
    exports: {},
    require(name) {
      if (name === 'react') return react
      if (name === 'react/jsx-runtime') return require(name)
      if (name === '../deso-identity-modern') return { viaModernIdentity: identity }
      if (name === 'lucide-react') return new Proxy({}, { get: () => () => null })
      if (name === './video-upload-control') return { default: () => null }
      throw new Error(`Unexpected import: ${name}`)
    },
    window: { dispatchEvent() {}, requestAnimationFrame(callback) { callback() } },
    Event, URL, FormData,
    fetch: async (url, options = {}) => {
      if (!options.body) return { ok: true, json: async () => ({ ok: true, following: false }) }
      const body = JSON.parse(options.body)
      requests.push({ url, body })
      if (body.action === 'prepare') {
        if (switchAt === 'prepare') activeKey = 'account-B'
        return { ok: true, json: async () => ({ ok: true, transactionHex: 'prepared-hex' }) }
      }
      return { ok: true, json: async () => ({ ok: true }) }
    },
  }
  const source = fs.readFileSync(path.join(__dirname, '../app/social', spec.file), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText
  vm.runInNewContext(compiled, context)
  const tree = context.exports.default(spec.props)
  const nodes = []
  function walk(value) {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!value || typeof value !== 'object') return
    nodes.push(value)
    walk(value.props?.children)
  }
  walk(tree)
  const button = nodes.find((node) => node.type === 'button' && node.props.children === spec.label)
  assert.ok(button, `${kind}: action button found in real component`)
  return {
    run: async () => {
      await button.props.onClick()
      await new Promise((resolve) => setImmediate(resolve))
      await new Promise((resolve) => setImmediate(resolve))
    },
    requests,
    signed,
  }
}

for (const kind of Object.keys(components)) {
  test(`${kind}: normal flow prepares, signs and submits`, async () => {
    const flow = fixture(kind)
    await flow.run()
    assert.equal(flow.requests.length, 2)
    assert.deepEqual(flow.signed, ['prepared-hex'])
    assert.equal(flow.requests[1].body.signedTransactionHex, 'signed-hex')
  })

  test(`${kind}: account change during prepare prevents signing and submit`, async () => {
    const flow = fixture(kind, 'prepare')
    await flow.run()
    assert.equal(flow.requests.length, 1)
    assert.equal(flow.signed.length, 0)
  })

  test(`${kind}: account change during signing prevents submit`, async () => {
    const flow = fixture(kind, 'sign')
    await flow.run()
    assert.equal(flow.requests.length, 1)
    assert.equal(flow.signed.length, 1)
  })
}
