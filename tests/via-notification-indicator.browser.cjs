// Isolated synthetic accounts. Every write and every external request is intercepted.
const { chromium, webkit, devices } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path')
const base = 'http://127.0.0.1:3026'
const out = path.resolve(__dirname, '../../../outputs/VIA-meldingen-lampje-browserbewijs-2026-10-17')
fs.mkdirSync(out, { recursive: true })
const A='A'.repeat(48), B='B'.repeat(48), results=[]
const users=Object.fromEntries([A,B].map(publicKey=>[publicKey,{publicKey,primaryDerivedKey:{publicKeyBase58Check:publicKey,derivedKeyRegistered:true}}]))
async function run(name, engine, options) {
  const browser=await engine.launch(name==='laptop'?{channel:'msedge',headless:true}:{headless:true})
  const context=await browser.newContext(options), forbidden=[]
  let page
  let count=3,index=100,failFeed=false
  try {
    await context.addInitScript(({A,users})=>{if(localStorage.getItem('fixture'))return;localStorage.setItem('fixture','1');localStorage.setItem('desoIdentityUsers',JSON.stringify(users));localStorage.setItem('desoActivePublicKey',A)}, {A,users})
    await context.route('**/*',async route=>{
      const req=route.request(),url=new URL(req.url())
      if(url.origin!==base)return route.fulfill({json:{}})
      if(!url.pathname.startsWith('/api/'))return route.continue()
      let data={ok:true,items:[],posts:[],notifications:[]}
      if(url.pathname==='/api/via/social/diamond' && req.method()==='POST' && req.postDataJSON()?.action==='levels')return route.fulfill({json:{ok:true,diamondLevelMap:{1:1000}}})
      if(url.pathname==='/api/via/social/notifications') {
        const body=req.postDataJSON()
        if(!['unread',undefined].includes(body.action)){forbidden.push(body.action);return route.fulfill({status:403,json:{ok:false}})}
        if(body.action==='unread')data={ok:true,unreadCount:count}
        else if(failFeed && body.numToFetch!==1)return route.fulfill({status:503,json:{ok:false}})
        else data={ok:true,lastSeenIndex:0,notifications:[{Index:index,Metadata:{TxnType:'SUBMIT_POST',TransactorPublicKeyBase58Check:B,SubmitPostTxindexMetadata:{PostHashHex:'a'.repeat(64),MentionCount:2}}}]}
      } else {
        if(req.method()!=='GET'){forbidden.push(url.pathname);return route.fulfill({status:403,json:{ok:false}})}
        if(url.pathname==='/api/via/profile'){const key=url.searchParams.get('identity')||A;data={ok:true,profile:{publicKey:key,username:key===A?'VIA-Test-A':'VIA-Test-B',isVerified:false}}}
        if(url.pathname==='/api/via/post')data={ok:true,post:{postHash:'a'.repeat(64),publicKey:B,username:'VIA-Test-B',body:'Een rustigere meldingenpagina\n\nDit is een gesimuleerd bericht voor de mobiele controle. Alle tekst blijft beschikbaar, met meer ruimte voor de inhoud en minder kaders.\n\nFilters staan in één horizontale rij. Eén diamant, meerdere diamanten en de vermeldingen @5 en @6+ zijn herkenbaar.\n\nOok een langere link mag de pagina niet breder maken: https://example.com/een-lang-voorbeeld-van-een-link-in-een-melding-op-een-klein-telefoonscherm',imageUrls:[],timestampNanos:1,likeCount:0,diamondCount:0}}
      }
      return route.fulfill({json:data})
    })
    page=await context.newPage()
    page.setDefaultTimeout(15000)
    const lamp=()=>page.locator('.via-home-controls [aria-label="Ongelezen meldingen"]')
    await page.goto(base,{waitUntil:'networkidle'})
    await lamp().waitFor()
    await page.locator('.via-home-controls a[href="/notifications"]').click()
    await page.getByText('1 recent notifications loaded.',{exact:true}).waitFor()
    await page.getByText('Een rustigere meldingenpagina',{exact:false}).waitFor()
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true,'no horizontal page overflow')
    if((options.viewport?.width||0)<640){
      const filters=page.locator('[aria-label="Notification filters"] button')
      assert.equal(await filters.count(),9)
      const boxes=await filters.evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect();return {y:r.y,width:r.width,height:r.height}}))
      assert.ok(boxes.every(box=>box.y===boxes[0].y&&box.width>=44&&box.height>=44),'one filter row with 44px touch targets')
      assert.equal(await filters.first().evaluate(button=>getComputedStyle(button,'::before').backgroundColor),'rgb(8, 125, 255)')
      assert.equal(await filters.nth(2).locator('svg').count(),2,'multiple diamonds has two diamonds')
      assert.match(await filters.nth(5).innerText(),/5/)
      assert.match(await filters.nth(6).innerText(),/6\+/)
      const more=page.locator('button[aria-controls^="notification-body-"]')
      const body=page.locator('p[id^="notification-body-"]')
      const before=(await body.boundingBox()).height
      await more.click()
      await page.waitForFunction(()=>document.querySelector('button[aria-controls^="notification-body-"]')?.getAttribute('aria-expanded')==='true')
      assert.ok((await body.boundingBox()).height>before,'read more exposes the full mobile post')
      await more.click()
      await page.waitForFunction(()=>document.querySelector('button[aria-controls^="notification-body-"]')?.getAttribute('aria-expanded')==='false')
    }
    const mention=page.getByRole('button',{name:'Mentions · max 5',exact:true})
    await mention.click()
    await page.locator('section[aria-labelledby="notification-center-heading"] article').waitFor({state:'hidden'})
    await mention.click()
    await page.waitForFunction(()=>document.querySelector('button[aria-label="Mentions · max 5"]')?.getAttribute('aria-pressed')==='true')
    await page.locator('section[aria-labelledby="notification-center-heading"] article').waitFor()
    await page.screenshot({path:path.join(out,name+'-meldingen-rustiger.png'),fullPage:true})
    assert.equal(await page.evaluate(A=>localStorage.getItem('via:notifications:seen-index:'+A),A),null,'view is acknowledged on departure, not unread counter load')
    await page.getByRole('link',{name:'Home',exact:true}).filter({visible:true}).first().click(); await page.getByRole('button',{name:'Switch account',exact:true}).waitFor()
    await page.waitForLoadState('networkidle')
    assert.equal(await lamp().count(),0)
    assert.equal(await page.evaluate(A=>localStorage.getItem('via:notifications:seen-index:'+A),A),'100')
    await page.reload({waitUntil:'networkidle'})
    assert.equal(await lamp().count(),0,'acknowledgement survives reload')
    count=1;index=101
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
    await lamp().waitFor()
    await page.screenshot({path:path.join(out,name+'-nieuw-lampje-aan.png')})
    failFeed=true
    await page.locator('.via-home-controls a[href="/notifications"]').click()
    await page.getByText('Notifications are temporarily unavailable.',{exact:true}).waitFor()
    await page.getByRole('link',{name:'Home',exact:true}).filter({visible:true}).first().click(); await page.getByRole('button',{name:'Switch account',exact:true}).waitFor()
    await lamp().waitFor()
    assert.equal(await page.evaluate(A=>localStorage.getItem('via:notifications:seen-index:'+A),A),'100','failed feed never acknowledges index 101')
    failFeed=false
    await page.locator('.via-home-controls a[href="/notifications"]').click()
    await page.getByText('1 recent notifications loaded.',{exact:true}).waitFor()
    await page.getByRole('link',{name:'Home',exact:true}).filter({visible:true}).first().click(); await page.getByRole('button',{name:'Switch account',exact:true}).waitFor()
    await page.waitForLoadState('networkidle')
    assert.equal(await lamp().count(),0)
    await page.screenshot({path:path.join(out,name+'-bekeken-lampje-uit.png')})
    await page.getByRole('button',{name:'Switch account',exact:true}).click()
    await page.getByRole('menuitem',{name:'@VIA-Test-B',exact:true}).click()
    await lamp().waitFor()
    assert.equal(await page.evaluate(B=>localStorage.getItem('via:notifications:seen-index:'+B),B),null,'A cannot acknowledge B')
    assert.deepEqual(forbidden,[])
    results.push({name,result:'PASS',newNotification:true,viewThenLeaveTurnsOff:true,reloadKeepsOff:true,newerIndexWithLowerCount:true,failedFeedKeepsOn:true,accountIsolation:true,realDeSoWrites:0,physicalDevice:false})
  } catch(error) {
    if(page){await page.screenshot({path:path.join(out,name+'-failure.png'),fullPage:true});fs.writeFileSync(path.join(out,name+'-overflow.json'),JSON.stringify(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left< -1||e.right>innerWidth+1).slice(0,25)})),null,2))}
    results.push({name,result:'FAIL',error:error.stack});throw error
  }
  finally {await browser.close();fs.writeFileSync(path.join(out,'resultaten.json'),JSON.stringify(results,null,2))}
}
;(async()=>{await run('laptop',chromium,{viewport:{width:1440,height:1000}});await run('iphone',webkit,devices['iPhone 13']);await run('iphone-small',webkit,devices['iPhone SE']);await run('iphone-landscape',webkit,devices['iPhone 13 landscape']);await run('ipad',webkit,devices['iPad Pro 11']);await run('ipad-landscape',webkit,devices['iPad Pro 11 landscape']);console.log('PASS: laptop, iPhone en iPad inclusief klein scherm en landschap; uitsluitend synthetische meldingen, geen echte account gelezen of metadata gewijzigd.')})().catch(e=>{console.error(e);process.exitCode=1})


