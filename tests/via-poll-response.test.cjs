const fs=require('fs'),assert=require('node:assert/strict'),test=require('node:test'),vm=require('node:vm'),ts=require('typescript');
const key='A'.repeat(55),hash='a'.repeat(64);
const source=ts.transpileModule(fs.readFileSync('app/social/poll-response-status.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup(data){const exports={};vm.runInNewContext(source,{exports,URLSearchParams,fetch:async()=>({ok:true,json:async()=>data})});return exports.readPollResponseStatus(hash,key)}
const vote={associationId:'id',voterPublicKey:key,option:'  option  ',blockHeight:1};
test('poll preserves exact UTF-8 vote',async()=>{const option='  '+String.fromCodePoint(0x1f600).repeat(60)+'  ';const r=await setup({ok:true,truncated:false,responses:[{...vote,option}]});assert.equal(r.existingResponse.option,option)});
test('poll rejects malformed response',async()=>{await assert.rejects(setup({ok:true,truncated:false,responses:[{}]}),/INCOMPLETE/)});
test('poll rejects missing completeness flag',async()=>{await assert.rejects(setup({ok:true,responses:[]}),/INCOMPLETE/)});
test('poll detects multiple votes',async()=>{const r=await setup({ok:true,truncated:false,responses:[vote,{...vote,associationId:'id2'}]});assert.equal(r.multipleResponsesDetected,true)});
