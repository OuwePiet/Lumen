#!/usr/bin/env node
// Build bounded prefix lookup shards from the GeoNames country NDJSON importer.
// Usage: node scripts/index-via-geonames.mjs
// Output: data/via-geography/index/{CC}/{prefix}.ndjson
// GeoNames CC BY 4.0; source: https://www.geonames.org/
import {createReadStream,createWriteStream,existsSync,mkdirSync,readdirSync,renameSync,rmSync} from "node:fs";
import {createInterface} from "node:readline";
import {join} from "node:path";
import {once} from "node:events";
const root=process.cwd(),source=join(root,"data","wereldspiegel","countries");
if(!existsSync(source)){console.error("Run import-wereldspiegel-geonames.mjs first");process.exit(2)}
const output=join(root,"data","via-geography"),staging=join(output,".index-"+process.pid),target=join(output,"index");
mkdirSync(staging,{recursive:true});
const normalize=s=>s.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
let count=0;let shards=0;
try{
 for(const file of readdirSync(source).filter(f=>/^[A-Z]{2}\.ndjson$/.test(f))){
  const country=file.slice(0,2);const streams=new Map();
  for await(const line of createInterface({input:createReadStream(join(source,file)),crlfDelay:Infinity})){
   let p;try{p=JSON.parse(line)}catch{continue}
   if(!p.name)continue;
   const keys=new Set([p.name,p.asciiName,...(p.alternates??[])].filter(Boolean).map(normalize).filter(s=>s.length>=2).map(s=>s.slice(0,2)));
   for(const prefix of keys){
    const dir=join(staging,country);mkdirSync(dir,{recursive:true});
    const key=country+"/"+prefix;
    if(!streams.has(key))streams.set(key,createWriteStream(join(dir,prefix+".ndjson"),{encoding:"utf8"}));
    const stream=streams.get(key);
    if(!stream.write(JSON.stringify(p)+"\n"))await once(stream,"drain");
    count++;
   }
  }
  await Promise.all([...streams.values()].map(s=>new Promise((resolve,reject)=>{s.once("error",reject);s.end(resolve)})));
  shards+=streams.size;
 }

 if(!count)throw Error("No indexed places");
 const backup=join(output,".index-backup-"+process.pid);
 if(existsSync(target))renameSync(target,backup);
 try{renameSync(staging,target)}catch(error){if(existsSync(backup))renameSync(backup,target);throw error}
 if(existsSync(backup))rmSync(backup,{recursive:true,force:true});
 console.log(JSON.stringify({indexedRecords:count,shards,location:target}));
}catch(error){rmSync(staging,{recursive:true,force:true});console.error(error);process.exitCode=1}
