const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const compile = file => ts.transpileModule(fs.readFileSync(file === 'deso-identity-modern.ts' && process.env.VIA_TEST_IDENTITY_SOURCE ? process.env.VIA_TEST_IDENTITY_SOURCE : path.join(__dirname,'../app',file),'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const A = 'A'.repeat(48), B = 'B'.repeat(48)
const tick = () => new Promise(resolve => setImmediate(resolve))
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
