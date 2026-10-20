const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript')
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/via/mint-price.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:api})
test('DESO decimals and comma are exact, including the smallest internal unit',()=>{assert.equal(api.mintPriceNanos('0.5','DESO'),500000000);assert.equal(api.mintPriceNanos('0,5','DESO'),500000000);assert.equal(api.mintPriceNanos('0.000000001','DESO'),1)})
test('USD/EUR use the explicit rate and round only once',()=>{assert.equal(api.mintPriceNanos('1.00','USD',2),500000000);assert.equal(api.mintPriceNanos('1,00','EUR',3),333333333);assert.equal(api.mintPriceNanos('0','EUR',1),0)})
test('invalid, negative, exponential and overprecise inputs fail closed',()=>{for(const value of ['','-1','1e3','0.0000000001','1,2.3'])assert.equal(api.mintPriceNanos(value,'DESO'),null);assert.equal(api.mintPriceNanos('0.001','USD',1),null)})
test('missing, zero or nonfinite fiat rate and unsafe totals fail closed',()=>{for(const rate of [undefined,0,-1,Infinity,NaN])assert.equal(api.mintPriceNanos('1','USD',rate),null);assert.equal(api.mintPriceNanos('999999999999','DESO'),null)})

async function mintHandler(quoteUsable){
 const source=fs.readFileSync('app/studio/mint-preflight.tsx','utf8'),start=source.indexOf('  async function prepareMint()'),end=source.indexOf('  function resetPreflight()',start),exports={},calls=[]
 vm.runInNewContext(ts.transpileModule(source.slice(start,end)+'\nexports.prepare=prepareMint',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,session:{publicKey:'synthetic'},quoteUsable,mintRunner:{current:{run:async request=>{calls.push(request);return {outcome:'stopped'}}}},postHash:'a'.repeat(64),copies:'1',unlockable:false,forSale:true,buyNow:true,minBid:'1.00',buyNowPrice:'2.50',minimumPriceNanos:api.mintPriceNanos('1.00','USD',2),buyPriceNanos:api.mintPriceNanos('2.50','USD',2),creatorRoyalty:'9',coinRoyalty:'2.25',creatorRoyaltyBasisPoints:900,coinRoyaltyBasisPoints:225,setMintStatus(){},setMintMessage(){},setResult(){}})
 await exports.prepare();return calls
}
test('the real mint handler passes the same converted prices as preflight to the guarded runner',async()=>{const calls=await mintHandler(true);assert.equal(calls[0].body.mint.minBidAmountNanos,500000000);assert.equal(calls[0].body.mint.buyNowPriceNanos,1250000000);assert.equal(calls[0].body.mint.creatorRoyaltyBasisPoints,900);assert.equal(calls[0].body.mint.coinRoyaltyBasisPoints,225)})
test('an unusable quote cannot enter the guarded mint runner',async()=>{assert.equal((await mintHandler(false)).length,0)})
