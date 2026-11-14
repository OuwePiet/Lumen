import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type Article={title:string;url:string;source:string;publishedAt:string;language:string;locationMatch:"title"|"unverified";locationLabel:string;countryCode:string;admin1:string};
type Result={articles:Article[];provider:string;disclaimer:string;fetchedAt:string};
const CACHE_TTL=15*60*1000;
const COOLDOWN=5500;
const cache=new Map<string,{value:Result;expires:number}>();
let nextRequestAt=0;
const safeUrl=(value:unknown)=>{try{const u=new URL(String(value));return ["https:","http:"].includes(u.protocol)?u.toString():null}catch{return null}};
function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
export async function GET(request:NextRequest){
 const q=(request.nextUrl.searchParams.get("q")??"").normalize("NFC").trim().replace(/\s+/g," ");
 if(q.length<2||q.length>100)return json({error:"Zoekterm moet 2–100 tekens zijn",articles:[]},400);
 const country=(request.nextUrl.searchParams.get("country")??"").trim().toUpperCase();
 const admin1=(request.nextUrl.searchParams.get("admin1")??"").trim().slice(0,80);
 if(country&&!/^[A-Z]{2}$/.test(country))return json({error:"Ongeldige landcode",articles:[]},400);
 const key=[q.toLocaleLowerCase(),country,admin1.toLocaleLowerCase()].join("|");const now=Date.now();
 const existing=cache.get(key);
 if(existing&&existing.expires>now)return json({...existing.value,cached:true});
 if(now<nextRequestAt)return json({error:"Nieuwszoekdienst wordt tijdelijk beperkt; probeer het later opnieuw",articles:[],retryAfterSeconds:Math.ceil((nextRequestAt-now)/1000)},429);
 nextRequestAt=now+COOLDOWN;
 const url=new URL("https://api.gdeltproject.org/api/v2/doc/doc");
 url.searchParams.set("query",'"'+q.replace(/["\\]/g," ").trim()+'"');
 url.searchParams.set("mode","ArtList");url.searchParams.set("format","json");
 url.searchParams.set("maxrecords","20");url.searchParams.set("timespan","7d");url.searchParams.set("sort","DateDesc");
 try{
  const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(10000),headers:{"Accept":"application/json"}});
  if(response.status===429){nextRequestAt=Date.now()+60000;return json({error:"GDELT heeft tijdelijk een verzoeklimiet bereikt",articles:[],retryAfterSeconds:60},429)}
  if(!response.ok||!(response.headers.get("content-type")??"").toLowerCase().includes("json"))throw Error("GDELT unavailable");
  const data=await response.json();
  const seen=new Set<string>();const articles:Article[]=[];
  for(const raw of Array.isArray(data.articles)?data.articles:[]){
   const link=safeUrl(raw.url),title=String(raw.title??"").trim();
   if(!link||!title||seen.has(link))continue;
   seen.add(link);
   const normalizedTitle=title.normalize("NFKD").replace(/\\p{M}/gu,"").toLocaleLowerCase();
   const normalizedPlace=q.normalize("NFKD").replace(/\\p{M}/gu,"").toLocaleLowerCase();
   const locationMatch=normalizedTitle.includes(normalizedPlace)?"title":"unverified";
   articles.push({title:title.slice(0,240),url:link,source:String(raw.domain??new URL(link).hostname).slice(0,120),publishedAt:String(raw.seendate??""),language:String(raw.language??""),locationMatch,locationLabel:q,countryCode:country,admin1});
  }
  const value:Result={articles,provider:"GDELT Project",disclaimer:"Publisher links only; articles are not independently fact-checked or location-verified",fetchedAt:new Date().toISOString()};
  if(cache.size>200)cache.clear();
  cache.set(key,{value,expires:Date.now()+CACHE_TTL});
  return json(value);
 }catch{return json({error:"Nieuwszoekdienst tijdelijk niet beschikbaar",articles:[]},503)}
}
