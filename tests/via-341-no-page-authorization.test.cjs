const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../app');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
test('3.4.1: no page or transaction helper may request a new Identity grant',()=>{
 for(const file of walk(root).filter(f=>/\.tsx?$/.test(f))){
  const rel=path.relative(root,file).replace(/\\/g,'/');
  assert.doesNotMatch(fs.readFileSync(file,'utf8'),/\.\s*(requestPermissions|derive)\s*\(/,rel);
 }
});