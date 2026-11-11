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
const [micMessage,setMicMessage]=useState(""),[listening,setListening]=useState(false),[navOpen,setNavOpen]=useState(false),[showViaHeader,setShowViaHeader]=useState(false),[toolsOpen,setToolsOpen]=useState(false),[country,setCountry]=useState("world"),[query,setQuery]=useState(""),[chosen,setChosen]=useState(""),[page,setPage]=useState(0),[font,setFont]=useState(18),[focus,setFocus]=useState(false),[wide,setWide]=useState(false);
useEffect(()=>{const check=()=>setWide(window.innerWidth>=760);check();window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check)},[]);
const pages=useMemo(()=>[{title:"Welkom bij De WereldSpiegel",summary:"Een rustige wereldkrant, van grote landen tot de kleinste dorpen. Dit is een proef met fictieve teksten; live nieuws is nog niet aangesloten.",country:"",place:"Wereldeditie",source:"VIA proef" },...stories.filter(s=>country==="world"||s.country===country),{title:"Tot de volgende editie",summary:"De krant heeft een einde. Geen eindeloos scrollen, geen opdringerige meldingen.",country:"",place:"Wereldeditie",source:"VIA proef"}],[country]);
const step=wide?2:1;const start=wide?Math.floor(page/2)*2:page;const index=Math.min(start,wide?Math.floor((pages.length-1)/2)*2:pages.length-1);
useEffect(()=>{setPage(0)},[country]);
const move=(delta:number)=>setPage(p=>Math.max(0,Math.min(p+delta*(wide?2:1),wide?Math.floor((pages.length-1)/2)*2:pages.length-1)));
useEffect(()=>{const key=(e:KeyboardEvent)=>{if(["INPUT","SELECT","TEXTAREA"].includes((document.activeElement?.tagName||"")))return;if(e.key==="ArrowRight")move(1);if(e.key==="ArrowLeft")move(-1)};document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[wide,pages.length]);
function startVoiceSearch(){setToolsOpen(true);setMicMessage("");const W=window as Window & {SpeechRecognition?:new()=>any;webkitSpeechRecognition?:new()=>any};const Engine=W.SpeechRecognition||W.webkitSpeechRecognition;if(!Engine){setMicMessage("Spraakherkenning is niet beschikbaar in deze browser. Gebruik de zoekbalk.");return}try{const recognition=new Engine();recognition.lang="nl-NL";recognition.interimResults=false;recognition.onresult=(event)=>{const spoken=event.results[0]?.[0]?.transcript?.trim();if(spoken){setQuery(spoken);setChosen("");setMicMessage("Gehoord: "+spoken)}};recognition.onerror=(event)=>{setMicMessage(event.error==="not-allowed"?"Microfoontoegang geweigerd. Controleer Safari-instellingen.":"Spraakherkenning niet gelukt; typ je zoekopdracht.");setListening(false)};recognition.onend=()=>setListening(false);setListening(true);recognition.start()}catch{setListening(false);setMicMessage("De microfoon kon niet worden gestart.")}}
const filtered=places.filter(p=>p.join(" ").toLowerCase().includes(query.toLowerCase())).slice(0,5);
return <main className={`wereldspiegel-proef-root ${showViaHeader?"ws-show-via-header":""}`} style={{minHeight:"100vh",background:"#fbf9f5",color:"#25372b",fontFamily:"system-ui, sans-serif",padding:"18px"}}>
<style>{` body:has(.wereldspiegel-proef-root):not(:has(.ws-show-via-header)) .via-site-header{display:none!important} body:has(.wereldspiegel-proef-root){background:#fbf9f5!important;color:#25372b!important} .ws-btn,.ws-select,.ws-input{font:inherit;border:1px solid #bac5b6;background:white;border-radius:9px;padding:10px 13px;color:#24382e}.ws-btn{cursor:pointer}.ws-btn:disabled{opacity:.4}.ws-paper{background:#fffefb;border:1px solid #e0ddd4;border-radius:14px;padding:clamp(18px,3vw,34px);min-height:390px;box-shadow:0 5px 18px #28372a0a;overflow-wrap:anywhere}.ws-btn:focus-visible,.ws-select:focus-visible,.ws-input:focus-visible{outline:3px solid #a96d47}`}</style>
<button className="ws-btn" aria-label={navOpen?"Sluit VIA-menu":"Open VIA-menu"} aria-expanded={navOpen} aria-controls="ws-via-menu" onClick={()=>setNavOpen(v=>!v)} style={{position:"fixed",left:8,top:"calc(env(safe-area-inset-top) + 14px)",zIndex:201,padding:"9px 12px",boxShadow:"0 4px 18px #0002"}}>{navOpen?"✕":"☰ VIA"}</button>
{navOpen&&<><button aria-label="Sluit VIA-menu" onClick={()=>setNavOpen(false)} style={{position:"fixed",inset:0,zIndex:198,background:"#101b1490",border:0}}/>
<aside id="ws-via-menu" aria-label="VIA navigatie" style={{position:"fixed",left:0,top:0,bottom:0,zIndex:200,width:"min(320px,85vw)",background:"#f7f8f3",boxShadow:"6px 0 24px #0003",padding:"64px 16px 20px",overflowY:"auto"}}>
<h2 style={{fontFamily:"Georgia,serif",fontSize:27,margin:"0 0 14px"}}>VIA</h2>
<nav style={{display:"grid",gap:7}}>{[["Home","/"],["Postkantoor","/social"],["Ontdekken","/discover"],["NFT's","/collection"],["Live","/live"],["Spellen","/quest"],["Community's","/communities"],["Wereld","/world"],["Mijn VIA","/my-via"],["Wallet","/wallet"],["Meldingen","/notifications"],["Handboek VIA","/help"],["VIA Play","/music"]].map(([name,url])=><Link key={url} href={url} className="ws-btn" style={{textDecoration:"none"}}>{name}</Link>)}</nav>
<button className="ws-btn" style={{width:"100%",marginTop:14}} onClick={()=>{setShowViaHeader(v=>!v);setNavOpen(false)}}>{showViaHeader?"Verberg originele VIA-balk":"Toon originele VIA-balk (login en account)"}</button>
<p style={{fontSize:12,lineHeight:1.6,color:"#627165"}}>De originele VIA-balk blijft beschikbaar voor accountfuncties. De microfoon is nog niet bevestigd als aangesloten functie.</p>
</aside></>}
<div style={{maxWidth:1200,margin:"auto"}}>
<header style={{borderBottom:"1px solid #ddd9cd",paddingBottom:9}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
<div><div style={{fontSize:10,letterSpacing:1.7,color:"#60705f"}}>VIA · BESCHERMDE LEESPROEF</div><h1 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:"clamp(25px,3vw,36px)",lineHeight:1.1,margin:"3px 0"}}>De WereldSpiegel</h1></div>
<div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
<Link className="ws-btn" href="/" aria-label="Sluit De WereldSpiegel en ga terug naar VIA" title="Sluit De WereldSpiegel" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:5}}>✕ Sluiten</Link>
<button className="ws-btn" onClick={startVoiceSearch} aria-label="Zoek met microfoon" title="Zoek met microfoon" aria-busy={listening}>🎤 {listening?"Luistert…":"Microfoon"}</button>
<button className="ws-btn" onClick={()=>setToolsOpen(v=>!v)} aria-expanded={toolsOpen} aria-controls="ws-tools">{toolsOpen?"Sluit instellingen":"Zoeken en instellingen"}</button>
<button className="ws-btn" aria-pressed={focus} onClick={()=>setFocus(f=>!f)}>{focus?"Normaal":"Leesrust"}</button>
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
<p style={{fontSize:12,letterSpacing:1.2,color:"#946a4e",margin:"10px 0"}}>DEMONSTRATIE · ALLE BERICHTEN FICTIEF</p>
<div style={{display:"grid",gridTemplateColumns:wide&&index+1<pages.length?"repeat(2,minmax(0,1fr))":"1fr",gap:12}}>
{pages.slice(index,index+step).map((s,i)=><article key={index+i} className="ws-paper" style={{fontSize:font}}><p style={{color:"#946a4e",fontSize:12,letterSpacing:1.2}}>WERELDSPIEGEL · {s.place}</p><h2 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:"1.7em",lineHeight:1.2,margin:"18px 0"}}>{s.title}</h2><p style={{lineHeight:1.8}}>{s.summary}</p><p style={{color:"#69736d",fontSize:13,marginTop:28}}>Bron: {s.source} · Fictieve proeftekst</p></article>)}
</div>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",margin:"16px 0"}}><button className="ws-btn" disabled={index===0} onClick={()=>move(-1)}>← Vorige pagina</button><span style={{fontSize:13,color:"#69736d"}}>Pagina {index+1}{wide&&index+1<pages.length?"–"+(index+2):""} van {pages.length}</span><button className="ws-btn" disabled={index+step>=pages.length} onClick={()=>move(1)}>Volgende pagina →</button></div>
<aside style={{borderLeft:"3px solid #819b82",background:"#f1f3ed",padding:"12px 16px",lineHeight:1.6,fontSize:14}}><strong>Proefsite, geen actuele krant.</strong> Er zijn nog geen live nieuwsfeeds, echte foto's of advertenties aangesloten. Deze preview gebruikt geen DeSo-login, wallets of ondertekening.</aside>
<footer style={{padding:"25px 0",fontSize:12,color:"#69736d"}}>De WereldSpiegel · gratis leesconcept · geen login of betaalmuur · <a href="/" style={{color:"#3c7151"}}>Terug naar VIA</a></footer>
</div></main>;
}