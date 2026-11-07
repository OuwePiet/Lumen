const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript')
// Execute the actual component's async load handler with isolated state/HTTP.
const source=fs.readFileSync('app/social/public-posts.tsx','utf8').replace(/\r\n/g,'\n')
const handler=source.slice(source.indexOf('  async function loadPosts('),source.indexOf('\n  useEffect(() => {\n    void loadPosts()'))
function fixture(fetch){
 const state={posts:[{postHash:'existing'}],message:'',loading:false},requestController={current:null},api={}
 vm.runInNewContext(ts.transpileModule(handler+'\nexports.loadPosts=loadPosts',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api,fetch,requestController,feedChoice:'hot',session:{publicKey:'A'},AbortController,DOMException,Error,setPosts:value=>state.posts=value,setMessage:value=>state.message=value,setLoading:value=>state.loading=value,setHasMore:()=>{}})
 return {state,api,requestController}
}
test('failed HTTP refresh after publishing keeps existing posts visible',async()=>{
 const f=fixture(async()=>({ok:false,json:async()=>({ok:false})}));await f.api.loadPosts();assert.equal(f.state.posts[0].postHash,'existing');assert.match(f.state.message,/remain visible/);assert.equal(f.state.loading,false)
})
test('network timeout keeps existing posts visible',async()=>{
 const f=fixture(async()=>{throw Error('timeout')});await f.api.loadPosts();assert.equal(f.state.posts[0].postHash,'existing')
})
test('successful empty response remains a real empty feed',async()=>{
 const f=fixture(async()=>({ok:true,json:async()=>({ok:true,posts:[]})}));await f.api.loadPosts();assert.equal(f.state.posts.length,0)
})
test('stale response cannot replace a newer successful refresh',async()=>{
 let resolveFirst,calls=0;const f=fixture(async()=>++calls===1?new Promise(resolve=>resolveFirst=resolve):({ok:true,json:async()=>({ok:true,posts:[{postHash:'new'}]})}));const first=f.api.loadPosts();await f.api.loadPosts();resolveFirst({ok:true,json:async()=>({ok:true,posts:[{postHash:'old'}]})});await first;assert.equal(f.state.posts[0].postHash,'new')
})
