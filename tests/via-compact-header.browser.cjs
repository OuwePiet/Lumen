const {chromium,webkit,devices}=require('playwright')
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const base=process.env.VIA_TEST_BASE||'http://127.0.0.1:3036'
const out=process.env.VIA_TEST_OUTPUT||path.resolve(__dirname,'../../../outputs/VIA-compact-header-2026-10-18')
fs.mkdirSync(out,{recursive:true})
const results=[]
const cases=[['laptop',chromium,{viewport:{width:1440,height:1000}}],['iphone',webkit,devices['iPhone 13']],['iphone-small',webkit,devices['iPhone SE']],['iphone-landscape',webkit,devices['iPhone 13 landscape']],['ipad',webkit,devices['iPad Pro 11']],['ipad-landscape',webkit,devices['iPad Pro 11 landscape']],['breed-laag',chromium,{viewport:{width:1024,height:480}}]]
;(async()=>{for(const[name,engine,options]of cases){if(process.env.VIA_TEST_SCREEN_FILTER&&!process.env.VIA_TEST_SCREEN_FILTER.split(',').includes(name))continue;
 const browser=await engine.launch(engine===chromium?{channel:'msedge',headless:true}:{headless:true}),context=await browser.newContext(options)
 const errors=[],writes=[],browserWarnings=[]; let page,replacingDocument=false; const recordError=e=>{if(engine===webkit&&replacingDocument&&e.message.includes(new URL(base).host)&&e.message.includes("_rsc=")&&/due to access control checks\.$/.test(e.message))browserWarnings.push(e.message);else errors.push(e.message)}
 try{
 await context.route('**/*',route=>{const req=route.request(),url=new URL(req.url());if(url.pathname.includes('/get-single-derived-key/'))return route.fulfill({json:{DerivedKey:{IsValid:true,TransactionSpendingLimit:{GlobalDESOLimit:0,TransactionCountLimitMap:{}}}}});if(url.pathname==='/api/via/social/notifications'&&req.postDataJSON()?.action==='unread')return route.fulfill({json:{ok:true,unreadCount:0,notifications:[]}});if(!['GET','HEAD'].includes(req.method())){writes.push(url.pathname);return route.fulfill({status:403,json:{ok:false}})}if(url.origin!==base||url.pathname.startsWith('/api/'))return route.fulfill({json:{ok:true,posts:[],items:[]}});return route.continue()})
 page=await context.newPage();page.on('pageerror',recordError);page.setDefaultTimeout(15000)
 const navigate=async(url,options)=>{replacingDocument=true;try{return await page.goto(url,options)}finally{replacingDocument=false}}; const pages=[]
 for(const route of ['/collection','/studio','/social','/nft-info']){
 await navigate(base+route,{waitUntil:'networkidle'})
 if(route==='/studio')assert.equal((await page.locator('main').innerText()).includes(String.fromCharCode(92)+'n'),false,'no escaped newlines in Mint content'); const header=page.locator('header.via-site-header');await header.waitFor()
 const bounds=await header.boundingBox();assert.ok(bounds.width<=options.viewport.width+1,'header fits viewport')
 const guide=header.locator('.via-global-guides');await guide.getByRole('link',{name:'Home',exact:true}).waitFor()
 for(const name of ['Home','Handboek VIA','VIA Muziek']){const link=guide.getByRole('link',{name,exact:true});const box=await link.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=options.viewport.width+1,'guide link fits');if(options.isMobile)assert.ok(box.height>=44,'touch targets remain 44px')}
 assert.equal(await page.getByRole('button',{name:'VIA language',exact:true}).count(),1,'one central language button')
 assert.equal(await page.locator('.nf-via-language select').count(),0,'no duplicate NFT language selector')
 const logo=await header.locator('.via-site-header-logo').boundingBox();assert.ok(logo.height<=78,'logo is compact')
 if(options.viewport.height<=500)assert.notEqual(await header.evaluate(el=>getComputedStyle(el).position),'sticky','low display retains content space')
 await page.screenshot({path:path.join(out,name+'-'+route.slice(1)+'.png'),fullPage:false})
 pages.push({route,headerHeight:bounds.height,logoHeight:logo.height})
 }
 replacingDocument=true; await page.locator('.via-global-guides').getByRole('link',{name:'Home',exact:true}).click();await page.waitForURL(base+'/');replacingDocument=false
 const A='A'.repeat(48),B='B'.repeat(48)
 await context.addInitScript(({A,B})=>{const users=Object.fromEntries([A,B].map(publicKey=>[publicKey,{publicKey,primaryDerivedKey:{publicKeyBase58Check:publicKey,derivedPublicKeyBase58Check:publicKey,derivedSeedHex:'11'.repeat(32),derivedKeyRegistered:true,IsValid:true,transactionSpendingLimits:{GlobalDESOLimit:0,TransactionCountLimitMap:{}}}}]));localStorage.setItem('desoIdentityUsers',JSON.stringify(users));localStorage.setItem('desoActivePublicKey',A)},{A,B})
 page=await context.newPage();page.on('pageerror',recordError);page.setDefaultTimeout(15000);await navigate(base+'/collection',{waitUntil:'networkidle'})
 const account=page.getByRole('button',{name:'Open VIA account menu',exact:true});await account.waitFor()
 const controls=await page.locator('.via-site-header-tools').evaluate(el=>Array.from(el.querySelectorAll('button,a')).filter(node=>node.getBoundingClientRect().width&&getComputedStyle(node).visibility!=='hidden').map(node=>({label:node.getAttribute('aria-label')||node.textContent,x:node.getBoundingClientRect().x,right:node.getBoundingClientRect().right})))
 for(const item of controls)assert.ok(item.x>=0&&item.right<=options.viewport.width+1,'authenticated control fits: '+item.label)
 await account.click();await page.getByRole('menu',{name:'VIA account menu',exact:true}).waitFor()
 await page.getByRole('menuitem',{name:'Logout from VIA',exact:true}).waitFor()
 await page.screenshot({path:path.join(out,name+'-account-menu.png'),fullPage:false})
 await navigate(base+'/studio',{waitUntil:'networkidle'})
 await page.getByRole('checkbox',{name:'I have reviewed this mint information for the active account.'}).check();await page.getByRole('button',{name:'Continue to Mint',exact:true}).click(); const postHash=page.getByLabel('NFT post hash',{exact:true});await postHash.waitFor();await postHash.scrollIntoViewIfNeeded()
 assert.equal((await page.locator('main').innerText()).includes(String.fromCharCode(92)+'n'),false,'authenticated Mint form contains no literal newline escapes')
 await page.screenshot({path:path.join(out,name+'-mint-posthash.png'),fullPage:false})
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[])
 results.push({name,result:'PASS',pages,homeNavigation:true,browserWarnings,physicalDevice:false,financialWrites:0})
 }catch(error){if(page){await page.screenshot({path:path.join(out,name+'-failure.png'),fullPage:false});console.error(await page.locator('header.via-site-header').innerText());console.error('synthetic test state',await page.evaluate(()=>({active:!!localStorage.getItem('desoActivePublicKey'),users:!!localStorage.getItem('desoIdentityUsers'),classes:document.body.className})));}results.push({name,result:'FAIL',error:error.stack,errors,writes});throw error}finally{await browser.close();fs.writeFileSync(path.join(out,'resultaten.json'),JSON.stringify(results,null,2))}
}console.log('PASS '+results.length+' screen configurations; no financial writes; no physical acceptance.')})().catch(error=>{console.error(error);process.exitCode=1})
