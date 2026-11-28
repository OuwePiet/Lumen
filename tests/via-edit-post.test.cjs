const fs=require('node:fs'),assert=require('node:assert/strict'),test=require('node:test'),vm=require('node:vm'),ts=require('typescript');
const source=fs.readFileSync('app/edit-post/edit-post-control.tsx','utf8');
const ast=ts.createSourceFile('edit.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const load=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='loadPost');
const js=ts.transpileModule(load.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const key='A'.repeat(55),hash='a'.repeat(64),original='b'.repeat(64);
async function read(post){
  let request;
  const ctx={getSinglePost:async p=>{request=p;return {PostFound:post}}};
  const result=await vm.runInNewContext(js+'\nloadPost("'+hash+'","'+key+'")',ctx);
  assert.equal(request.PostHashHex,hash);
  assert.equal(request.ReaderPublicKeyBase58Check,key);
  return result;
}
test('SDK lookup preserves quote, media, metadata and status',async()=>{
  const r=await read({PosterPublicKeyBase58Check:key,PostHashHex:hash,Body:' text ',ImageURLs:['ipfs://abc'],VideoURLs:['https://example.org/v'],PostExtraData:{Custom:'value'},IsHidden:true,IsFrozen:false,RepostedPostEntryResponse:{PostHashHex:original}});
  assert.equal(r.body,' text ');assert.equal(r.repostedPostHashHex,original);
  assert.equal(r.imageUrls[0],'ipfs://abc');assert.equal(r.videoUrls[0],'https://example.org/v');
  assert.equal(r.postExtraData.Custom,'value');assert.equal(r.isHidden,true);assert.equal(r.isFrozen,false);
});
test('ordinary post and legacy repost lookup',async()=>{
  const post={PosterPublicKeyBase58Check:key,PostHashHex:hash,Body:'text'};
  assert.equal((await read(post)).repostedPostHashHex,'');
  assert.equal((await read({...post,RecloutedPostEntryResponse:{PostHashHex:original}})).repostedPostHashHex,original);
});
test('edit uses SDK and retains original reference',()=>{
  assert.match(source,/await submitPost\(/);
  assert.match(source,/RepostedPostHashHex:post\.repostedPostHashHex/);
  assert.doesNotMatch(source,/\/api\/via\/social\/edit-post/);
});
