"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
type Story={title:string;summary:string;country:string;place:string;source:string};
const stories:Story[]=[
{title:"Fictief: buurtbewoners bespreken een gezamenlijke tuin",summary:"Uitsluitend een fictief voorbeeld van een lokaal bericht in Nederland. Dit is geen verslag van een echte gebeurtenis.",country:"NL",place:"Voorbeeldplaats",source:"Demonstratie"},
{title:"Fictief: Japanse wijk bespreekt groenonderhoud",summary:"Een fictief verhaal om de wereldeditie en de dubbele pagina te tonen.",country:"JP",place:"Voorbeeldwijk",source:"Demonstratie"},
{title:"Fictief: Costa Rica bespreekt een buurttuin",summary:"Derde fictieve testpagina voor de eindige wereldeditie.",country:"CR",place:"Voorbeeldgemeenschap",source:"Demonstratie"}];
const places=[["Walpolamulla","Sri Lanka"],["Shani Shingnapur","India"],["Riyad","Saoedi-Arabië"],["Burundi","Afrika"],["Papoea-Nieuw-Guinea","Oceanië"]];
export default function WereldSpiegelPreview(){
const [micMessage,setMicMessage]=useState(""),[listening,setListening]=useState(false),[navOpen,setNavOpen]=useState(false),[showViaHeader,setShowViaHeader]=useState(false),[toolsOpen,setToolsOpen]=useState(false),[country,setCountry]=useState("world"),[query,setQuery]=useState(""),[chosen,setChosen]=useState(""),[page,setPage]=useState(0),[font,setFont]=useState(18),[focus,setFocus]=useState(false),[readingIndex,setReadingIndex]=useState(0),[wide,setWide]=useState(false);
useEffect(()=>{const check=()=>setWide(window.innerWidth>=760);check();window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check)},[]);
const pages=useMemo(()=>[{title:"Welkom bij De WereldSpiegel",summary:"Een rustige wereldkrant, van grote landen tot de kleinste dorpen. Dit is een proef met fictieve teksten; live nieuws is nog niet aangesloten.",country:"",place:"Wereldeditie",source:"VIA proef" },...stories.filter(s=>country==="world"||s.country===country),{title:"Tot de volgende editie",summary:"De krant heeft een einde. Geen eindeloos scrollen, geen opdringerige meldingen.",country:"",place:"Wereldeditie",source:"VIA proef"}],[country]);
const step=wide?2:1;const start=wide?Math.floor(page/2)*2:page;const index=Math.min(start,wide?Math.floor((pages.length-1)/2)*2:pages.length-1);
useEffect(()=>{setPage(0);setReadingIndex(0);setFocus(false)},[country]);
const move=(delta:number)=>setPage(p=>Math.max(0,Math.min(p+delta*(wide?2:1),wide?Math.floor((pages.length-1)/2)*2:pages.length-1)));
useEffect(()=>{const key=(e:KeyboardEvent)=>{if(["INPUT","SELECT","TEXTAREA"].includes((document.activeElement?.tagName||"")))return;if(e.key==="ArrowRight")move(1);if(e.key==="ArrowLeft")move(-1)};document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[wide,pages.length]);
async function startVoiceSearch(){
setToolsOpen(true);setMicMessage("");
if(!window.isSecureContext){setMicMessage("Voor microfoontoegang is een beveiligde HTTPS-verbinding nodig.");return}
const W=window as Window & {SpeechRecognition?:new()=>any;webkitSpeechRecognition?:new()=>any};
const Engine=W.SpeechRecognition||W.webkitSpeechRecognition;
if(!Engine){setMicMessage("Deze browser ondersteunt spraakherkenning niet. Gebruik de zoekbalk of Safari.");return}
if(!navigator.mediaDevices?.getUserMedia){setMicMessage("Deze browser biedt geen microfoontoegang aan websites. Gebruik de zoekbalk.");return}
setMicMessage("Microfoontoegang aanvragen…");
let stream:MediaStream;
try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}
catch(error){const name=error instanceof DOMException?error.name:"onbekend";setMicMessage(name==="NotAllowedError"||name==="PermissionDeniedError"?"Microfoontoegang is niet toegestaan. Sta microfoongebruik toe in de browserinstellingen.":name==="NotFoundError"?"Geen microfoon gevonden op dit apparaat.": "Microfoontoegang mislukt ("+name+"). Gebruik de zoekbalk.");return}
stream.getTracks().forEach(track=>track.stop());
setMicMessage("Microfoontoegang verleend. Spraakherkenning starten…");
try{
const recognition=new Engine();recognition.lang="nl-NL";recognition.interimResults=false;
recognition.onresult=(event)=>{const spoken=event.results[0]?.[0]?.transcript?.trim();if(spoken){setQuery(spoken);setChosen("");setMicMessage("Gehoord: "+spoken)}};
recognition.onerror=(event)=>{const code=String(event.error||"onbekend");const detail:Record<string,string>={"not-allowed":"Microfoontoegang was verleend, maar de browser weigert de afzonderlijke spraakherkenning.","service-not-allowed":"Microfoontoegang was verleend, maar Safari staat de spraakherkenningsdienst niet toe.","audio-capture":"Microfoontoegang was verleend, maar de spraakherkenning kan geen audio ontvangen.","network":"De spraakherkenningsdienst is niet bereikbaar.","no-speech":"Geen spraak gehoord. Probeer het opnieuw.","language-not-supported":"Deze browser ondersteunt de gekozen spreektaal niet.","aborted":"Spraakherkenning afgebroken."};setMicMessage((detail[code]||"Spraakherkenning mislukt.")+" (code: "+code+"). Je kunt blijven typen.");setListening(false)};
recognition.onend=()=>setListening(false);setListening(true);setMicMessage("Luisteren…");recognition.start()
}catch(error){setListening(false);setMicMessage("Spraakherkenning kon niet starten ("+(error instanceof Error?error.name:"onbekend")+"). Gebruik de zoekbalk.")}
}
const filtered=places.filter(p=>p.join(" ").toLowerCase().includes(query.toLowerCase())).slice(0,5);
return <main className={`wereldspiegel-proef-root ${showViaHeader?"ws-show-via-header":""}`} style={{minHeight:"100vh",background:"#fbf9f5",color:"#25372b",fontFamily:"system-ui, sans-serif",padding:"18px"}}>
<style>{` body:has(.wereldspiegel-proef-root):not(:has(.ws-show-via-header)) .via-site-header{display:none!important} body:has(.wereldspiegel-proef-root){background:#fbf9f5!important;color:#25372b!important} .ws-btn,.ws-select,.ws-input{font:inherit;border:1px solid #bac5b6;background:white;border-radius:9px;padding:10px 13px;color:#24382e}.ws-btn{cursor:pointer}.ws-btn:disabled{opacity:.4}.ws-paper{background:#fffefb;border:1px solid #e0ddd4;border-radius:14px;padding:clamp(18px,3vw,34px);min-height:390px;box-shadow:0 5px 18px #28372a0a;overflow-wrap:anywhere}.ws-btn:focus-visible,.ws-select:focus-visible,.ws-input:focus-visible{outline:3px solid #a96d47}`}</style>

