import type { Metadata } from "next"
import LivePanel from "./live-panel"

export const metadata: Metadata = {
  title: "VIA LIVE",
  description: "Audio-first community rooms, Replays and factual media diagnostics.",
}

export default function LivePage(){
  return <main style={{minHeight:"100vh",background:"#020504",color:"white",padding:"24px 16px 60px"}}>
    <div style={{width:"min(980px,100%)",margin:"0 auto"}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <a href="/" style={{color:"#7ee2a8",fontWeight:900,textDecoration:"none"}}>← VIA</a>
        <span style={{fontSize:13,opacity:.72}}>LIVE · Replay · Media Health</span>
      </nav>
      <header style={{padding:"46px 0 16px"}}>
        <p style={{margin:0,color:"#7ee2a8",fontWeight:900,letterSpacing:2}}>VIA LIVE</p>
        <h1 style={{fontSize:"clamp(38px,8vw,72px)",lineHeight:1,margin:"10px 0"}}>Listen live. Speak without camera.</h1>
        <p style={{fontSize:"clamp(16px,2.5vw,20px)",maxWidth:760,opacity:.82}}>Audio-first community conversations with explicit recording controls, later Replay playback and a Media Health panel that reports only what VIA can actually verify.</p>
      </header>
      <LivePanel />
    </div>
  </main>
}
