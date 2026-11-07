// Run against a local production server. Synthetic account only; every write is blocked.
const { chromium, webkit, devices } = require('playwright')
const assert = require('node:assert/strict')

const base = process.env.VIA_TEST_BASE || 'http://127.0.0.1:3026'
const A = 'A'.repeat(48)
const users = { [A]: { publicKey: A, primaryDerivedKey: { publicKeyBase58Check: A, derivedPublicKeyBase58Check: A, derivedSeedHex: '11'.repeat(32), derivedKeyRegistered: true, IsValid: true, transactionSpendingLimits: { GlobalDESOLimit: 0, TransactionCountLimitMap: {} } } } }

async function run(name, engine, options) {
  const browser = await engine.launch(name === 'laptop' ? { channel: 'msedge', headless: true } : { headless: true })
  const context = await browser.newContext(options)
  const writes = []
  try {
    await context.addInitScript(({ A, users, origin }) => {
      if (window.top !== window || window.location.origin !== origin) return
      localStorage.setItem('desoIdentityUsers', JSON.stringify(users))
      localStorage.setItem('desoActivePublicKey', A)
    }, { A, users, origin: new URL(base).origin })
    await context.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (request.method() !== 'GET') {
        writes.push(`${request.method()} ${url.pathname}`)
        return route.fulfill({ status: 403, json: { ok: false, error: 'WRITES_BLOCKED_BY_BROWSER_TEST' } })
      }
      if (url.origin === new URL(base).origin && !url.pathname.startsWith('/api/')) return route.continue()
      if (url.pathname.includes('/get-single-derived-key/')) return route.fulfill({ json: { DerivedKey: { IsValid: true, TransactionSpendingLimit: { GlobalDESOLimit: 0, TransactionCountLimitMap: {} } } } })
      if (url.pathname === '/api/via/profile') return route.fulfill({ json: { ok: true, profile: { publicKey: A, username: 'VIA-Post-Test' } } })
      return route.fulfill({ status: 200, json: { ok: true, posts: [], entries: [], items: [] } })
    })
    const page = await context.newPage()
    const response = await page.goto(`${base}/social`, { waitUntil: 'domcontentloaded' })
    assert.equal(response.status(), 200)
    await page.waitForFunction(() => document.body.classList.contains('via-deso-session'))
    const send = page.getByRole('button', { name: 'Send', exact: true })
    await send.waitFor()
    const box = await send.boundingBox()
    assert.ok(box && box.x >= 0 && box.x + box.width <= options.viewport.width + 1, `${name}: Send escapes viewport`)
    const composer = await page.locator('#via-post-body').boundingBox()
    assert.ok(composer && composer.x >= 0 && composer.x + composer.width <= options.viewport.width + 1, `${name}: composer escapes viewport`)
    assert.deepEqual(writes, [], `${name}: browser smoke must remain read-only`)
  } finally {
    await browser.close()
  }
}

;(async () => {
  const cases = [
    ['laptop', chromium, { viewport: { width: 1440, height: 1000 } }],
    ['iphone', webkit, { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } }],
    ['ipad', webkit, { ...devices['iPad Pro 11'], viewport: { width: 834, height: 1194 } }],
  ]
  for (const entry of cases) await run(...entry)
  console.log('PASS: Post Office composer is read-only and contained on laptop, iPhone and iPad.')
})().catch((error) => { console.error(error); process.exitCode = 1 })
