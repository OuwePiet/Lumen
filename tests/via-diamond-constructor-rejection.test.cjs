const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript')
async function rejected(error){
 const api={},source=ts.transpileModule(fs.readFileSync('app/api/via/social/diamond/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText
 vm.runInNewContext(source,{exports:api,process:{env:{}},require:name=>name==='next/server'?{NextResponse:{json:(body,options)=>({body,...options})}}:{fetchDeSo:async()=>({ok:false,json:async()=>({error})})}})
 return api.POST({json:async()=>({action:'prepare',senderPublicKey:'A'.repeat(48),receiverPublicKey:'B'.repeat(48),diamondPostHashHex:'a'.repeat(64),diamondLevel:1})})
}
test('already-given node constructor rejection has an explicit non-payment status',async()=>{
 const response=await rejected('SendDiamonds: RuleErrorCreatorCoinTransferPostAlreadyHasSufficientDiamonds');assert.equal(response.status,409);assert.equal(response.body.error,'DIAMOND_LEVEL_ALREADY_GIVEN')
})
test('unknown upstream errors remain generic and do not expose node details',async()=>{
 const response=await rejected('private upstream detail');assert.equal(response.status,502);assert.equal(response.body.error,'DESO_PREPARE_REJECTED')
})
