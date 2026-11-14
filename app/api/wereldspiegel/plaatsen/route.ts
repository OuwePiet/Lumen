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
   url.searchParams.set("featureClass","P");
   url.searchParams.set("style","FULL");
   url.searchParams.set("username",geonamesUsername);
   if(country)url.searchParams.set("country",country);
   const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error("GeoNames service unavailable");
   const data=await response.json();
   if(data.status)throw Error("GeoNames API error");
   const places=(Array.isArray(data.geonames)?data.geonames:[]).map((p:{name?:string;countryCode?:string;adminName1?:string})=>({name:p.name??"",countryCode:p.countryCode??"",admin1:p.adminName1??""}));
   return NextResponse.json({places,source:"GeoNames",attribution:"GeoNames CC BY 4.0"},{headers:{"Cache-Control":"no-store"}});
  }catch{
   return NextResponse.json({error:"GeoNames is tijdelijk niet bereikbaar",places:[]},{status:503,headers:{"Cache-Control":"no-store"}});
  }
 }
 const file=path.join(process.cwd(),"data","wereldspiegel","places.ndjson");
 if(!existsSync(file))return NextResponse.json({error:"Wereldwijde plaatsendata is nog niet geïmporteerd",places:[]},{status:503,headers:{"Cache-Control":"no-store"}});
 if(statSync(file).size>128*1024*1024)return NextResponse.json({error:"De wereldwijde plaatsendatabase is te groot voor deze zoekmethode; er is een index nodig",places:[]},{status:503,headers:{"Cache-Control":"no-store"}});
 const results:Place[]=[];let scanned=0;
 try {
 const lines=createInterface({input:createReadStream(file,{encoding:"utf8"}),crlfDelay:Infinity});
 for await(const line of lines){
  if(++scanned>500000)break;
  if(!line.trim())continue;
  let p:Place;try{p=JSON.parse(line)}catch{continue}
  if(country&&p.countryCode!==country)continue;
  if([p.name,p.asciiName,...(p.alternates??[])].some(v=>typeof v==="string"&&normalize(v).includes(normalize(q))))results.push(p);
  if(results.length>=15)break;
 }
 }catch{return NextResponse.json({error:"Plaatsendata niet leesbaar",places:[]},{status:503,headers:{"Cache-Control":"no-store"}})}
 return NextResponse.json({places:results,limited:scanned>500000},{headers:{"Cache-Control":"no-store"}});
}