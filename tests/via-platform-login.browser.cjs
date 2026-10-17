// Run against a local production server. Requires Playwright via NODE_PATH.
// Synthetic public accounts; all external browser traffic and all API writes blocked.
const { chromium, webkit, devices } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.VIA_TEST_BASE || 'http://127.0.0.1:3026'
const out = process.env.VIA_TEST_OUTPUT || path.resolve(__dirname, '../../../outputs/VIA-platform-login-browserbewijs')
fs.mkdirSync(out, { recursive: true })
const A = 'A'.repeat(48), B = 'B'.repeat(48)
const users = Object.fromEntries([A, B].map(publicKey => [publicKey, { publicKey, primaryDerivedKey: { publicKeyBase58Check: publicKey, derivedPublicKeyBase58Check: publicKey, derivedKeyRegistered: true, IsValid: true, transactionSpendingLimits: { GlobalDESOLimit: 0, TransactionCountLimitMap: {} } } }]))
const results = []

async function run(name, engine, options) {
  const browser = await engine.launch(name === 'laptop-edge' ? { channel: 'msedge', headless: true } : { headless: true })
  const context = await browser.newContext(options)
  const errors = [], reportedErrors = [], browserWarnings = [], forbidden = [], identityLaunches = [], requests = []
  let replacingDocument = false
  try {
    await context.exposeBinding('__viaUnhandled', (_source, message) => errors.push(message))
    await context.addInitScript(() => {
      window.addEventListener('error', event => {
        if (event.error) void window.__viaUnhandled(String(event.error?.message || event.message))
      })
      window.addEventListener('unhandledrejection', event => { void window.__viaUnhandled(String(event.reason?.message || event.reason)) })
    })
    await context.addInitScript(({ A, users, origin }) => {
      if (window.top !== window || window.location.origin !== origin) return
      if (localStorage.getItem('via-test-initialized')) return
      localStorage.setItem('via-test-initialized', '1')
      localStorage.setItem('desoIdentityUsers', JSON.stringify(users))
      localStorage.setItem('desoActivePublicKey', A)
      localStorage.setItem('viaActivePublicKey', 'C'.repeat(48))
      localStorage.setItem('via:financial:v1:fixture:pending', 'preserve')
    }, { A, users, origin: new URL(base).origin })
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url())
      if (url.origin === 'https://identity.deso.org') {
        const permissions = JSON.parse(decodeURIComponent(url.searchParams.get('transactionSpendingLimitResponse')))
        identityLaunches.push({ pathname: url.pathname, redirect: url.searchParams.get('redirect_uri'), feeBudget: permissions.GlobalDESOLimit })
        return route.fulfill({ contentType: 'text/html', body: '<h1>Identity intercepted — no real login or signing</h1>' })
      }
      if (url.origin !== new URL(base).origin) {
        if (request.method() !== 'GET' && !['/api/v0/get-user-dm-threads-ordered-by-timestamp'].includes(url.pathname)) forbidden.push(url.pathname)
        if (url.pathname.includes('/get-single-derived-key/')) return route.fulfill({ json: { DerivedKey: { IsValid: true, TransactionSpendingLimit: { GlobalDESOLimit: 0, TransactionCountLimitMap: {} } } } })
        return route.fulfill({ status: 200, json: {} })
      }
      if (!url.pathname.startsWith('/api/')) return route.continue()
      const safeReadPost = url.pathname === '/api/via/social/notifications' && ['unread', undefined].includes(request.postDataJSON()?.action)
      if (request.method() !== 'GET' && !safeReadPost) { forbidden.push(url.pathname); return route.fulfill({ status: 403, json: { ok: false, error: 'FINANCIAL_WRITES_FORBIDDEN_IN_TEST' } }) }
      requests.push(url.pathname + url.search)
      const key = url.searchParams.get('identity') || url.searchParams.get('publicKey') || A
      const username = key === B ? 'VIA-Test-B' : 'VIA-Test-A'
      let data = { ok: true, posts: [], entries: [], notifications: [], messages: [], items: [], unreadCount: 0, total: 0 }
      if (url.pathname === '/api/via/profile') data = { ok: true, profile: { publicKey: key, username, description: 'Synthetic browser fixture', profilePic: null, coverPhoto: null, creatorBasisPoints: 0, stakeMultipleBasisPoints: 12500, isHidden: false, followersCount: 0, followingCount: 0, coinPriceDeSoNanos: 0 } }
      if (url.pathname === '/api/via/wallet') data = { ok: true, wallet: { publicKey: key, balanceNanos: 0, unminedBalanceNanos: 0, balanceDeSo: 0, creatorCoinHoldings: [] } }
      return route.fulfill({ json: data })
    })
    const page = await context.newPage()
    page.on('pageerror', error => reportedErrors.push({ message: error.message, pathname: new URL(page.url()).pathname, replacingDocument }))
    async function replace(action) { replacingDocument = true; try { return await action() } finally { replacingDocument = false } }
    page.setDefaultTimeout(15000)
    await replace(() => page.goto(base, { waitUntil: 'networkidle' }))
    await page.getByRole('button', { name: 'Switch account', exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Switch account', exact: true }).count(), 1)
    await page.getByRole('button', { name: 'Switch account', exact: true }).click()
    assert.equal(await page.getByRole('menu').getByText('Active account', { exact: true }).count(), 1)
    await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('menu').count(), 0)
    await page.getByRole('button', { name: 'Switch account', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Logout', exact: true }).waitFor()
    await page.getByRole('menuitem', { name: '@VIA-Test-B', exact: true }).click()
    await page.waitForFunction(B => localStorage.getItem('desoActivePublicKey') === B, B)
    await page.getByRole('button', { name: 'Switch account', exact: true }).waitFor()
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => document.querySelector('.via-home-grid-account-wrap button')?.textContent.includes('@VIA-Test-B'))
    await page.screenshot({ path: path.join(out, name + '-homepage.png'), fullPage: true })
    const visibleControl = await page.getByRole('button', { name: 'Switch account', exact: true }).boundingBox()
    assert.ok(visibleControl && visibleControl.x >= 0 && visibleControl.x + visibleControl.width <= options.viewport.width + 1)
    for (const pathname of ['/profile', '/wallet', '/notifications', '/messages', '/studio', '/profile/edit', '/profile/coin', '/profile/connections', '/collection', '/market', '/social']) {
      await replace(() => page.goto(base + pathname, { waitUntil: 'networkidle' }))
      await page.waitForFunction(() => document.body.classList.contains('via-deso-session'))
      assert.equal(await page.evaluate(() => localStorage.getItem('desoActivePublicKey')), B)
      assert.equal(identityLaunches.length, 0, 'navigation must never request another login')
    }
    // A second live tab must react to the account switch and sign-out.
    const second = await context.newPage()
    await second.goto(base + '/wallet', { waitUntil: 'networkidle' })
    await second.waitForFunction(() => document.body.classList.contains('via-deso-session'))
    await replace(() => page.goto(base, { waitUntil: 'networkidle' }))
    await page.getByRole('button', { name: 'Switch account', exact: true }).click()
    await page.getByRole('menuitem', { name: '@VIA-Test-A', exact: true }).click()
    await second.waitForFunction(A => document.body.textContent.includes(A), A)
    await second.waitForFunction(() => document.querySelector('.via-site-header-account-button')?.textContent.includes('@VIA-Test-A'))
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Switch account', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Logout', exact: true }).click()
    await second.waitForFunction(() => document.body.classList.contains('via-no-deso-session'))
    await page.getByRole('button', { name: 'DeSo Login', exact: true }).waitFor()
    await page.waitForLoadState('networkidle')
    await replace(() => page.reload({ waitUntil: 'networkidle' }))
    await page.getByRole('button', { name: 'DeSo Login', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => localStorage.getItem('desoActivePublicKey')), null)
    assert.equal(await page.evaluate(() => localStorage.getItem('viaActivePublicKey')), null)
    assert.equal(await page.evaluate(() => localStorage.getItem('via:financial:v1:fixture:pending')), 'preserve')
    assert.equal(await page.getByRole('menu').count(), 0, 'logged-out homepage has a direct login button, not an empty account menu')
    assert.equal(identityLaunches.length, 0, 'logout and reload never launch Identity automatically')
    await page.screenshot({ path: path.join(out, name + '-uitgelogd.png'), fullPage: true })
    await page.waitForLoadState('networkidle')
    await replace(async () => { await page.getByRole('button', { name: 'DeSo Login', exact: true }).click(); await page.waitForURL('https://identity.deso.org/**') })
    assert.deepEqual(identityLaunches, [{ pathname: '/derive', redirect: base + '/', feeBudget: 10000000 }])
    // Exercise real SDK callback parsing for an already authorized alternate account.
    // Existing stored user B bypasses authorization/signing; financial POSTs remain forbidden.
    await replace(() => page.goto(base, { waitUntil: 'networkidle' }))
    await page.evaluate(A => localStorage.setItem('desoActivePublicKey', A), A)
    const callback = new URL(base)
    callback.searchParams.set('service', 'identity')
    callback.searchParams.set('method', 'derive')
    callback.searchParams.set('payload', JSON.stringify({ publicKeyBase58Check: B, derivedPublicKeyBase58Check: B }))
    await replace(() => page.goto(callback.href, { waitUntil: 'networkidle' }))
    await page.waitForFunction(B => document.body.classList.contains('via-deso-session') && localStorage.getItem('desoActivePublicKey') === B, B)
    await page.waitForFunction(() => window.location.search === '')
    assert.deepEqual(forbidden, [], 'no signing/financial/write requests')
    const unexpected = reportedErrors.filter(error => {
      // WebKit/Windows reports cancelled same-origin reads on document replacement
      // as pageerror console messages (Playwright #42823/#43120). Keep the evidence.
      const expected = name !== 'laptop-edge' && error.replacingDocument &&
        /due to access control checks\.$/.test(error.message) &&
        (error.message.includes('_rsc=') || error.message.includes('/api/via/profile?identity=')) &&
        error.message.includes(new URL(base).host)
      if (expected) browserWarnings.push(error)
      return !expected
    })
    assert.deepEqual(unexpected, [], 'no unexpected browser-reported errors')
    assert.deepEqual(errors, [], 'no actual window errors or unhandled promise rejections')
    results.push({ name, result: 'PASS', viewport: options.viewport, engine: name === 'laptop-edge' ? 'Chromium/Edge' : 'Playwright WebKit', pages: 11, accountSwitch: 'A-B-A', crossTabLogout: true, SDKRedirectAndExistingAccountCallback: true, realLogin: false, physicalDevice: false, financialWrites: forbidden.length, pageErrors: errors, browserWarnings, requests })
  } catch (error) {
    results.push({ name, result: 'FAIL', error: error.stack, pageErrors: errors, reportedErrors, forbidden })
    throw error
  } finally { await browser.close(); fs.writeFileSync(path.join(out, 'resultaten.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)) }
}

;(async () => {
  const cases = [
    ['laptop-edge', chromium, { viewport: { width: 1440, height: 1000 } }],
    ['iphone-webkit', webkit, { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } }],
    ['ipad-webkit', webkit, { ...devices['iPad Pro 11'], viewport: { width: 834, height: 1194 } }],
    ['iphone-small-webkit', webkit, { ...devices['iPhone SE'], viewport: { width: 375, height: 667 } }],
    ['iphone-landscape-webkit', webkit, { ...devices['iPhone 13 landscape'], viewport: { width: 844, height: 390 } }],
    ['ipad-landscape-webkit', webkit, { ...devices['iPad Pro 11 landscape'], viewport: { width: 1194, height: 834 } }],
  ]
  const filter = process.env.VIA_TEST_SCREEN_FILTER?.split(',')
  for (const [name, engine, options] of cases) if (!filter || filter.includes(name)) await run(name, engine, options)
  console.log('PASS: '+results.map(r => r.name).join(', ')+'; no real Identity login, signing, transactions or physical device tests.')
})().catch(error => { console.error(error); process.exitCode = 1 })
