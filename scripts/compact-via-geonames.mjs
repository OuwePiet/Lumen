#!/usr/bin/env node
// Produce compact, country-separated GeoNames lookup data from the existing local index.
// No account or external hosting required. Output is NOT automatically committed or deployed.
// Usage: node scripts/compact-via-geonames.mjs "C:\\Users\\peter\\VIA-geonames\\data\\via-geography\\index" "C:\\temp\\via-geonames-compact"
import {createReadStream,createWriteStream,existsSync,mkdirSync,readdirSync} from "node:fs";
import {createInterface} from "node:readline";
import {join} from "node:path";
import {once} from "node:events";
const [source,destination]=process.argv.slice(2);
if(!source||!destination||!existsSync(source)){console.error("Provide existing GeoNames index and output directory");process.exit(2)}
mkdirSync(destination,{recursive:true});
let countries=0,entries=0;
for(const cc of readdirSync(source).filter(n=>/^[A-Z]{2}$/.test(n))){
 const dir=join(source,cc);const seen=new Set();const out=createWriteStream(join(destination,cc+".ndjson"),{encoding:"utf8"});
 for(const filename of readdirSync(dir).filter(n=>n.endsWith(".ndjson"))){
  for await(const line of createInterface({input:createReadStream(join(dir,filename)),crlfDelay:Infinity})){
   let p;try{p=JSON.parse(line)}catch{continue}
   if(!p.id||!p.name||seen.has(p.id))continue;
   seen.add(p.id);const record={id:p.id,name:p.name,countryCode:p.countryCode,admin1:p.admin1,featureCode:p.featureCode,lat:p.lat,lng:p.lng};
   if(!out.write(JSON.stringify(record)+"\n"))await once(out,"drain");entries++;
  }
 }
 await new Promise((resolve,reject)=>{out.once("error",reject);out.end(resolve)});countries++;console.log(`${cc}: ${seen.size} places`);
}
console.log(JSON.stringify({countries,entries,destination,license:"GeoNames CC BY 4.0"}));