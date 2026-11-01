const {chromium}=require('playwright'),assert=require('assert/strict');
const base='http://127.0.0.1:3041',A='BC1'+'A'.repeat(48);
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const context=await browser.newContext({viewport:{width:1536,height:760}}),page=await context.newPage();
await context.addInitScript(({A})=>{
localStorage.setItem('desoIdentityUsers',JSON.stringify({[A]:{publicKey:A,primaryDerivedKey:{publicKeyBase58Check:A,derivedPublicKeyBase58Check:A,derivedSeedHex:'11'.repeat(32),derivedKeyRegistered:true,IsValid:true,transactionSpendingLimits:{GlobalDESOLimit:0,TransactionCountLimitMap:{}}}}}));
localStorage.setItem('desoActivePublicKey',A);
localStorage.setItem('via:public-profile:'+A,JSON.stringify({publicKey:A,username:'AccountA',profilePic:null,isVerified:true}));
},{A});
const reads=[];
await context.route('**/api/via/**',async route=>{
const u=new URL(route.request().url());
if(u.pathname==='/api/via/profile'){reads.push(u.search);return route.fulfill({status:503,json:{ok:false}})}
if(u.pathname==='/api/via/social/notifications')return route.fulfill({json:{ok:true,unreadCount:0,notifications:[]}});
return route.continue();
});
await page.goto(base,{waitUntil:'domcontentloaded'});
const controls=page.getByRole('complementary',{name:'VIA homepage controls'});
await controls.getByText('@AccountA',{exact:true}).first().waitFor();
assert.ok(reads.length>0&&reads.every(q=>q.includes('compact=1')),'name reads compact');
await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
await page.waitForTimeout(300);
assert.ok(await controls.getByText('@AccountA',{exact:true}).count(),'name retained on failed refresh');
const size=await controls.locator('.via-home-controls-logo').boundingBox();
assert.ok(size.height<=76,'laptop compact logo');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
console.log('PASS homepage account name retained on profile outage; compact profile reads; laptop layout');
await controls.getByRole('button',{name:/Switch account|Wissel account/}).click();
await controls.getByRole('menuitem',{name:/Logout|Uitloggen/}).click();
await page.waitForTimeout(250);
assert.equal(await controls.getByText('@AccountA',{exact:true}).count(),0,'public cache cannot authenticate after logout');
console.log('PASS logout clears authenticated display without deleting public profile cache');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
