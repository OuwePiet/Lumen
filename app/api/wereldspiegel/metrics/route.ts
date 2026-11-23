import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
export const revalidate=3600;
type Metric={value:number;year:string;source:string;scope:string};
const fetchText=async(url:string,seconds:number)=>{const r=await fetch(url,{next:{revalidate:seconds},signal:AbortSignal.timeout(8500)});if(!r.ok)throw Error(`Source ${r.status}`);return r.text()};
async function worldBank(country:string,indicator:string):Promise<Metric|null>{
 try{const raw=await fetchText(`https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=15`,86400);const data=JSON.parse(raw);const row=data?.[1]?.find((r:{value:number|null})=>typeof r.value==="number");return row?{value:row.value,year:row.date,source:"World Bank",scope:country}:null}catch{return null}
}
async function co2():Promise<Metric|null>{
 try{const raw=await fetchText("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt",86400);const rows=raw.split(/\r?\n/).filter(x=>/^\s*\d{4}\s+\d{1,2}\s+/.test(x));for(const line of rows.reverse()){const cols=line.trim().split(/\s+/);const value=Number(cols[3]);if(value>300&&value<1000)return{value,year:`${cols[0]}-${cols[1].padStart(2,"0")}`,source:"NOAA GML (Mauna Loa)",scope:"Station Mauna Loa"}}return null}catch{return null}
}
async function temperature(lat:number,lng:number):Promise<Metric|null>{
 try{const raw=await fetchText(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`,900);const data=JSON.parse(raw);const value=data?.current?.temperature_2m;return typeof value==="number"?{value,year:data.current.time,source:"Open-Meteo",scope:"Local weather model"}:null}catch{return null}
}
export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;const country=(params.get("country")||"").toUpperCase();if(!/^(?:[A-Z]{2}|WLD)$/.test(country))return NextResponse.json({error:"Invalid country"},{status:400});
 const lat=Number(params.get("lat")),lng=Number(params.get("lng"));const hasCoords=params.has("lat")&&params.has("lng")&&Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
 // CBS StatLine 82610NED: total renewable electricity (T001028), normalized gross production as share of electricity consumption.
 // Read the latest available annual observation. No fixed value or guessed update year.
 const cbsTask:Promise<Metric|null>=country==="NL"?(async():Promise<Metric|null>=>{
  for(let year=new Date().getUTCFullYear();year>=new Date().getUTCFullYear()-4;year--){
   try{
    const period=`${year}JJ00`;
    const filter=encodeURIComponent(`Perioden eq '${period}' and BronTechniek eq 'T001028 '`);
    const raw=await fetchText(`https://opendata.cbs.nl/ODataApi/OData/82610NED/TypedDataSet?$filter=${filter}&$top=3`,86400);
    const rows=JSON.parse(raw)?.value as Array<{Perioden:string;BronTechniek:string;GenormaliseerdeBrutoProductie_4:number|null}>|undefined;
    const found=rows?.find(row=>row.Perioden===period&&row.BronTechniek.trim()==="T001028"&&typeof row.GenormaliseerdeBrutoProductie_4==="number");
    if(found)return {value:found.GenormaliseerdeBrutoProductie_4 as number,year:`${year} (CBS)`,source:"CBS StatLine 82610NED",scope:"Aandeel hernieuwbare elektriciteit in elektriciteitsverbruik"};
   }catch{continue}
  }
  return null;
 })():Promise.resolve(null);
 const [population,renewable,carbon,localTemperature,cbsRenewableConsumption]=await Promise.all([worldBank(country,"SP.POP.TOTL"),worldBank(country,"EG.ELC.RNEW.ZS"),co2(),hasCoords?temperature(lat,lng):Promise.resolve(null),cbsTask]);
 return NextResponse.json({population,renewable,cbsRenewableConsumption,carbon,temperature:localTemperature},{headers:{"Cache-Control":"public, max-age=300, stale-while-revalidate=900"}})
}
