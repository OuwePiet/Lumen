"use client";
import { useState } from "react";
import { translateViaTextLocally } from "../via-local-translation";

const languages = [
  ["nl","🇳🇱","NL"],["fy","🇳🇱","FY"],["en","🇬🇧","EN"],
  ["fr","🇫🇷","FR"],["es","🇪🇸","ES"],["zh","🇨🇳","ZH"],
  ["hi","🇮🇳","HI"],["bn","🇮🇳","BN"],["ta","🇮🇳","TA"],
  ["te","🇮🇳","TE"],["mr","🇮🇳","MR"],["pa","🇮🇳","PA"]
] as const;

export default function WorldMirrorTranslate({ title, summary }: { title:string; summary:string }) {
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [output,setOutput]=useState("");
  const [message,setMessage]=useState("");
  const [selected,setSelected]=useState("nl");
  const text=title+"\n\n"+summary;
  async function translate(lang:string){
    setSelected(lang);setBusy(true);setOutput("");setMessage("");
    try { const result=await translateViaTextLocally(text,lang);setOutput(result.text);setMessage(result.message); }
    catch { setMessage("Vertaling niet beschikbaar in deze browser."); }
    finally {setBusy(false);}
  }
  const external="https://translate.google.com/?"+new URLSearchParams({sl:"auto",tl:selected==="zh"?"zh-CN":selected,text,op:"translate"}).toString();
  return <div style={{marginTop:12,fontSize:13}}>
    <button type="button" className="ws-btn" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>{open?"Vertaling sluiten":"🌐 Vertalen"}</button>
    {open&&<div style={{marginTop:8,padding:10,border:"1px solid #bac5b6",borderRadius:8,background:"#fbf9f5"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{languages.map(([code,flag,label])=><button key={code} type="button" className="ws-btn" aria-label={"Vertaal naar "+label} onClick={()=>void translate(code)} style={{padding:"5px 8px",fontWeight:selected===code?700:400}}>{flag} {label}</button>)}</div>
      {busy&&<p role="status">Vertalen…</p>}
      {output&&<p style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{output}</p>}
      {message&&<p role="status">{message} <a href={external} target="_blank" rel="noopener noreferrer">Externe vertaling openen</a></p>}
    </div>}
  </div>;
}
