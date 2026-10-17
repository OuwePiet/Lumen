const { chromium, webkit, devices } = require('playwright')
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path')
const base = process.env.VIA_TEST_BASE || 'http://127.0.0.1:3035'
const out = process.env.VIA_TEST_OUTPUT || path.resolve(__dirname, '../../../outputs/VIA-NFT-opslagvoorbeeld-browser')
fs.mkdirSync(out, { recursive: true })
const results = []
async function run(name, engine, options) {
  const browser = await engine.launch(name === 'laptop' ? { channel: 'msedge', headless: true } : { headless: true })
  const context = await browser.newContext(options), forbidden = [], errors = []
  let page
  try {
    await context.route('**/*', route => {
      const req = route.request(), url = new URL(req.url())
      if (!['GET','HEAD'].includes(req.method())) { forbidden.push(url.pathname); return route.fulfill({status:403,json:{ok:false}}) }
      if (url.origin !== base || url.pathname.startsWith('/api/')) return route.fulfill({json:{ok:true,items:[]}})
      return route.continue()
    })
    page = await context.newPage(); page.setDefaultTimeout(15000)
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base+'/studio/storage-preview', {waitUntil:'networkidle'})
    await page.getByRole('heading', {name:'Jouw werk. Jouw opslag.',exact:true}).waitFor()
    const next = page.getByRole('button', {name:'Volgende',exact:true})
    assert.equal(await next.isEnabled(), false)
    await page.getByLabel('Titel',{exact:true}).fill('Mijn eerste VIA-kunstwerk')
    await page.getByLabel('Beschrijving',{exact:true}).fill('Een eigen origineel, met een bewuste opslagkeuze.')
    await page.locator('input[type=file]').setInputFiles({name:'voorbeeld.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1cAAAAASUVORK5CYII=','base64')})
    await page.screenshot({path:path.join(out,name+'-bestand.png'),fullPage:true})
    await next.click()
    await page.getByRole('button',{name:/^Eigen of externe opslag/}).click()
    const reference = page.getByLabel('Openbare HTTPS-bestandslink',{exact:true})
    await reference.fill('javascript:alert(1)'); assert.equal(await next.isEnabled(),false)
    await reference.fill('https://user:password@storage.example/file.png'); assert.equal(await next.isEnabled(),false)
    await reference.fill('https://storage.example/mijn-werk.png')
    await page.screenshot({path:path.join(out,name+'-opslag.png'),fullPage:true})
    await next.click(); await page.getByLabel('Aantal edities',{exact:true}).fill('2')
    await page.getByLabel('Direct kopen aanbieden',{exact:true}).check(); await next.click()
    await page.getByRole('heading',{name:'Overzicht',exact:true}).waitFor()
    assert.equal(await page.getByRole('button',{name:'Bekijk afronding',exact:true}).isEnabled(),false)
    await page.getByRole('checkbox').check(); await page.getByRole('button',{name:'Bekijk afronding',exact:true}).click()
    await page.getByRole('status').filter({hasText:'Er is niets geüpload, betaald, ondertekend of gemint.'}).waitFor()
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1),false,'no page overflow')
    await page.screenshot({path:path.join(out,name+'-overzicht.png'),fullPage:true})
    await page.locator('ol[aria-label="Stappen"] button').nth(1).click()
    await page.getByRole('button',{name:/^IPFS/}).click()
    await page.getByLabel('IPFS-verwijzing of HTTPS-gatewaylink',{exact:true}).fill('ipfs://bafyexample/kunst.png')
    assert.equal(await next.isEnabled(),true)
    await page.getByRole('button',{name:/^Arweave/}).click()
    assert.equal(await next.isEnabled(),false)
    await page.getByLabel('Arweave-bestandslink',{exact:true}).fill('https://arweave.net/example')
    assert.equal(await next.isEnabled(),true)
    assert.deepEqual(forbidden,[]); assert.deepEqual(errors,[])
    results.push({name,result:'PASS',localFileOnly:true,fourSteps:true,externalURLValidation:true,ipfsAndArweave:true,financialWrites:0,physicalDevice:false})
  } catch(error) { if(page)await page.screenshot({path:path.join(out,name+'-failure.png'),fullPage:true});results.push({name,result:'FAIL',error:error.stack});throw error }
  finally {await browser.close();fs.writeFileSync(path.join(out,'resultaten.json'),JSON.stringify(results,null,2))}
}
;(async()=>{
  const cases=[['laptop',chromium,{viewport:{width:1440,height:1000}}],['iphone',webkit,devices['iPhone 13']],['iphone-small',webkit,devices['iPhone SE']],['iphone-landscape',webkit,devices['iPhone 13 landscape']],['ipad',webkit,devices['iPad Pro 11']],['ipad-landscape',webkit,devices['iPad Pro 11 landscape']]]
  for(const [name,engine,options] of cases)if(!process.env.VIA_TEST_SCREEN_FILTER||process.env.VIA_TEST_SCREEN_FILTER.split(',').includes(name))await run(name,engine,options)
  console.log('PASS: '+results.map(item=>item.name).join(', ')+'; preview only; no upload, signing or transactions.')
})().catch(error=>{console.error(error);process.exitCode=1})
