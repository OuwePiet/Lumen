/** Shared, read-only GEO shard search for VIA calendar and newspaper. @OuwePiet 2026 */
export type ViaGeoPlace = {id:string;name:string;countryCode:string;admin1:string;lat:number;lng:number;featureCode:string};
type GeoIndex = {country:string;places:[string,string,string,number,number,string][]};
const normalized=(s:string)=>s.normalize("NFKD").replace(/\p{M}/gu,"").toLocaleLowerCase();
const base="/wereldkalender19/geo/";
const cache=new Map<string,Promise<GeoIndex>>();
async function load(url:string,signal?:AbortSignal):Promise<GeoIndex>{
  if(!cache.has(url)){
    const promise=(async()=>{
      const response=await fetch(url,{credentials:"omit",cache:"force-cache"});
      if(!response.ok||!response.body)throw new Error("GEO-bestand niet beschikbaar");
      if(!url.endsWith(".gz"))return await response.json() as GeoIndex;
      const raw=await response.arrayBuffer();
      const bytes=new Uint8Array(raw);
      // Some static hosts set Content-Encoding and fetch transparently decodes gzip.
      if(bytes.length>=2&&bytes[0]===0x1f&&bytes[1]===0x8b){
        if(typeof DecompressionStream!=="function")throw new Error("Browser ondersteunt GEO-gzip niet");
        return await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("gzip"))).json() as GeoIndex;
      }
      return JSON.parse(new TextDecoder().decode(bytes)) as GeoIndex;
    })();
    cache.set(url,promise);
    if(cache.size>8){const oldest=cache.keys().next().value;if(oldest)cache.delete(oldest)}
    promise.catch(()=>{if(cache.get(url)===promise)cache.delete(url)});
  }
  if(signal?.aborted)throw new DOMException("Zoeken afgebroken","AbortError");
  return await cache.get(url)!;
}
export async function viaSearchGeoShards(country:string,query:string,limit=8,signal?:AbortSignal):Promise<ViaGeoPlace[]>{
  if(!/^[A-Z]{2}$/.test(country)||query.trim().length<2)return [];
  const term=normalized(query.trim()),root=base+country;
  const manifest=await fetch(root+"/manifest.json",{credentials:"omit",cache:"force-cache",signal});
  if(!manifest.ok)throw new Error("Voor dit land is de plaatszoekindex nog niet aangesloten");
  const data=await manifest.json() as {country:string;shards:string[]};
  if(data.country!==country||!Array.isArray(data.shards)||data.shards.some(x=>!/^(?:[a-z0-9]|other)$/.test(x)))throw new Error("Ongeldige GEO-index");
  const first=[...term].find(x=>/[\p{L}\p{N}]/u.test(x))||"_";
  const prefix=/[a-z0-9]/.test(first)?first:"other";
  let candidates=data.shards;
  if(term.length>=2){
    const routingResponse=await fetch(root+"/grams2.json",{credentials:"omit",cache:"force-cache",signal});
    if(routingResponse.ok){
      const routing=await routingResponse.json() as {country:string;grams:Record<string,string>};
      if(routing.country!==country||!routing.grams)throw new Error("Ongeldige GEO-zoekrouter");
      let possible=new Set(data.shards);
      for(let i=0;i<term.length-1;i++){
        const shards=(routing.grams[term.slice(i,i+2)]||"").split(",").filter(Boolean);
        possible=new Set([...possible].filter(x=>shards.includes(x)));
      }
      candidates=data.shards.filter(x=>possible.has(x));
    }
  }
  const order=[prefix,...candidates.filter(x=>x!==prefix)].filter(x=>candidates.includes(x));
  const found:ViaGeoPlace[]=[];
  for(const shard of order){
    if(signal?.aborted)throw new DOMException("Zoeken afgebroken","AbortError");
    const index=await load(root+"/"+shard+".json.gz",signal);
    if(index.country!==country||!Array.isArray(index.places))throw new Error("Ongeldige GEO-gegevens");
    for(const row of index.places){
      if(!normalized(row[1]).includes(term))continue;
      found.push({id:row[0],name:row[1],countryCode:country,admin1:row[2],lat:row[3],lng:row[4],featureCode:row[5]});
    }
    // Scan all candidate shards: a later shard may contain a better exact match.
  }
  const rank=(p:ViaGeoPlace)=>{
    const n=normalized(p.name),type=p.featureCode==="PPLC"?-25:p.featureCode==="PPLA"?-20:p.featureCode.startsWith("PPL")?-15:p.featureCode.startsWith("ADM")?15:0;
    return (n===term?0:n.startsWith(term)?100:200)+type;
  };
  return found.sort((a,b)=>rank(a)-rank(b)||a.name.length-b.name.length||a.name.localeCompare(b.name)).slice(0,limit);
}
