import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync, readdirSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Place = {id?:string;name:string;countryCode:string;admin1?:string;featureCode?:string;asciiName?:string;alternates?:string[]};
const normalize=(s:string)=>s.normalize("NFKD").replace(/\p{M}/gu,"").toLocaleLowerCase().trim();
export async function GET(request:NextRequest){
 const q=(request.nextUrl.searchParams.get("q")??"").trim();
 const country=(request.nextUrl.searchParams.get("country")??"").trim().toUpperCase();
 if(q.length<2||q.length>120|| (country && !/^[A-Z]{2}$/.test(country)))return NextResponse.json({error:"Ongeldige zoekopdracht"},{status:400,headers:{"Cache-Control":"no-store"}});
 const geonamesUsername=process.env.WERELDSPIEGEL_GEONAMES_USERNAME?.trim();
 if(geonamesUsername){
  try{
   const url=new URL("https://secure.geonames.org/searchJSON");
   url.searchParams.set("name_startsWith",q);
   url.searchParams.set("maxRows","15");
   // Search both populated places and administrative divisions (districts, provinces).
   url.searchParams.set("style","FULL");
   url.searchParams.set("username",geonamesUsername);
   if(country)url.searchParams.set("country",country);
   const classes=["P","A"];
   const responses=await Promise.all(classes.map(async featureClass=>{
    const requestUrl=new URL(url);requestUrl.searchParams.set("featureClass",featureClass);
    const response=await fetch(requestUrl,{cache:"no-store",signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw Error("GeoNames service unavailable");
    const data=await response.json();
    if(data.status)throw Error("GeoNames API error");
    return Array.isArray(data.geonames)?data.geonames:[];
   }));
   const unique=new Map<string,{name:string;countryCode:string;admin1:string}>();
   for(const p of responses.flat() as {geonameId?:number;name?:string;countryCode?:string;adminName1?:string}[]){
    const key=String(p.geonameId??`${p.countryCode}:${p.name}:${p.adminName1}`);
    if(!unique.has(key))unique.set(key,{name:p.name??"",countryCode:p.countryCode??"",admin1:p.adminName1??""});
   }
   const places=[...unique.values()].slice(0,20);
   return NextResponse.json({places,source:"GeoNames",attribution:"GeoNames CC BY 4.0"},{headers:{"Cache-Control":"no-store"}});
  }catch{
   return NextResponse.json({error:"GeoNames is tijdelijk niet bereikbaar",places:[]},{status:503,headers:{"Cache-Control":"no-store"}});
  }
 }
 const directory=path.join(process.cwd(),"data","wereldspiegel","countries");
 const indexRoot=path.join(process.cwd(),"data","via-geography","index");
 const normalizedQuery=normalize(q);
 const prefix=normalizedQuery.replace(/[^a-z0-9]+/g," ").trim().slice(0,2);
 if(prefix.length<2)return NextResponse.json({places:[],source:"GeoNames offline",attribution:"GeoNames CC BY 4.0"});
 // Scan only the matching two-character prefix in each country; never scan the raw worldwide dump.
 // The indexed files must actually be present in this runtime (local laptop data are not on Vercel).
 const countries=country?[country]:(existsSync(indexRoot)?readdirSync(indexRoot).filter(c=>/^[A-Z]{2}$/.test(c)):[]);
 if(!countries.length)return NextResponse.json({error:"Wereldwijde GeoNames-index is nog niet beschikbaar op deze server",places:[],requiresIndex:true},{status:503,headers:{"Cache-Control":"no-store"}});
 const matches=new Map<string,Place>();
 const MAX_BYTES=32*1024*1024;
 try{
  for(const cc of countries){
   const indexedFile=path.join(indexRoot,cc,prefix+".ndjson");
   const fallback=path.join(directory,cc+".ndjson");
   const file=existsSync(indexedFile)?indexedFile:(country?fallback:"");
   if(!file||!existsSync(file))continue;
   if(statSync(file).size>MAX_BYTES)continue;
   for await(const line of createInterface({input:createReadStream(file,{encoding:"utf8"}),crlfDelay:Infinity})){
    let p:Place;try{p=JSON.parse(line)}catch{continue}
    if(p.countryCode!==cc||!p.name)continue;
    if(![p.name,p.asciiName,...(p.alternates??[])].some(v=>typeof v==="string"&&normalize(v).startsWith(normalizedQuery)))continue;
    const key=String(p.id??cc+":"+p.name+":"+p.admin1);
    matches.set(key,p);
   }
  }
 }catch{return NextResponse.json({error:"Plaatsendata niet leesbaar",places:[]},{status:503,headers:{"Cache-Control":"no-store"}})}
 const score=(p:Place)=>{
  const name=normalize(p.name),exact=name===normalizedQuery;
  const primary=["PPLC","PPLA","PPLA2","PPLA3","PPL"].includes(p.featureCode??"");
  return (exact?100:0)+(name.startsWith(normalizedQuery)?20:0)+(primary?15:0)+(p.featureCode==="PPLC"?15:0)-(p.featureCode==="PPLQ"?40:0);
 };
 const places=[...matches.values()].sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name)).slice(0,20);
 return NextResponse.json({places,source:"GeoNames indexed offline",attribution:"GeoNames CC BY 4.0",limited:matches.size>20},{headers:{"Cache-Control":"no-store"}});
}