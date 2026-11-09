const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

// Exercise the real PostComposer handlers with mocked React, Identity and HTTP
// boundaries. No DeSo login, signing or broadcast leaves this process.
function fixture({ parent = '', switchAt, submitTimeout = false, guest = false, failUpload = false } = {}) {
  let activeKey = 'account-A'
  let index = 0
  const states = []
  const requests = []
  const signed = []
  const revoked = []
  const react = {
    useState(initial) {
      const slot = index++
      states[slot] = slot === 0 ? (guest ? null : { publicKey: activeKey })
        : slot === 1 ? 'Text with a photo' : slot === 2 ? ['https://images.deso.org/example.webp'] : initial
      return [states[slot], (value) => { states[slot] = typeof value === 'function' ? value(states[slot]) : value }]
    },
    useEffect() {},
    useRef: () => ({ current: null }),
    useMemo: (fn) => fn(),
  }
  const identity = {
    currentUser: async () => ({ publicKey: activeKey }),
    jwt: async () => 'test-jwt',
    signTx: async (hex) => {
      signed.push(hex)
      if (switchAt === 'sign') activeKey = 'account-B'
      return 'signed-hex'
    },
  }
  const context = {
    exports: {},
    require(name) {
      if (name === 'react') return react
      if (name === 'react/jsx-runtime') return require(name)
      if (name === '../deso-identity-modern') return { viaModernIdentity: identity }
      if (name === './video-upload-control' || name === '../sponsor-platform') return { default: () => null }
      throw new Error(`Unexpected import: ${name}`)
    },
    window: { setTimeout, clearTimeout, localStorage: { removeItem() {} }, dispatchEvent() {} },
    AbortController, DOMException, Event, FormData,
    URL: class extends URL {
      static createObjectURL() { return 'blob:test-photo' }
      static revokeObjectURL(url) { revoked.push(url) }
    },
    fetch: async (url, options) => {
      if (url === '/api/via/social/image-upload') {
        requests.push({ url, body: options.body })
        if (switchAt === 'upload') activeKey = 'account-B'
        return { ok: !failUpload, json: async () => ({ ok: !failUpload, imageUrl: 'https://images.deso.org/new.webp' }) }
      }
      const body = JSON.parse(options.body)
      requests.push({ url, body })
      if (body.action === 'prepare') {
        if (switchAt === 'prepare') activeKey = 'account-B'
        return { ok: true, status: 200, json: async () => ({ ok: true, transactionHex: 'prepared-hex', feeNanos: 1000 }) }
      }
      if (submitTimeout) throw new DOMException('Timed out', 'AbortError')
      return { ok: true, status: 200, json: async () => ({ ok: true, transaction: {} }) }
    },
  }
  const source = fs.readFileSync(path.join(__dirname, '../app/social/post-composer.tsx'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  vm.runInNewContext(compiled, context)
  const tree = context.exports.default({ parentStakeID: parent })
  const nodes = []
  function walk(value) {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!value || typeof value !== 'object') return
    nodes.push(value)
    walk(value.props?.children)
  }
  walk(tree)
  const send = nodes.find((node) => node.type === 'button' && node.props.children === (parent ? 'Reply' : 'Send'))
  assert.ok(send)
  if (switchAt === 'before') activeKey = 'account-B'
  const photo = nodes.find((node) => node.type === 'input' && node.props.type === 'file')
  function selectPhoto(type = 'image/png') {
    const input = { files: [new File(['fixture'], 'photo.png', { type })], value: 'photo.png' }
    photo.props.onChange({ target: input, currentTarget: input })
    return new Promise((resolve) => setImmediate(resolve))
  }
  return { send: () => send.props.onClick(), selectPhoto, disabled: send.props.disabled, requests, signed, states, revoked }
}

test('rapid photo selections send a single upload and leave one confirmed attachment', async () => {
  const flow = fixture()
  await Promise.all([flow.selectPhoto(), flow.selectPhoto(), flow.send()])
  assert.equal(flow.requests.length, 1)
  assert.equal(flow.requests[0].body.get('publicKey'), 'account-A')
  assert.deepEqual(Array.from(flow.states[2]), ['https://images.deso.org/example.webp', 'https://images.deso.org/new.webp'])
  assert.equal(flow.states[3].length, 0)
  assert.deepEqual(flow.revoked, ['blob:test-photo'])
})

test('failed or cross-account photo uploads clear the preview without adding an attachment', async () => {
  for (const options of [{ failUpload: true }, { switchAt: 'upload' }]) {
    const flow = fixture(options)
    await flow.selectPhoto()
    assert.equal(flow.requests.length, 1)
    assert.deepEqual(flow.states[2], ['https://images.deso.org/example.webp'])
    assert.equal(flow.states[3].length, 0)
    assert.deepEqual(flow.revoked, ['blob:test-photo'])
  }
})

test('unsupported image types are rejected before the upload request', async () => {
  const flow = fixture()
  await flow.selectPhoto('image/heic')
  assert.equal(flow.requests.length, 0)
  assert.equal(flow.revoked.length, 0)
})

test('text and attached photo use the existing prepare/sign/submit route', async () => {
  const flow = fixture()
  assert.equal(flow.disabled, false)
  await flow.send()
  assert.equal(flow.requests.length, 2)
  assert.equal(flow.requests[0].url, '/api/via/social/post')
  assert.equal(flow.requests[0].body.publicKey, 'account-A')
  assert.equal(flow.requests[0].body.body, 'Text with a photo')
  assert.deepEqual(flow.requests[0].body.imageUrls, ['https://images.deso.org/example.webp'])
  assert.deepEqual(flow.signed, ['prepared-hex'])
  assert.equal(flow.requests[1].body.signedTransactionHex, 'signed-hex')
})

test('reply preserves the exact parent hash through the same route', async () => {
  const parent = 'a'.repeat(64)
  const flow = fixture({ parent })
  await flow.send()
  assert.equal(flow.requests[0].body.parentStakeID, parent)
})

test('two Send activations before a render only sign and submit once', async () => {
  const flow = fixture()
  await Promise.all([flow.send(), flow.send()])
  assert.equal(flow.requests.length, 2)
  assert.deepEqual(flow.signed, ['prepared-hex'])
  assert.equal(flow.requests.filter(({ body }) => body.action === 'submit').length, 1)
})

test('guest Send remains disabled despite valid text and photo', () => {
  assert.equal(fixture({ guest: true }).disabled, true)
})

test('account change before preparation sends no HTTP request', async () => {
  const flow = fixture({ switchAt: 'before' })
  await flow.send()
  assert.equal(flow.requests.length, 0)
  assert.equal(flow.signed.length, 0)
  assert.equal(flow.states[1], 'Text with a photo')
  assert.match(flow.states[10], /account changed/i)
})

test('account change during preparation prevents signing', async () => {
  const flow = fixture({ switchAt: 'prepare' })
  await flow.send()
  assert.equal(flow.requests.length, 1)
  assert.equal(flow.signed.length, 0)
})

test('account change during signing prevents broadcasting', async () => {
  const flow = fixture({ switchAt: 'sign' })
  await flow.send()
  assert.equal(flow.signed.length, 1)
  assert.equal(flow.requests.length, 1)
  assert.equal(flow.states[1], 'Text with a photo')
})

test('ambiguous submission preserves the draft', async () => {
  const flow = fixture({ submitTimeout: true })
  await flow.send()
  assert.equal(flow.states[9], 'error')
  assert.equal(flow.states[1], 'Text with a photo')
  assert.match(flow.states[10], /not confirmed.*do not send twice/i)
  assert.doesNotMatch(flow.states[10], /Nothing was/i)
})
