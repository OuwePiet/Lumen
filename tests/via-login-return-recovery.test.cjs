const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const compile = file => ts.transpileModule(fs.readFileSync(file === 'deso-identity-modern.ts' && process.env.VIA_TEST_IDENTITY_SOURCE ? process.env.VIA_TEST_IDENTITY_SOURCE : path.join(__dirname,'../app',file),'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const A = 'A'.repeat(48), B = 'B'.repeat(48)
const tick = () => new Promise(resolve => setImmediate(resolve))
function fixture(options = {}) {
  const key = { publicKeyBase58Check: A, derivedPublicKeyBase58Check: B, derivedSeedHex: '11'.repeat(32), derivedKeyRegistered: false, ...options.key }
  const storage = new Map([['desoActivePublicKey',A],['desoIdentityUsers',JSON.stringify({ [A]: { publicKey: A, primaryDerivedKey: key } })],['via:financial:v1:keep:pending','preserve']])
  const localStorage = { getItem: name => storage.get(name) ?? null, setItem: (name,value) => storage.set(name,value) }
  const calls = [], exports = {}, events = []
  const context = { exports, localStorage, URL, CustomEvent, AbortController, setTimeout, clearTimeout,
    window: { dispatchEvent: event => events.push(event.type) },
    require: () => ({ SDK_ACTIVE_PUBLIC_KEY: 'desoActivePublicKey', SDK_IDENTITY_USERS: 'desoIdentityUsers', VIA_IDENTITY_EVENT: 'via:identity-session' }),
    fetch: async (url, init) => { calls.push({ url,init }); if (options.fail) throw new Error('unavailable'); if (options.changeAccount) storage.set('desoActivePublicKey',B); return { ok: true, json: async () => ({ DerivedKey: { IsValid: options.valid ?? true, OwnerPublicKeyBase58Check: options.owner ?? A, DerivedPublicKeyBase58Check: B, TransactionSpendingLimit: { GlobalDESOLimit: 123 } } }) } },
  }
  vm.runInNewContext(compile('deso-session-recovery.ts'),context)
  return { api: exports,storage,localStorage,calls,events,key }
}
test('unfinished SDK user is never advertised as authenticated to Identity', () => {
  const f = fixture(); assert.equal(f.api.hasUnfinishedSDKLogin(),true)
  const url = new URL('https://identity.deso.org/derive?derive=true&authenticatedUsers='+A+'&redirect_uri=https%3A%2F%2Fvia.example%2F')
  assert.equal(new URL(f.api.checkedIdentityLoginURL(url.href,'https://via.example')).searchParams.has('authenticatedUsers'),false)
})
test('valid registered SDK user is retained without changing permissions or redirect', () => {
  const f = fixture({ key: { derivedKeyRegistered: true } })
  const url = new URL('https://identity.deso.org/derive?derive=true&authenticatedUsers='+A+','+B+'&transactionSpendingLimitResponse=unchanged&redirect_uri=https%3A%2F%2Fvia.example%2F')
  const checked = new URL(f.api.checkedIdentityLoginURL(url.href,'https://via.example'))
  assert.equal(checked.searchParams.get('authenticatedUsers'),A); assert.equal(checked.searchParams.get('transactionSpendingLimitResponse'),'unchanged')
})
test('missing signing credentials cannot make Identity skip deriving access', () => {
  const f = fixture({ key: { derivedKeyRegistered: true, derivedSeedHex: undefined } })
  assert.equal(f.api.usableSDKLoginAccounts().length,0)
})

test('a known invalid registered key cannot make Identity skip reconnecting', () => {
  const f=fixture({key:{derivedKeyRegistered:true,IsValid:false}})
  assert.equal(f.api.usableSDKLoginAccounts().length,0)
  assert.equal(f.api.hasUnfinishedSDKLogin(),true)
})

test('a stale invalid flag is repaired only by fresh positive node proof', async () => {
  const f=fixture({key:{derivedKeyRegistered:true,IsValid:false}})
  assert.equal(await f.api.recoverExistingSDKSession(),true)
  assert.equal(JSON.parse(f.storage.get('desoIdentityUsers'))[A].primaryDerivedKey.IsValid,true)
})
for (const url of ['https://evil.example/derive?redirect_uri=https://via.example/','https://identity.deso.org/derive?redirect_uri=https://evil.example/','https://identity.deso.org/log-in?redirect_uri=https://via.example/']) test('login presenter rejects a changed destination: '+url.split('?')[0], () => {
  assert.throws(() => fixture().api.checkedIdentityLoginURL(url,'https://via.example'),/INVALID_IDENTITY_LOGIN_URL/)
})
test('existing on-chain authorization is recovered using GET only, preserving credentials and financial pending state', async () => {
  const f = fixture(); assert.equal(await f.api.recoverExistingSDKSession(),true)
  assert.equal(f.calls.length,1); assert.equal(f.calls[0].init.method,'GET'); assert.equal(f.calls[0].init.body,undefined)
  const user = JSON.parse(f.storage.get('desoIdentityUsers'))[A]
  assert.equal(user.primaryDerivedKey.derivedKeyRegistered,true); assert.equal(user.primaryDerivedKey.derivedSeedHex,f.key.derivedSeedHex)
  assert.equal(f.storage.get('via:financial:v1:keep:pending'),'preserve'); assert.equal(f.api.hasUnfinishedSDKLogin(),false)
})
for (const options of [{ valid:false },{ owner:B },{ fail:true },{ changeAccount:true },{ key:{derivedSeedHex:undefined} }]) test('unproven recovery never upgrades access: '+JSON.stringify(options),async () => {
  const f=fixture(options),before=f.storage.get('desoIdentityUsers'); assert.equal(await f.api.recoverExistingSDKSession(),false); assert.equal(f.storage.get('desoIdentityUsers'),before)
})
test('multiple VIA pages share one public recovery request',async () => {
  const f=fixture(); await Promise.all([f.api.recoverExistingSDKSession(),f.api.recoverExistingSDKSession(),f.api.recoverExistingSDKSession()]); assert.equal(f.calls.length,1)
})
function callbackFixture(initialCallback = false) {
  const base='https://via.example/', callback=base+'?method=login&service=identity&payload='+encodeURIComponent(encodeURIComponent(JSON.stringify({users:{},publicKeyAdded:A})))
  const location={href:callback,search:new URL(callback).search,pathname:'/'}
  const state={__NA:true,preserve:'next-history'}
  const history={state,replaceState(value,_title,url){this.state=value;location.href=new URL(url,base).href;location.search=new URL(location.href).search}}
  const exports={};vm.runInNewContext(compile('deso-identity-return.ts'),{exports,URL,URLSearchParams,window:{location,history,performance:{getEntriesByType:()=>[{name:initialCallback?callback:base}]}}})
  return {api:exports,location,history,state,callback}
}
test('existing-document login return is handled once and preserves Next history',()=>{
  const f=callbackFixture(),calls=[]
  f.api.resumeIdentityReturn(url=>{calls.push(url);f.history.replaceState({},'','/')})
  assert.equal(calls.length,1);assert.equal(f.history.state,f.state);assert.equal(f.location.search,'')
  f.location.href=f.callback;f.location.search=new URL(f.callback).search
  f.api.resumeIdentityReturn(url=>calls.push(url));assert.equal(calls.length,1)
})
test('initial callback already consumed by SDK constructor is never handled twice',()=>{
  const f=callbackFixture(true),calls=[];f.api.resumeIdentityReturn(url=>calls.push(url));assert.equal(calls.length,0);assert.equal(f.location.search,'')
})
test('real SDK 3.4.1 stale authenticatedUsers hint is corrected without signing or financial API',async()=>{
  const {Identity}=await import('deso-protocol/src/identity/identity.js')
  const f=fixture(),requests=[];let raw,checked
  const browser={location:{search:'',href:'https://via.example/'},open(){throw new Error('popup forbidden')}}
  const sdk=new Identity(browser,{get(){requests.push('get');throw new Error('unexpected')},post(){requests.push('post');throw new Error('financial API forbidden')}})
  sdk.configure({storageProvider:f.localStorage,identityURI:'https://identity.deso.org',nodeURI:'https://node.deso.org',redirectURI:'https://via.example/',identityPresenter:url=>{raw=new URL(url);checked=new URL(f.api.checkedIdentityLoginURL(url,'https://via.example'))}})
  void sdk.login().catch(()=>{})
  for(let count=0;count<20&&!checked;count++)await tick()
  assert.equal(raw.searchParams.get('authenticatedUsers'),A);assert.equal(checked.searchParams.has('authenticatedUsers'),false)
  assert.equal(checked.pathname,'/derive');assert.equal(requests.length,0)
})

test('real SDK redirect callback uses VIA configuration before its first authorization request',async()=>{
  const {Identity}=await import('deso-protocol/src/identity/identity.js')
  const f=fixture(),requests=[]
  f.localStorage.removeItem=name=>f.storage.delete(name)
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:f.localStorage})
  try {
    const query=new URLSearchParams({service:'identity',method:'derive',payload:encodeURIComponent(JSON.stringify({publicKeyBase58Check:A,derivedPublicKeyBase58Check:B}))}).toString()
    const browser={location:{search:'?'+query,pathname:'/',hostname:'via.example',origin:'https://via.example'},history:{replaceState(){}}}
    const sdk=new Identity(browser,{get(){throw new Error('Unexpected read')},post(url){requests.push(url);return Promise.reject(new Error('TEST_STOP_BEFORE_SIGNING'))}})
    const exports={}
    vm.runInNewContext(compile('deso-identity-modern.ts'),{exports,window:browser,localStorage:f.localStorage,require(name){
      if(name==='deso-protocol')return {identity:sdk}
      if(name==='./deso-session-recovery')return f.api
      if(name==='./deso-identity-return')return {resumeIdentityReturn(){return false}}
      if(name==='./deso-identity-session')return {}
      throw new Error('Unexpected module')
    }})
    for(let count=0;count<20&&!requests.length;count++)await tick()
    assert.deepEqual(requests,['https://node.deso.org/api/v0/authorize-derived-key'])
  } finally {
    if(previous)Object.defineProperty(globalThis,'localStorage',previous)
    else delete globalThis.localStorage
  }
})
