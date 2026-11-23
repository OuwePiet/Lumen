// @OuwePiet 2026 — test public news validation without connecting external feeds.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file){const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const exports={};vm.runInNewContext(js,{exports,URL,Date,Set,console},{filename:file});return exports;}
const {validateNewsSourceUrl,isNewsOutboundFetchApproved}=load('app/wereldspiegel/source-security.ts');
const {validateStory,deduplicateStories}=load('app/wereldspiegel/story-validation.ts');
assert.equal(isNewsOutboundFetchApproved(),false,"outbound news fetch must stay disabled");
const approved=[{id:'sample',hostname:'news.example',pathPrefix:'/public/feed'}];
for(const url of ['http://news.example/public/feed','https://news.example.evil.com/public/feed','https://127.0.0.1/public/feed','https://news.example:444/public/feed','https://news.example/public/feed-other','https://user:pass@news.example/public/feed','https://news.example/public/feed#secret'])assert.equal(validateNewsSourceUrl(url,approved),null,`unsafe URL accepted ${url}`);
assert.equal(validateNewsSourceUrl('https://news.example/public/feed',approved).hostname,'news.example');
assert.equal(validateNewsSourceUrl('https://news.example/public/feed/part',approved).hostname,'news.example');
assert.equal(validateNewsSourceUrl('https://news.example/public/feed'),null,'default must deny all');
const now=Date.now();const story={id:'world_1',title:'Local news',summary:'Verified news summary',sourceName:'Example publisher',sourceUrl:'https://news.example/article',publishedAt:new Date(now-60000).toISOString(),placeId:'MN:UB'};
assert.equal(validateStory(story,now).placeId,'MN:UB');
assert.equal(validateStory({...story,countryCode:'MN'},now).countryCode,'MN');
assert.equal(validateStory({...story,countryCode:'../../'},now).countryCode,null);
assert.equal(validateStory(story,now).countryCode,null,'unknown geography must remain unknown');
for(const sourceUrl of ['http://news.example/article','https://localhost/article','https://127.0.0.1/article','https://user:pass@news.example/article'])assert.equal(validateStory({...story,sourceUrl},now),null);
assert.equal(validateStory({...story,publishedAt:new Date(now+3600000).toISOString()},now),null);
assert.equal(validateStory({...story,placeId:'../../private'},now).placeId,null);
assert.equal(deduplicateStories([validateStory(story,now),validateStory({...story,id:'world_2'},now)]).length,1);
console.log('PASS NEWS: fail-closed sources, URL guards, publication dates, place IDs, duplicate suppression');