const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const e={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../app/studio/mint-cost.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:e});
test('mint fee counted once',()=>{const r=e.mintCost(100,10000,8000);assert.equal(r.spend,1900);assert.equal(r.cost,2000)});
test('zero additional spend',()=>assert.equal(e.mintCost(100,100,0).spend,0));
test('invalid cost rejected',()=>{for(const args of [[100,50,0],[0,1,2],[NaN,100,0],[-1,100,0],[1,1.5,0],[1,Number.MAX_SAFE_INTEGER+1,0]])assert.throws(()=>e.mintCost(...args))});