const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),crypto=require('node:crypto').webcrypto;
function fixture({fail=false,blocked=false}={}){
 const events=[],exportsMock={};let pending=false;
 const financial={signedDeSoTransactionHash:()=>"a".repeat(64),withFinancialAccountLock:async(k,fn)=>{events.push('lock');await fn()},financialSubmissionBlock:()=>blocked||pending?'blocked':'',markFinancialPending:()=>{pending=true;events.push('pending')},markFinancialSubmitted:(r,h)=>{pending=false;events.push('receipt:'+h)}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../app/nft-submission-guard.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:exportsMock,crypto,TextEncoder,Uint8Array,require:n=>n==='deso-protocol'?{identity:{submitTx:async()=>{events.push('submit');if(fail)throw Error('network');return {TxnHashHex:'a'.repeat(64)}}}}:financial});
 return {events,run:(check=async()=>{})=>exportsMock.submitGuardedNFT('key','hash',1,100,'signed',check)};
}
test('NFT records pending before direct SDK submission and saves receipt',async()=>{const f=fixture();await f.run();assert.deepEqual(f.events,['lock','pending','submit','receipt:'+'a'.repeat(64)])});
test('uncertain NFT submission prevents retry',async()=>{const f=fixture({fail:true});await assert.rejects(f.run(),/network/);await assert.rejects(f.run(),/blocked/);assert.equal(f.events.filter(x=>x==='submit').length,1)});
test('existing financial block prevents NFT submission',async()=>{const f=fixture({blocked:true});await assert.rejects(f.run(),/blocked/);assert.deepEqual(f.events,['lock'])});
test('changed account prevents submission',async()=>{const f=fixture();await assert.rejects(f.run(async()=>{throw Error('account changed')}),/account changed/);assert.deepEqual(f.events,['lock'])});