{navOpen&&<><button aria-label="Sluit VIA-menu" onClick={()=>setNavOpen(false)} style={{position:"fixed",inset:0,zIndex:198,background:"#101b1490",border:0}}/>
<aside id="ws-via-menu" aria-label="VIA navigatie" style={{position:"fixed",left:0,top:0,bottom:0,zIndex:200,width:"min(320px,85vw)",background:"#f7f8f3",boxShadow:"6px 0 24px #0003",padding:"64px 16px 20px",overflowY:"auto"}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><img src="/via-logo-original.jpg?v=1" alt="VIA" style={{width:70,height:54,objectFit:"contain"}} /><h2 style={{fontFamily:"Georgia,serif",fontSize:24,margin:0}}>VIA-menu</h2></div>
<nav style={{display:"grid",gap:7}}>{[["Home","/"],["Postkantoor","/social"],["Ontdekken","/discover"],["NFT's","/collection"],["Live","/live"],["Spellen","/quest"],["Community's","/communities"],["Wereld","/world"],["Mijn VIA","/my-via"],["Wallet","/wallet"],["Meldingen","/notifications"],["Handboek VIA","/help"],["VIA Play","/music"],["De WereldSpiegel","/wereldspiegel"]].map(([name,url])=><Link key={url} href={url} className="ws-btn" style={{textDecoration:"none"}}>{name}</Link>)}</nav>
<div style={{display:"grid",gap:7,marginTop:14}}><Link className="ws-btn" href="/" style={{textDecoration:"none"}}>✕ Sluiten · terug naar VIA</Link><button className="ws-btn" onClick={()=>{setToolsOpen(true);setFocus(false);setNavOpen(false)}}>Zoeken en instellingen</button></div><button className="ws-btn" style={{width:"100%",marginTop:14}} onClick={()=>{setShowViaHeader(v=>!v);setNavOpen(false)}}>{showViaHeader?"Verberg originele VIA-balk":"Toon originele VIA-balk (login en account)"}</button>
<p style={{fontSize:12,lineHeight:1.6,color:"#627165"}}>De WereldSpiegel is openbaar. Accountfuncties blijven onderdeel van de bestaande VIA-navigatie. Spraakherkenning is niet op alle apparaten beschikbaar.</p>
</aside></>}
<div style={{maxWidth:1200,margin:"auto"}}>
<header style={{borderBottom:"1px solid #ddd9cd",paddingBottom:9}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
<div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}><button className="ws-btn" aria-label={navOpen?"Sluit VIA-menu":"Open VIA-menu"} aria-expanded={navOpen} aria-controls="ws-via-menu" onClick={()=>setNavOpen(v=>!v)} style={{padding:"9px 12px"}}>{navOpen?"✕":"☰ Menu"}</button><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><div><div style={{fontSize:10,letterSpacing:1.7,color:"#60705f"}}>OPENBARE LEESPROEF</div><h1 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:"clamp(25px,3vw,36px)",lineHeight:1.1,margin:"3px 0"}}>De WereldSpiegel</h1></div><span style={{fontSize:13,color:"#60705f",whiteSpace:"nowrap"}}>verzorgd door</span><Link href="/" aria-label="VIA Home" title="VIA Home" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",textDecoration:"none",border:"1px solid #bac5b6",borderRadius:9,background:"#fffefb",height:44,width:56,boxSizing:"border-box",overflow:"hidden"}}><img src="/via-logo-original.jpg?v=1" alt="VIA" style={{width:44,height:34,objectFit:"contain",borderRadius:5,filter:"invert(1)",mixBlendMode:"multiply"}} /></Link><Link href="/" style={{fontSize:13,color:"#25372b",textDecoration:"none",whiteSpace:"nowrap"}}>viadeso.online</Link></div></div>
<div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>

