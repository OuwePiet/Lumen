const { chromium, webkit, devices } = require('playwright')
const assert = require('node:assert/strict')

const base = process.env.VIA_TEST_BASE || 'http://127.0.0.1:3039'

async function run(name, engine, options) {
  const browser = await engine.launch(name === 'laptop' ? { channel: 'msedge', headless: true } : { headless: true })
  const context = await browser.newContext(options)
  try {
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url())
      if (url.origin !== base || url.pathname.startsWith('/api/')) return route.fulfill({ json: {} })
      return route.continue()
    })
    const page = await context.newPage()
    const response = await page.goto(`${base}/market`, { waitUntil: 'domcontentloaded' })
    assert.equal(response.status(), 200)
    await page.locator('.via-site-header').waitFor()
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, nav: document.querySelector('.via-site-header-nav')?.getBoundingClientRect(), tools: document.querySelector('.via-site-header-tools')?.getBoundingClientRect() }))
    assert.ok(dimensions.document <= dimensions.viewport + 1, `${name}: document ${dimensions.document}px > viewport ${dimensions.viewport}px`)
    assert.ok(dimensions.nav.right <= dimensions.viewport + 1, `${name}: navigation escapes viewport`)
    assert.ok(dimensions.tools.right <= dimensions.viewport + 1, `${name}: utilities escape viewport`)
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
  console.log('PASS: VIA header remains within laptop, iPhone, iPad and iPad-landscape viewports.')
})().catch((error) => { console.error(error); process.exitCode = 1 })
