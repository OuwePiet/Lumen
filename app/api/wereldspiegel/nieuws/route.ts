import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type Article={title:string;url:string;source:string;publishedAt:string;language:string};
const safeUrl=(value:unknown)=>{try{const u=new URL(String(value));return u.protocol==="https:"||u.protocol==="http:"?u.toString():null}catch{return null}};
export async function GET(request:NextRequest){
 const q=(request.nextUrl.searchParams.get("q")??"").trim();
 if(q.length<2||q.length>100)return NextResponse.json({error:"Zoekterm moet 2–100 tekens zijn",articles:[]},{status:400,headers:{"Cache-Control":"no-store"}});
 const url=new URL("https://api.gdeltproject.org/api/v2/doc/doc");
 url.searchParams.set("query",'"'+q.replace(/["\\]/g," ").replace(/\s+/g," ").trim()+'"');
 url.searchParams.set("mode","ArtList");url.searchParams.set("format","json");url.searchParams.set("maxrecords","20");
 url.searchParams.set("timespan","7d");url.searchParams.set("sort","DateDesc");
 try{
  const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(10000),headers:{"Accept":"application/json"}});
  if(!response.ok||!(response.headers.get("content-type")??"").includes("json"))throw Error("GDELT unavailable");
  const data=await response.json();
  const seen=new Set<string>();const articles:Article[]=[];
  for(const raw of Array.isArray(data.articles)?data.articles:[]){
   const link=safeUrl(raw.url),title=String(raw.title??"").trim();
   if(!link||!title||seen.has(link))continue;
   seen.add(link);
   articles.push({title:title.slice(0,240),url:link,source:String(raw.domain??new URL(link).hostname).slice(0,120),publishedAt:String(raw.seendate??""),language:String(raw.language??"")});
  }
  return NextResponse.json({articles,provider:"GDELT Project",disclaimer:"Links to original publishers; location relevance and facts are not independently verified"},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Nieuwszoekdienst tijdelijk niet beschikbaar",articles:[]},{status:503,headers:{"Cache-Control":"no-store"}})}
}
