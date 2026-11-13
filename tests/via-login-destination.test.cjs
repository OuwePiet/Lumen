const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
function fixture() {
  const store = new Map(), destinations = [], api = {}
  const window = {location:{href:'https://via.example/',pathname:'/',replace:path=>destinations.push(path)},sessionStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)}}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/deso-login-destination.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api,window,URL,Date})
  return {api,store,destinations,window}
}
test('only a deliberate login, Identity return and valid selected session navigate once',()=>{
  const f=fixture(); f.api.armPostOfficeAfterLogin(); f.api.continueToPostOffice('account'); assert.equal(f.destinations.length,0)
  f.api.markLoginReturn('https://via.example/?service=identity&method=derive'); f.api.continueToPostOffice(undefined); assert.equal(f.destinations.length,0)
  f.api.continueToPostOffice('account'); f.api.continueToPostOffice('account'); assert.deepEqual(f.destinations,['/social'])
})
test('public home, existing session and callback without login intent stay on home',()=>{
  const f=fixture(); f.api.continueToPostOffice('account'); f.api.markLoginReturn('https://via.example/?service=identity&method=derive'); f.api.continueToPostOffice('account'); assert.equal(f.destinations.length,0)
})
test('expired intent and permission-only callback cannot navigate',()=>{
  const f=fixture(); f.api.armPostOfficeAfterLogin(); for(const key of f.store.keys()) f.store.set(key,String(Date.now()-31*60_000)); f.api.markLoginReturn('https://via.example/?service=identity&method=derive'); f.api.continueToPostOffice('account'); assert.equal(f.destinations.length,0)
  const g=fixture(); g.api.armPostOfficeAfterLogin(); g.api.markLoginReturn('https://via.example/?service=identity&method=approve'); g.api.continueToPostOffice('account'); assert.equal(g.destinations.length,0)
})
test('blocked browser storage leaves login usable and does not navigate',()=>{
  const f=fixture(); f.window.sessionStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}; f.api.armPostOfficeAfterLogin(); f.api.markLoginReturn('https://via.example/?service=identity&method=derive'); assert.doesNotThrow(()=>f.api.continueToPostOffice('account')); assert.equal(f.destinations.length,0)
})
