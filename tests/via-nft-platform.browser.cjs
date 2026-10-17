// Only run with the isolated production server preloaded with via-nft-browser-node-fixture.cjs.
// All wallets/assets below are synthetic. No real login, permission grant, signature or broadcast.
const { chromium, webkit, devices } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.VIA_TEST_BASE || 'http://127.0.0.1:3028'
const out = process.env.VIA_TEST_OUTPUT || path.resolve(__dirname, '../../../outputs/VIA-nft-platform-browserbewijs-2026-10-17')
fs.mkdirSync(out, { recursive: true })
const A = 'BC1'+'A'.repeat(48), B = 'BC1'+'B'.repeat(48), HASH = 'a'.repeat(64), ID = '1'.repeat(64)
const users = Object.fromEntries([A,B].map(publicKey => [publicKey, { publicKey, primaryDerivedKey: { publicKeyBase58Check: publicKey, derivedPublicKeyBase58Check: publicKey, derivedSeedHex: '11'.repeat(32), derivedKeyRegistered: true, IsValid: true, transactionSpendingLimits: { GlobalDESOLimit: 0, TransactionCountLimitMap: {} } } }]))
const results = []
async function run(name, engine, options) {
  const browser = await engine.launch(name === 'laptop-edge' ? { channel: 'msedge', headless: true } : { headless: true })
  const context = await browser.newContext(options)
  const errors = [], reported = [], forbidden = [], prepares = []
  let replacing = false
  let page
  try {
    await context.exposeBinding('__viaError', (_, message) => errors.push(message))
    await context.addInitScript(({ A, users, origin }) => {
      window.addEventListener('error', event => { if (event.error) void window.__viaError(event.message) })
      window.addEventListener('unhandledrejection', event => void window.__viaError(String(event.reason?.message || event.reason)))
      if (window.top !== window || location.origin !== origin || localStorage.getItem('via-nft-test')) return
      localStorage.setItem('via-nft-test', '1')
      localStorage.setItem('desoIdentityUsers', JSON.stringify(users)); localStorage.setItem('desoActivePublicKey', A)
    }, { A, users, origin: new URL(base).origin })
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url()), own = url.origin === new URL(base).origin
      if (!own) {
        const endpoint = url.pathname.replace(/^\/api\/v0\//, '')
        if (url.hostname === 'identity.deso.org' || !['GET','HEAD'].includes(request.method()) && !['get-nfts-for-user','get-posts-for-public-key','get-users-stateless'].includes(endpoint)) {
          forbidden.push(url.href); return route.fulfill({ status: 403, json: { error: 'IDENTITY_OR_WRITES_FORBIDDEN' } })
        }
        if (endpoint.startsWith('get-single-derived-key/')) return route.fulfill({ json: { DerivedKey: { IsValid: true, TransactionSpendingLimit: { GlobalDESOLimit: 0, TransactionCountLimitMap: {} } } } });
        let data = {}
        const body = request.method() === 'POST' ? request.postDataJSON() : {}
        if (endpoint === 'get-users-stateless') data = { UserList: [{ PublicKeyBase58Check: A, BalanceNanos: 100000000 }, { PublicKeyBase58Check: B, BalanceNanos: 100000000 }] }
        if (endpoint === 'get-nfts-for-user') data = { NFTsMap: { [HASH]: { PostEntryResponse: { PostHashHex: HASH, Body: 'Synthetic VIA NFT browser fixture — not a real asset', IsNFT: true, IsHidden: false, HasUnlockable: false, ImageURLs: [], NumNFTCopies: 2 }, NFTEntryResponses: [{ SerialNumber: body.UserPublicKeyBase58Check === B ? 2 : 1, OwnerPublicKeyBase58Check: body.UserPublicKeyBase58Check, IsForSale: false, IsPending: false }] } } }
        if (endpoint === 'get-posts-for-public-key') data = { Posts: [], LastPostHashHex: '' }
        return route.fulfill({ json: data })
      }
      if (!url.pathname.startsWith('/api/')) return route.continue()
      if (request.method() !== 'GET') {
        const body = request.postDataJSON()
        if (url.pathname.startsWith('/api/via/nft/') && body?.action === 'prepare') {
          prepares.push(url.pathname)
          return route.fulfill({ json: { ok: true, transactionHex: 'aabb', feeNanos: 100, spendAmountNanos: 20000, balanceNanos: 100000000, publicKey: A, postHash: HASH, serialNumber: body.serialNumber, bidAmountNanos: body.bidAmountNanos, preparedAt: Date.now() } })
        }
        if (url.pathname === '/api/via/social/notifications' && ['unread',undefined].includes(body?.action)) return route.fulfill({ json: { ok: true, unreadCount: 0, notifications: [] } })
        forbidden.push(url.pathname); return route.fulfill({ status: 403, json: { error: 'WRITES_FORBIDDEN' } })
      }
      const publicKey = url.searchParams.get('identity') || url.searchParams.get('publicKey') || A
      let data = { ok: true, posts: [], items: [], entries: [], unreadCount: 0 }
      if (url.pathname === '/api/via/profile') data = { ok: true, profile: { publicKey, username: publicKey === B ? 'VIA-Test-B' : 'VIA-Test-A', description: 'Synthetic fixture', profilePic: null } }
      if (url.pathname === '/api/via/owner-key') data = { publicKey: A }
      if (url.pathname === '/api/via/nft/giveaway') return route.fulfill({ status: 503, json: { ok: false, configured: false, error: 'GIVEAWAY_STORAGE_NOT_CONFIGURED' } })
      return route.fulfill({ json: data })
    })
    page = await context.newPage(); page.setDefaultTimeout(15000)
    page.on('pageerror', error => reported.push({ message: error.message, replacing }))
    async function navigate(url) { replacing = true; try { await page.goto(base+url, { waitUntil: 'networkidle' }) } finally { replacing = false } }
    async function switchTo(username, key) {
      await page.getByRole('button', { name: 'Open VIA account menu', exact: true }).click()
      await page.getByRole('menuitem').filter({ hasText: username }).click()
      await page.waitForFunction(key => localStorage.getItem('desoActivePublicKey') === key, key)
      await page.waitForLoadState('networkidle')
    }
    await navigate('/collection/mine')
    await page.getByText('Active VIA account: '+A, { exact: true }).waitFor()
    await page.getByText('Synthetic VIA NFT browser fixture — not a real asset').first().waitFor()
    await switchTo('@VIA-Test-B', B)
    await page.getByText('Active VIA account: '+B, { exact: true }).waitFor()
    assert.equal(await page.getByText('Active VIA account: '+A, { exact: true }).count(), 0)
    await page.screenshot({ path: path.join(out, name+'-my-nfts.png'), fullPage: true })
    for (const route of ['/market','/market/my-bids','/market/received-bids']) {
      await navigate(route+'?account=active')
      await page.waitForURL(url => url.searchParams.get('publicKey') === B)
      await switchTo('@VIA-Test-A', A)
      await page.waitForURL(url => url.searchParams.get('publicKey') === A)
      await switchTo('@VIA-Test-B', B)
      await page.waitForURL(url => url.searchParams.get('publicKey') === B)
    }
    await navigate('/collection/mine'); await switchTo('@VIA-Test-A', A)
    await navigate('/nft/'+HASH)
    await page.getByRole('heading', { name: 'Manage sale', exact: true }).waitFor()
    await page.getByRole('checkbox', { name: 'I understand this is a real on-chain NFT sale-status transaction.', exact: true }).check()
    await page.getByRole('textbox', { name: 'Type BURN to confirm', exact: true }).fill('BURN')
    await page.getByRole('button', { name: 'Burn edition #1', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    await dialog.getByText('100', { exact: true }).first().waitFor()
    const box = await dialog.boundingBox()
    assert.ok(box && box.width <= options.viewport.width && box.x >= 0)
    await page.screenshot({ path: path.join(out, name+'-exact-review.png'), fullPage: true })
    await dialog.getByRole('button', { name: 'Annuleren', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.deepEqual(prepares, ['/api/via/nft/burn'])
    await navigate('/collections')
    await page.getByRole('heading', { name: 'Create a collection / series', exact: true }).waitFor()
    await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Synthetic local series')
    await page.getByRole('textbox', { name: 'NFT post hashes, one per line (maximum 50)', exact: true }).fill(HASH)
    await page.getByRole('button', { name: 'Save local draft', exact: true }).click()
    await page.getByText('Draft saved on this browser for this account.', { exact: false }).waitFor()
    await switchTo('@VIA-Test-B', B)
    assert.equal(await page.getByRole('textbox', { name: 'Title', exact: true }).inputValue(), '')
    await switchTo('@VIA-Test-A', A)
    await page.waitForFunction(() => Array.from(document.querySelectorAll('input')).some(input => input.value === 'Synthetic local series'))
    await navigate('/giveaway?id='+ID)
    await page.getByText('Diamond-claims, betaalde claims en automatische distributie zijn nog niet vrijgegeven.', { exact: false }).waitFor()
    await navigate('/studio')
    await page.getByRole('heading', { name: 'Before you mint', exact: true }).waitFor()
    await page.getByRole('checkbox', { name: 'I have reviewed this mint information for the active account.', exact: true }).check()
    await page.getByRole('button', { name: 'Continue to Mint', exact: true }).click()
    await page.getByRole('heading', { name: 'Choose media and storage', exact: true }).waitFor()
    await page.screenshot({ path: path.join(out, name+'-mint-review.png'), fullPage: true })
    await page.getByRole('button', { name: 'Open VIA account menu', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Logout from VIA', exact: true }).click()
    await navigate('/market?publicKey='+B)
    assert.equal(new URL(page.url()).searchParams.get('publicKey'), B, 'public market lookup must survive guest mode')
    await navigate('/collections?publicKey='+A)
    assert.equal(await page.getByRole('textbox', { name: 'Public publisher key', exact: true }).isVisible(), true)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    assert.equal(overflow, false, 'no horizontal page overflow')
    assert.deepEqual(forbidden, [], 'no real Identity, signing, permission or financial writes')
    assert.deepEqual(errors, [], 'no window errors or unhandled rejections')
    const warnings = reported.filter(entry => /due to access control checks\.$/.test(entry.message) && entry.message.includes(new URL(base).host))
    assert.deepEqual(reported.filter(entry => !warnings.includes(entry)), [], 'no unexpected engine errors')
    results.push({ name, result: 'PASS', viewport: options.viewport, accountSwitch: 'A-B-A', exactFinancialReviewCancelled: true, localDraftAccountIsolation: true, publicGuestRead: true, mockedUnsignedPrepares: prepares.length, realSigning: false, realFinancialTransactions: false, physicalDevice: false, errors, warnings })
  } catch (error) {
    if (page) fs.writeFileSync(path.join(out,name+'-overflow.json'), JSON.stringify(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left< -1||e.right>innerWidth+1).slice(0,25)})),null,2));
    const url = page?.url(); const body = page ? (await page.locator('body').innerText()).slice(0, 12000) : '';
    if (page) await page.screenshot({ path: path.join(out, name+'-failure.png'), fullPage: true });
    results.push({ name, result: 'FAIL', error: error.stack, url, body, errors, reported, forbidden, prepares })
    throw error
  } finally { await browser.close(); fs.writeFileSync(path.join(out,'resultaten.json'), JSON.stringify({ checkedAt: new Date().toISOString(), syntheticServerData: true, results }, null, 2)) }
}
;(async () => {
  const cases = [
    ['laptop-edge',chromium,{ viewport: { width: 1440,height:1000 } }],
    ['iphone-webkit',webkit,{ ...devices['iPhone 13'],viewport:{width:390,height:844} }],
    ['iphone-small-webkit',webkit,{ ...devices['iPhone SE'],viewport:{width:375,height:667} }],
    ['ipad-webkit',webkit,{ ...devices['iPad Pro 11'],viewport:{width:834,height:1194} }],
    ['iphone-landscape-webkit',webkit,{ ...devices['iPhone 13 landscape'],viewport:{width:844,height:390} }],
    ['ipad-landscape-webkit',webkit,{ ...devices['iPad Pro 11 landscape'],viewport:{width:1194,height:834} }],
  ]
  for (const [name,engine,options] of cases) if (!process.env.VIA_TEST_SCREEN_FILTER || process.env.VIA_TEST_SCREEN_FILTER.split(',').includes(name)) await run(name,engine,options)
  console.log('PASS: '+results.map(item => item.name).join(', ')+'; all data synthetic; no real signing, transactions or physical-device acceptance.')
})().catch(error => { console.error(error); process.exitCode=1 })
