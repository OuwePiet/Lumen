const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const test=require('node:test')
const vm=require('node:vm')
const ts=require('typescript')
const compile=source=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
function ledger({removeFails=false,receiptFails=false,found=false}={}) {
  const storage=new Map(),requests=[]
  const context={exports:{},Event,window:{localStorage:{getItem:k=>storage.get(k)??null,setItem(k,v){if(receiptFails&&k.endsWith(':submitted'))throw new Error('WRITE');storage.set(k,v)},removeItem(k){if(removeFails)throw new Error('REMOVE');storage.delete(k)}},dispatchEvent(){}},fetch:async(url,options)=>{requests.push({url,options});return{ok:true,json:async()=>({ok:true,found})}}}
  vm.runInNewContext(compile(fs.readFileSync(path.join(__dirname,'../app/financial-submission.ts'),'utf8')),context)
  return{api:context.exports,storage,requests}
}
const submission={publicKey:'sender',intent:'nft-bid:post:1:100',amountNanos:100,startedAt:1}
test('pending is verified and blocks every financial intent for sender',()=>{const f=ledger();f.api.markFinancialPending(submission);assert.match(f.api.financialSubmissionBlock('sender','sponsor:other'),/onzeker/);assert.throws(()=>f.api.markFinancialPending(submission))})
test('receipt written before pending clear prevents same action after reload',()=>{const f=ledger();f.api.markFinancialPending(submission);f.api.markFinancialSubmitted(submission,'a'.repeat(64));assert.match(f.api.financialSubmissionBlock('sender',submission.intent),/ontvangen/);assert.equal(f.api.financialSubmissionBlock('sender','different'), '')})
for(const options of [{removeFails:true},{receiptFails:true}])test('storage failure after accepted submit retains uncertainty '+JSON.stringify(options),()=>{const f=ledger(options);f.api.markFinancialPending(submission);assert.throws(()=>f.api.markFinancialSubmitted(submission));assert.match(f.api.financialSubmissionBlock('sender','different'),/onzeker/)})
test('corrupt pending marker blocks without trusting its content',()=>{const f=ledger();f.storage.set('via:financial:v1:sender:pending','not-json');assert.match(f.api.financialSubmissionBlock('sender','anything'),/onzeker/)})
test('receipt for different attempt cannot clear pending',()=>{const f=ledger();f.api.markFinancialPending(submission);assert.throws(()=>f.api.markFinancialSubmitted({...submission,startedAt:2}));assert.match(f.api.financialSubmissionBlock('sender','anything'),/onzeker/)})
for(const found of [true,false])test('readback '+found+' never clears receipt or broadcasts',async()=>{const f=ledger({found});f.api.markFinancialPending(submission);f.api.markFinancialSubmitted(submission,'a'.repeat(64));const before=[...f.storage.entries()];const message=await f.api.readFinancialReceipt('sender',submission.intent);assert.match(message,found?/geen bewijs/:/geen mislukking/);assert.deepEqual([...f.storage.entries()],before);assert.equal(f.requests.length,1);assert.equal(f.requests[0].options.body,undefined)})
test('missing canonical hash does not fabricate a transaction reference',async()=>{const f=ledger();f.api.markFinancialPending(submission);f.api.markFinancialSubmitted(submission,'bad-hash');assert.match(await f.api.readFinancialReceipt('sender',submission.intent),/Geen betrouwbare/);assert.equal(f.requests.length,0)})
function route(found,ok=true){const calls=[];const context={exports:{},URL,require(name){if(name==='next/server')return{NextResponse:{json:(data,options={})=>({data,status:options.status??200,headers:options.headers})}};if(name==='../../../deso-api')return{fetchDeSo:async(endpoint,options)=>{calls.push({endpoint,body:JSON.parse(options.body)});return{ok,json:async()=>({TxnFound:found})}}};throw new Error(name)}};vm.runInNewContext(compile(fs.readFileSync(path.join(__dirname,'../app/api/via/financial-status/route.ts'),'utf8')),context);return{run:hash=>context.exports.GET({url:'https://via.test/api/via/financial-status?hash='+hash}),calls}}
test('readback route only calls official get-txn with valid hash and no-store',async()=>{const f=route(false);const r=await f.run('a'.repeat(64));assert.equal(r.status,200);assert.equal(r.data.found,false);assert.equal(r.headers['Cache-Control'],'no-store');assert.equal(f.calls[0].endpoint,'get-txn')})
test('readback route rejects malformed hash before node call',async()=>{const f=route(false);assert.equal((await f.run('invalid')).status,400);assert.equal(f.calls.length,0)})
test('readback route rejects non-boolean node data',async()=>{const f=route('true');assert.equal((await f.run('a'.repeat(64))).status,503)})
