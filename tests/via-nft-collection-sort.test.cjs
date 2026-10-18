const test = require('node:test'), assert = require('node:assert/strict')
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), ts = require('typescript')
const api = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/via/nft-collection-sort.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:api})
const row = (title,time,creator,serials=[])=>({PostEntryResponse:{Body:title,TimestampNanos:time,ProfileEntryResponse:{Username:creator}},NFTEntryResponses:serials.map(SerialNumber=>({SerialNumber}))})
const rows = [row('Work 10',1700000000000000000,'Zoe',[10]),row('Work 2',1800000000000000000,'Anna',[3,2]),row('Unknown',undefined,undefined)]
const titles=mode=>[...rows].sort((a,b)=>api.compareNFTCollections(a,b,mode)).map(x=>x.PostEntryResponse.Body)
test('real nanosecond post dates sort new/old and missing dates remain last',()=>{
  assert.deepEqual(titles('newest'),['Work 2','Work 10','Unknown'])
  assert.deepEqual(titles('oldest'),['Work 10','Work 2','Unknown'])
})
test('creator sort uses creator identity and puts missing creator last',()=>assert.deepEqual(titles('creator'),['Work 2','Work 10','Unknown']))
test('edition sort uses lowest known owned edition numerically, not title or input order',()=>assert.deepEqual(titles('serial'),['Work 2','Work 10','Unknown']))
test('invalid or negative edition values do not become artificial low editions',()=>{
  const items=[row('Invalid',1,'A',[0,-2,NaN,Infinity,1.5]),row('Valid',1,'A',[2])]
  assert.equal(items.sort((a,b)=>api.compareNFTCollections(a,b,'serial'))[0].PostEntryResponse.Body,'Valid')
})
test('equal dates have stable natural-title ordering',()=>{
  const items=[row('Work 10',2,'A'),row('Work 2',2,'A')]
  assert.equal(items.sort((a,b)=>api.compareNFTCollections(a,b,'newest'))[0].PostEntryResponse.Body,'Work 2')
})
