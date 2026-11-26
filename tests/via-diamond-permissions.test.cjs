const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const sdk=fs.readFileSync(path.join(root,'node_modules/deso-protocol/src/transactions/utils.js'),'utf8');
const body=sdk.slice(sdk.indexOf('export async function guardTxPermission('),sdk.indexOf('export function stripHexPrefix(')).replace('export async','async');
function guard(identity){return vm.runInNewContext(body+'\nguardTxPermission',{identity})}
const required={GlobalDESOLimit:60000,TransactionCountLimitMap:{BASIC_TRANSFER:1}};
test('official SDK sufficient grant does not prompt',async()=>{await guard({hasPermissions:p=>{assert.equal(p,required);return true},requestPermissions:()=>assert.fail('unexpected prompt')})(required)});
test('official SDK adds required amount to existing grant',async()=>{let calls=0;await guard({hasPermissions:async()=>false,transactionSpendingLimitOptions:{GlobalDESOLimit:10000},requestPermissions:p=>{assert.equal(p.GlobalDESOLimit,70000);assert.equal(p.TransactionCountLimitMap.BASIC_TRANSFER,1);calls++}})(required);assert.equal(calls,1)});
test('official SDK denial propagates',async()=>{await assert.rejects(guard({hasPermissions:()=>false,transactionSpendingLimitOptions:{},requestPermissions:async()=>{throw Error('denied')}})(required),/denied/)});
test('VIA delegates diamonds without custom permission or timeout',()=>{const src=fs.readFileSync(path.join(root,'app/social/diamond-button.tsx'),'utf8');assert.match(src,/await sendDiamonds\(/);assert.doesNotMatch(src,/checkPermissions:\s*false|requestPermissions\(|awaitIdentityResponse|ensureDiamondPermission/)});