<button className="ws-btn" onClick={startVoiceSearch} aria-label="Zoek met microfoon" title="Zoek met microfoon" aria-busy={listening}><span aria-hidden="true" style={{filter:"grayscale(1)",display:"inline-block"}}>🎤</span> {listening?"Luistert…":"Microfoon"}</button>

<button className="ws-btn" aria-pressed={focus} onClick={()=>{setFocus(f=>!f);setReadingIndex(index);setToolsOpen(false)}}>{focus?"← Terug naar krant":"Leesrust"}</button>
</div></div>
{toolsOpen&&!focus&&<section id="ws-tools" style={{padding:"12px 0 3px",display:"grid",gap:10}}>
<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><label>Land <select className="ws-select" value={country} onChange={e=>setCountry(e.target.value)}><option value="world">De wereld</option><option value="NL">Nederland</option><option value="JP">Japan</option><option value="CR">Costa Rica</option></select></label><button className="ws-btn" onClick={()=>setFont(f=>Math.min(26,f+2))}>A+ tekst</button><button className="ws-btn" onClick={()=>setFont(f=>Math.max(14,f-2))}>A− tekst</button></div>
<label htmlFor="ws-place">Zoek een land, stad of dorp</label>
{micMessage&&<p role="status" style={{fontSize:13,color:"#526d54"}}>{micMessage}</p>}
<input id="ws-place" className="ws-input" style={{width:"100%",maxWidth:650}} placeholder="Walpolamulla of Riyad" value={query} onChange={e=>{setQuery(e.target.value);setChosen("")}}/>
<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{query&&filtered.map(p=><button key={p[0]} className="ws-btn" onClick={()=>{setChosen(p.join(" · "));setQuery(p[0])}}>{p[0]} · {p[1]}</button>)}</div>
{query&&<p style={{fontSize:13,color:"#69736d"}}>{chosen?chosen+" — nog geen live lokaal nieuws":!filtered.length?"Niet in de kleine proefindex; de plaats kan wel bestaan.":"Kies een locatie uit de proefindex."}</p>}
<p style={{fontSize:12,color:"#69736d"}}>De proefindex bevat vijf locaties; de wereldwijde plaatsendatabase is nog niet aangesloten.</p>
</section>}
</header>
{!focus&&<p style={{fontSize:12,letterSpacing:1.2,color:"#946a4e",margin:"10px 0"}}>DEMONSTRATIE · ALLE BERICHTEN FICTIEF</p>}
<div style={{display:"grid",gridTemplateColumns:focus?"1fr":wide&&index+1<pages.length?"repeat(2,minmax(0,1fr))":"1fr",gap:12,maxWidth:focus?760:undefined,margin:focus?"24px auto":"0"}}>
{(focus?pages.slice(readingIndex,readingIndex+1):pages.slice(index,index+step)).map((s,i)=><article key={index+i} className="ws-paper" style={{fontSize:focus?Math.max(font,20):font,minHeight:focus?"min(65vh,650px)":460,background:focus?"#f8f2e6":"#fffefb",padding:focus?"clamp(28px,6vw,64px)":undefined}}><p style={{color:"#946a4e",fontSize:12,letterSpacing:1.2}}>WERELDSPIEGEL · {s.place}</p><h2 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:"1.7em",lineHeight:1.2,margin:"18px 0"}}>{s.title}</h2><p style={{lineHeight:1.8}}>{s.summary}</p><p style={{color:"#69736d",fontSize:13,marginTop:28}}>Bron: {s.source} · Fictieve proeftekst</p></article>)}
</div>
{!focus?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",margin:"16px 0"}}><button className="ws-btn" disabled={index===0} onClick={()=>move(-1)}>← Vorige pagina</button><span style={{fontSize:13,color:"#69736d"}}>Pagina {index+1}{wide&&index+1<pages.length?"–"+(index+2):""} van {pages.length}</span><button className="ws-btn" disabled={index+step>=pages.length} onClick={()=>move(1)}>Volgende pagina →</button></div>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,margin:"20px 0"}}><span style={{fontSize:13}}>Einde van dit artikel</span><button className="ws-btn" onClick={()=>setFocus(false)}>Terug naar krantenoverzicht</button></div>}
{!focus&&<aside style={{borderLeft:"3px solid #819b82",background:"#f1f3ed",padding:"12px 16px",lineHeight:1.6,fontSize:14}}><strong>Proefsite, geen actuele krant.</strong> Er zijn nog geen live nieuwsfeeds, echte foto's of advertenties aangesloten. Deze krantpagina gebruikt geen DeSo-login, wallets of ondertekening. De volledige beveiligingscontrole en echte nieuwsvoorziening zijn nog niet afgerond.</aside>}
<footer style={{padding:"25px 0",fontSize:12,color:"#69736d"}}>De WereldSpiegel · gratis leesconcept · geen login of betaalmuur</footer>
</div></main>;
}