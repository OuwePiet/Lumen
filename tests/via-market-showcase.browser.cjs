const { chromium, webkit, devices } = require('playwright')
const assert = require('node:assert/strict')

const base = process.env.VIA_TEST_BASE || 'http://127.0.0.1:3038'
const hash = 'a'.repeat(64)

async function run(name, engine, options) {
  const browser = await engine.launch(name === 'laptop' ? { channel: 'msedge', headless: true } : { headless: true })
  const context = await browser.newContext(options)
  const writes = []
  try {
    await context.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (!['GET', 'HEAD'].includes(request.method())) writes.push(`${request.method()} ${url.pathname}`)
      if (url.origin === base && url.pathname === '/api/via/market/showcase') {
        return route.fulfill({ json: { ok: true, source: 'deso-nft-showcase', checkedAt: Date.now(), items: [{ hash, title: 'Public artwork', creator: 'Creator', image: '', forSale: 2, buyNowNanos: 1_500_000_000 }] } })
      }
      if (url.origin !== base || url.pathname.startsWith('/api/')) return route.fulfill({ json: {} })
      return route.continue()
    })

    const page = await context.newPage()
    page.setDefaultTimeout(20_000)
    const response = await page.goto(`${base}/market`, { waitUntil: 'domcontentloaded' })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { name: 'VIA-Emporium', exact: true }).waitFor()
    await page.getByRole('heading', { name: 'Public DeSo selection', exact: true }).waitFor()
    await page.getByText('Public artwork', { exact: true }).waitFor()
    assert.equal(await page.getByText(/not a complete market index/i).count(), 1)
    assert.equal(await page.locator('#market-account-heading').count(), 1)
    assert.equal(await page.locator(`a[href="/nft/${hash}?returnTo=market"]`).count(), 1)
    assert.equal(await page.locator('section[aria-labelledby="public-nft-selection"]').evaluate((element) => element.scrollWidth > element.clientWidth + 1), false, `${name}: VIA-Emporium overflow`)
    assert.deepEqual(writes, [], `${name}: public browsing must not issue writes`)
  } finally {
    await browser.close()
  }
}

;(async () => {
  const cases = [
    ['laptop', chromium, { viewport: { width: 1440, height: 1000 } }],
    ['iphone', webkit, devices['iPhone 13']],
    ['ipad', webkit, devices['iPad Pro 11']],
    ['ipad-landscape', webkit, devices['iPad Pro 11 landscape']],
  ]
  for (const [name, engine, options] of cases) await run(name, engine, options)
  console.log('PASS: VIA-Emporium public showcase on laptop, iPhone, iPad and iPad landscape; no writes or showcase overflow.')
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
