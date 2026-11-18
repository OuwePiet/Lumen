import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const allowed = /^[\p{L}\p{M}\p{N} .,'’()-]+$/u;
export async function GET(request: NextRequest) {
 const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
 const country = (request.nextUrl.searchParams.get("country") ?? "").trim().toUpperCase();
 if (q.length < 2 || q.length > 80 || !allowed.test(q) || (country && !/^[A-Z]{2}$/.test(country))) return NextResponse.json({error:"Ongeldige plaatszoekopdracht",places:[]},{status:400});
 const username = process.env.WERELDSPIEGEL_GEONAMES_USERNAME?.trim();
 if (!username) return NextResponse.json({error:"Wereldwijde GeoNames-zoekdienst is nog niet geconfigureerd",places:[],configured:false},{status:503,headers:{"Cache-Control":"no-store"}});
 try {
  const endpoint = new URL("https://secure.geonames.org/searchJSON");
  endpoint.searchParams.set("username",username);endpoint.searchParams.set("name_startsWith",q);endpoint.searchParams.set("maxRows","20");endpoint.searchParams.set("style","MEDIUM");
  if (country) endpoint.searchParams.set("country",country);
  const results = await Promise.all(["P","A"].map(async featureClass => {const url=new URL(endpoint);url.searchParams.set("featureClass",featureClass);const response=await fetch(url,{signal:AbortSignal.timeout(8000),cache:"no-store"});if(!response.ok)throw new Error("GeoNames unavailable");const data=await response.json();if(data.status)throw new Error("GeoNames rejected request");return Array.isArray(data.geonames)?data.geonames:[];}));
  const seen=new Set<number>();const places=results.flat().filter((p:{geonameId?:number})=>{if(!p.geonameId||seen.has(p.geonameId))return false;seen.add(p.geonameId);return true}).slice(0,20).map((p:{geonameId:number;name?:string;countryCode?:string;adminName1?:string;lat?:string;lng?:string;timezone?:{timeZoneId?:string}})=>({id:p.geonameId,name:p.name??"",countryCode:p.countryCode??"",admin1:p.adminName1??"",lat:Number(p.lat),lng:Number(p.lng),timeZone:p.timezone?.timeZoneId??""}));
  return NextResponse.json({places,source:"GeoNames",attribution:"GeoNames CC BY 4.0"},{headers:{"Cache-Control":"public, max-age=0, s-maxage=3600"}});
 } catch {return NextResponse.json({error:"GeoNames is tijdelijk niet bereikbaar",places:[]},{status:503,headers:{"Cache-Control":"no-store"}});}
}