import type { Metadata } from "next"
import LivePanel from "./live-panel"
import LiveLocalizer from "./live-localizer"

export const metadata: Metadata = {
  title: "VIA LIVE",
  description: "Live community media, Replay and a clear VIA LIVE guide.",
}

const navLink = {
  color: "#b8c3bd",
  fontWeight: 650,
  textDecoration: "none",
  border: "1px solid rgba(113,130,120,.42)",
  borderRadius: 11,
  padding: "8px 11px",
  background: "transparent",
}

export default function LivePage(){
  return <main id="via-live-page" style={{minHeight:"100vh",background:"#050807",color:"#f4f7f5",padding:"24px 16px 60px"}}>
    <LiveLocalizer />
    <div style={{width:"min(980px,100%)",margin:"0 auto"}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}} aria-label="VIA LIVE navigation">
        <a href="/" style={{...navLink,color:"#9adbb2",borderColor:"rgba(143,212,169,.45)"}}>← VIA</a>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <a href="#live-room" style={navLink}>Live</a>
          <a href="#replay" style={navLink}>Replay</a>
          <a href="/live/guide" style={navLink}>How it works</a>
        </div>
      </nav>
      <header style={{padding:"42px 0 16px",maxWidth:780}}>
        <p style={{margin:0,color:"#8fd4a9",fontWeight:700,letterSpacing:2,fontSize:12}}>VIA · LIVE</p>
        <h1 style={{fontSize:"clamp(32px,6vw,52px)",lineHeight:1.02,margin:"10px 0",letterSpacing:"-.025em"}}>Live conversation, kept simple.</h1>
        <p style={{fontSize:"clamp(16px,2vw,18px)",maxWidth:760,color:"#aebbb4",lineHeight:1.65}}>VIA LIVE is built around three clear destinations: join a live community room, return to published Replays, or read how participation works.</p>
        <p style={{fontSize:14,maxWidth:760,color:"#818d86",lineHeight:1.55}}>Live speaker, microphone, recording and publishing controls remain hidden until they are backed by a real authorised service. VIA does not present planned controls as active.</p>
      </header>
      <LivePanel />
    </div>
  </main>
}
