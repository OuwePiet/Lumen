#!/usr/bin/env node
// Offline GeoNames TSV import. Usage: node scripts/import-wereldspiegel-geonames.mjs /path/to/allCountries.txt
// Source: https://download.geonames.org/export/dump/allCountries.zip (extract allCountries.txt first)
// GeoNames data is CC BY 4.0. Preserve attribution.
import {createReadStream,createWriteStream,existsSync,mkdirSync,renameSync,rmSync} from "node:fs";
import {createInterface} from "node:readline";
import {join} from "node:path";
import {once} from "node:events";
const source=process.argv[2];
if(!source||!existsSync(source)){console.error("Provide existing allCountries.txt file");process.exit(2)}
const output=join(process.cwd(),"data","wereldspiegel");
const staging=join(output,".places-import-"+process.pid);
mkdirSync(staging,{recursive:true});
const streams=new Map();const counts=new Map();let total=0;
try{
 for await(const line of createInterface({input:createReadStream(source),crlfDelay:Infinity})){
  const fields=line.split("\t");
  if(fields.length<19)continue;
  const [id,name,asciiName,alternateNames,lat,lng,featureClass,featureCode,countryCode,,admin1]=fields;
  if(!["P","A"].includes(featureClass)||!/^[A-Z]{2}$/.test(countryCode)||!name)continue;
  const aliases=[...new Set(alternateNames.split(",").filter(Boolean))].slice(0,256);
  const record=JSON.stringify({id,name,asciiName,alternates:aliases,countryCode,admin1,featureClass,featureCode,lat:Number(lat),lng:Number(lng)})+"\n";
  if(!streams.has(countryCode))streams.set(countryCode,createWriteStream(join(staging,countryCode+".ndjson"),{encoding:"utf8"}));
  const stream=streams.get(countryCode);
  if(!stream.write(record))await once(stream,"drain");
  counts.set(countryCode,(counts.get(countryCode)??0)+1);total++;
 }
 await Promise.all([...streams.values()].map(s=>new Promise((resolve,reject)=>{s.once("error",reject);s.end(resolve)})));
 if(!total)throw Error("No usable GeoNames records; previous dataset remains intact");
 const target=join(output,"countries");
 const backup=join(output,".countries-backup-"+process.pid);
 if(existsSync(target))renameSync(target,backup);
 try{renameSync(staging,target)}catch(error){if(existsSync(backup))renameSync(backup,target);throw error}
 if(existsSync(backup))rmSync(backup,{recursive:true,force:true});
 console.log(JSON.stringify({imported:total,countries:counts.size,location:target}));
}catch(error){rmSync(staging,{recursive:true,force:true});console.error(error);process.exitCode=1}
