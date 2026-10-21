const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.join(__dirname, '..')
function load(file, globals) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(code, { exports, ...globals })
  return exports
}
const key = 'BC1' + 'A'.repeat(48)
const hash = 'a'.repeat(64)

test('public NFT reader retains edition, pending transfer and owner without unsafe amounts', async () => {
  let request
  const api = load('app/deso-nfts.ts', { require: () => ({ fetchDeSo: async (endpoint, init) => {
    request = { endpoint, body: JSON.parse(init.body) }
    return { ok: true, json: async () => ({ NFTsMap: { [hash]: { PostEntryResponse: { PostHashHex: hash }, NFTEntryResponses: [{ SerialNumber: 2, OwnerPublicKeyBase58Check: key, IsPending: true, IsBuyNow: true, BuyNowPriceNanos: 123, MinBidAmountNanos: Number.MAX_SAFE_INTEGER + 1 }] } } }) }
  } }) })
  const rows = await api.getNFTsForUser(key)
  assert.equal(rows[0].NFTEntryResponses[0].SerialNumber, 2)
  assert.equal(rows[0].NFTEntryResponses[0].OwnerPublicKeyBase58Check, key)
  assert.equal(rows[0].NFTEntryResponses[0].IsPending, true)
  assert.equal(rows[0].NFTEntryResponses[0].IsBuyNow, true)
  assert.equal(rows[0].NFTEntryResponses[0].MinBidAmountNanos, undefined)
  assert.equal(request.body.ReaderPublicKeyBase58Check, '')
  assert.equal(request.body.Limit, 100)
})

function nodeFixture() {
  const calls = []
  const api = load('app/deso-api.ts', { process: { env: {} }, URL, AbortController, setTimeout, clearTimeout, fetch: async (url, init) => {
    calls.push({ url, init })
    return new Response('{}', { status: 503, headers: { 'content-type': 'application/json' } })
  } })
  return { ...api, calls }
}
test('association query allows the documented nested read endpoint and read retries', async () => {
  const f = nodeFixture()
  await f.fetchDeSo('post-associations/query', { method: 'POST', body: '{}' })
  assert.equal(f.calls.length, 2)
  assert.equal(f.calls[0].url, 'https://node.deso.org/api/v0/post-associations/query')
})
test('nested endpoint exceptions cannot be used for arbitrary paths or traversal', async () => {
  const f = nodeFixture()
  for (const endpoint of ['post-associations/create', '../submit-transaction', 'post-associations/query?x=1', 'https://evil.example/test', 'post-associations/query/../create']) {
    await assert.rejects(f.fetchDeSo(endpoint, { method: 'POST' }), /INVALID_DESO_ENDPOINT/)
  }
  assert.equal(f.calls.length, 0)
})
test('financial submit is still sent once even after a server error', async () => {
  const f = nodeFixture()
  await f.fetchDeSo('submit-transaction', { method: 'POST', body: '{}' })
  assert.equal(f.calls.length, 1)
})

function pagedReader(pages) {
  const calls=[]
  const api=load('app/deso-nfts.ts',{DOMException,require:()=>({fetchDeSo:async(endpoint,init)=>{calls.push(JSON.parse(init.body));const page=pages[calls.length-1];if(page instanceof Error)throw page;return {ok:true,json:async()=>page}}})})
  return {...api,calls}
}
function nftPage(serials,cursor='',postHash=hash){return {NFTsMap:{[postHash]:{PostEntryResponse:{PostHashHex:postHash},NFTEntryResponses:serials.map(SerialNumber=>({SerialNumber,OwnerPublicKeyBase58Check:key}))}},LastKeyHex:cursor}}
test('all ownership pages are read and overlapping editions counted once',async()=>{
 const f=pagedReader([nftPage([1,2],'aa'),nftPage([2,3],'bb'),nftPage([4])]);const rows=await f.getNFTsForUser(key)
 assert.equal(rows.length,1);assert.deepEqual(Array.from(rows[0].NFTEntryResponses,e=>e.SerialNumber),[1,2,3,4]);assert.deepEqual(f.calls.map(c=>c.LastKeyHex),['','aa','bb'])
})
test('a page error or repeated/malformed cursor never returns a complete partial count',async()=>{
 for(const pages of [[nftPage([1],'aa'),new Error('network')],[nftPage([1],'aa'),nftPage([2],'aa')],[nftPage([1],'bad cursor')],[{NFTsMap:null}]]) await assert.rejects(pagedReader(pages).getNFTsForUser(key))
})
test('100 editions on the first page do not truncate another work or edition',async()=>{
 const f=pagedReader([nftPage(Array.from({length:100},(_,i)=>i+1),'aa'),nftPage([101],'', 'b'.repeat(64))]);const rows=await f.getNFTsForUser(key);assert.equal(rows.length,2);assert.equal(rows.reduce((sum,r)=>sum+r.NFTEntryResponses.length,0),101)
})
test('cancelled account read and wrong edition owner cannot publish a misleading count',async()=>{
 await assert.rejects(pagedReader([]).getNFTsForUser(key,{aborted:true}),/cancelled/)
 const page=nftPage([1]);page.NFTsMap[hash].NFTEntryResponses[0].OwnerPublicKeyBase58Check='BC1'+'B'.repeat(48)
 await assert.rejects(pagedReader([page]).getNFTsForUser(key),/EDITION_INVALID/)
})
test('transport preserves verified cursor and limit and retains the response cursor',async()=>{
 const calls=[];const api=load('app/deso-api.ts',{process:{env:{}},URL,AbortController,setTimeout,clearTimeout,Response,Headers,fetch:async(url,init)=>{calls.push(JSON.parse(init.body));return new Response(JSON.stringify({NFTsMap:{},LastKeyHex:'bb'}),{headers:{'content-type':'application/json'}})}})
 const response=await api.fetchDeSo('get-nfts-for-user',{method:'POST',body:JSON.stringify({UserPublicKeyBase58Check:key,LastKeyHex:'aa',Limit:100,unexpected:'removed'})})
 assert.equal(calls[0].LastKeyHex,'aa');assert.equal(calls[0].Limit,100);assert.equal(calls[0].unexpected,undefined);assert.equal((await response.json()).LastKeyHex,'bb')
})
test('inclusive terminal anchor is deduplicated and ends the read without looping',async()=>{const f=pagedReader([nftPage([1,2],'aa'),nftPage([2],'aa')]);const rows=await f.getNFTsForUser(key);assert.equal(rows[0].NFTEntryResponses.length,2);assert.equal(f.calls.length,2)})
