const fs=require('fs'),assert=require('node:assert/strict'),test=require('node:test'),vm=require('node:vm'),ts=require('typescript');
function compile(s){return ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText}
const hash='a'.repeat(64),key='A'.repeat(55);
const optionsSource=fs.readFileSync('app/social/public-posts.tsx','utf8').split('function pollOptions(')[1].split('function feedReadyMessage(')[0];
const parse=vm.runInNewContext(compile('function pollOptions('+optionsSource+'\npollOptions;'));
test('all eight published poll options survive parsing',()=>{const options=['a','b','c','d','e','f','  g  ','h'];assert.equal(JSON.stringify(parse({PollOptions:JSON.stringify(options)})),JSON.stringify(options))});
const route=compile(fs.readFileSync('app/api/via/social/poll-read/route.ts','utf8'));
function setup(pages){const exports={},calls=[];vm.runInNewContext(route,{exports,URL,require:(name)=>name==='next/server'?{NextResponse:{json:(data,init)=>({data,status:init.status})}}:{fetchDeSo:async(_,init)=>{calls.push(JSON.parse(init.body));return {ok:true,json:async()=>pages.shift()}}}});return {calls,run:()=>exports.GET({url:'https://via.test/?postHash='+hash})}}
const item=n=>({AssociationID:String(n),TransactorPublicKeyBase58Check:key,PostHashHex:hash,AssociationType:'POLL_RESPONSE',AssociationValue:'x'});
test('poll follows cursor beyond first hundred votes',async()=>{const {calls,run}=setup([{Associations:Array.from({length:100},(_,i)=>item(i))},{Associations:[item(100)]}]);const r=await run();assert.equal(r.data.responses.length,101);assert.equal(calls[1].LastSeenAssociationID,'99')});
test('poll rejects incomplete second page',async()=>{const {run}=setup([{Associations:Array.from({length:100},(_,i)=>item(i))},{}]);assert.equal((await run()).status,503)});
