import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VIA LIVE Guide",
  description: "Quick-start guide for listening, speaking, recording awareness and Replay on VIA LIVE.",
}

const card = {background:"#0b1510",border:"1px solid #285f40",borderRadius:18,padding:20} as const

export default function LiveGuidePage() {
  return <main style={{minHeight:"100vh",background:"#050807",color:"#f4f7f5",fontFamily:"Arial, Helvetica, sans-serif",padding:"36px 20px 72px"}}>
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <nav style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:28}}>
        <a href="/live" style={{color:"#b9ffd4",textDecoration:"none",fontWeight:800}}>← VIA LIVE</a>
        <a href="/" style={{color:"#b9ffd4",textDecoration:"none",fontWeight:800}}>VIA home</a>
      </nav>
      <p style={{color:"#5cff9d",fontWeight:800,letterSpacing:".16em",textTransform:"uppercase"}}>VIA LIVE GUIDE</p>
      <h1 style={{fontSize:"clamp(34px,6vw,58px)",margin:"8px 0 12px"}}>Live audio in one minute</h1>
      <p style={{color:"#a9b8af",fontSize:17,lineHeight:1.7,maxWidth:760}}>VIA LIVE is audio-first. A camera is not required. You can listen quietly, ask to speak, and return later to a Replay when the host has chosen to publish one.</p>

      <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,margin:"28px 0"}}>
        <article style={card}><h2>1 · Listen</h2><p>Open the LIVE room and join as a listener. No camera is required for an audio-first room.</p></article>
        <article style={card}><h2>2 · Speak</h2><p>Use the room controls to request permission to speak when speaker moderation is connected for that room.</p></article>
        <article style={card}><h2>3 · Recording</h2><p>Check the visible recording state before speaking. VIA does not treat joining a room as automatic permission to record you.</p></article>
        <article style={card}><h2>4 · Replay</h2><p>If the host records and later explicitly publishes the session, the Replay can be listened to separately afterwards.</p></article>
      </section>

      <section style={{...card,marginTop:18}}>
        <h2>For hosts</h2>
        <p style={{lineHeight:1.7}}>Keep live participation, recording and publishing separate. Inform participants before recording starts. Recording must never silently become a public Replay. Provider-specific instructions are only added after that provider connection has been technically verified and tested.</p>
      </section>

      <section style={{...card,marginTop:18}}>
        <h2>Safety and privacy</h2>
        <p style={{lineHeight:1.7}}>Never enter a DeSo seed phrase, private key or signing secret into a LIVE room. Listening and Replay playback are read-only. Any later DeSo publishing or tipping action uses a separate verified signing flow.</p>
      </section>

      <section style={{...card,marginTop:18}}>
        <h2>Current status</h2>
        <p style={{lineHeight:1.7}}>The VIA LIVE interface, Replay foundation and Media Health diagnostics exist. External meeting-provider integration, live speaker control and production recording are not presented as active until their APIs, permissions, privacy rules and costs have been verified.</p>
      </section>
    </div>
  </main>
}
