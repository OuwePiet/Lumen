import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Place = {name:string;countryCode:string;admin1?:string;asciiName?:string;alternates?:string[]};
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
 // Offline GeoNames imports are split by country. Never scan a worldwide monolithic
 // file on a serverless request; limit both the candidate files and bytes read.
 if(!country)return NextResponse.json({error:"Selecteer een land voor offline plaatszoeken; wereldwijde index of GeoNames API ontbreekt",places:[],requiresCountry:true},{status:503,headers:{"Cache-Control":"no-store"}});
 const prefix=normalize(q).replace(/[^a-z0-9]+/g," ").trim().slice(0,2);
 const indexedFile=path.join(process.cwd(),"data","via-geography","index",country,prefix+".ndjson");
 const file=existsSync(indexedFile)?indexedFile:path.join(directory,country+".ndjson");
 if(!existsSync(file))return NextResponse.json({error:"Plaatsgegevens voor dit land zijn nog niet geïmporteerd",places:[]},{status:503,headers:{"Cache-Control":"no-store"}});
 const MAX_BYTES=32*1024*1024;
 if(statSync(file).size>MAX_BYTES)return NextResponse.json({error:"Plaatsendatabase vereist een zoekindex voor dit land",places:[],requiresIndex:true},{status:503,headers:{"Cache-Control":"no-store"}});
 const results:Place[]=[];let scanned=0;
 const normalizedQuery=normalize(q);
 try{
  const lines=createInterface({input:createReadStream(file,{encoding:"utf8"}),crlfDelay:Infinity});
  for await(const line of lines){
   scanned++;
   if(!line.trim())continue;
   let p:Place;try{p=JSON.parse(line)}catch{continue}
   if(p.countryCode!==country)continue;
   if([p.name,p.asciiName,...(p.alternates??[])].some(v=>typeof v==="string"&&normalize(v).startsWith(normalizedQuery)))results.push(p);
   if(results.length>=15)break;
  }
 }catch{return NextResponse.json({error:"Plaatsendata niet leesbaar",places:[]},{status:503,headers:{"Cache-Control":"no-store"}})}
 return NextResponse.json({places:results,source:existsSync(indexedFile)?"GeoNames indexed offline":"GeoNames offline",attribution:"GeoNames CC BY 4.0",limited:results.length>=15},{headers:{"Cache-Control":"no-store"}});
}