"use client"

import { useMemo, useState } from "react"

type VaultId = 1 | 2 | 3
type Mode = "normal" | "uv"

type VaultState = {
  solved: boolean
  claimed: boolean
}

const card = {
  border: "1px solid #315a43",
  borderRadius: 22,
  background: "linear-gradient(180deg,#0b1110 0%,#050807 100%)",
  boxShadow: "0 18px 50px rgba(0,0,0,.32)",
  padding: "clamp(18px,3vw,28px)",
  marginTop: 24,
} as const

const button = {
  minHeight: 44,
  borderRadius: 999,
  border: "1px solid #416b50",
  background: "#101a14",
  color: "#dfffea",
  fontWeight: 800,
  padding: "10px 16px",
  cursor: "pointer",
} as const

function vaultTitle(id: VaultId) {
  if (id === 1) return "Vault I · Iron Dial"
  if (id === 2) return "Vault II · Switch Matrix"
  return "Vault III · Chrono Core"
}

export default function VaultBreaker() {
  const [mode, setMode] = useState<Mode>("normal")
  const [vault, setVault] = useState<VaultId>(1)
  const [dialValue, setDialValue] = useState(0)
  const [dialSequence, setDialSequence] = useState<number[]>([])
  const [matrix, setMatrix] = useState([0,0,0,0])
  const [chrono, setChrono] = useState("")
  const [score, setScore] = useState(0)
  const [vaults, setVaults] = useState<Record<VaultId,VaultState>>({
    1:{solved:false,claimed:false},
    2:{solved:false,claimed:false},
    3:{solved:false,claimed:false},
  })
  const [message, setMessage] = useState("Inspect the chamber. UV light reveals hidden clues.")

  const solvedCount = useMemo(() => Object.values(vaults).filter(v=>v.solved).length,[vaults])
  const current = vaults[vault]

  function rotateDial() {
    if (current.solved) return
    setDialValue(value => (value + 1) % 10)
  }

  function lockDial() {
    if (current.solved || vault !== 1) return
    setDialSequence(seq => seq.length >= 3 ? seq : [...seq,dialValue])
  }

  function toggleMatrix(index:number) {
    if (current.solved || vault !== 2) return
    setMatrix(values => values.map((value,i)=>i===index ? (value ? 0 : 1) : value))
  }

  function engage() {
    if (current.solved) return

    let correct = false
    if (vault === 1) {
      correct = dialSequence.join("") === "371"
      if (!correct) setDialSequence([])
    } else if (vault === 2) {
      correct = matrix.join("") === "1011"
    } else {
      correct = chrono === "1321"
    }

    if (!correct) {
      setMessage(vault === 1 ? "Mechanical lock rejected the sequence. Dial sequence reset." : vault === 2 ? "Matrix imbalance. Recheck the UV clue." : "Chrono frequency rejected. Recalculate the sequence.")
      return
    }

    setVaults(currentVaults => ({
      ...currentVaults,
      [vault]: { ...currentVaults[vault], solved:true }
    }))
    setMessage("Vault opened. Claim the local relic score, then move to the next chamber.")
  }

  function claim() {
    if (!current.solved || current.claimed) return
    setScore(value => value + 250)
    setVaults(currentVaults => ({
      ...currentVaults,
      [vault]: { ...currentVaults[vault], claimed:true }
    }))
    setMessage("Relic score claimed. This is local game score only.")
  }

  function resetAll() {
    setMode("normal")
    setVault(1)
    setDialValue(0)
    setDialSequence([])
    setMatrix([0,0,0,0])
    setChrono("")
    setScore(0)
    setVaults({1:{solved:false,claimed:false},2:{solved:false,claimed:false},3:{solved:false,claimed:false}})
    setMessage("Fresh vault run ready.")
  }

  return (
    <article style={card} aria-labelledby="via-vault-heading">
      <p style={{margin:0,color:"#8fd4a9",fontWeight:800,letterSpacing:2,fontSize:12}}>VIA PUZZLE · LOCAL PLAY</p>
      <h2 id="via-vault-heading" style={{fontSize:"clamp(28px,5vw,46px)",margin:"8px 0"}}>VIA Vault Breaker</h2>
      <p style={{color:"#a9b8af",lineHeight:1.65,maxWidth:780}}>
        Three mechanical vaults. Switch to UV mode to reveal clues, solve each mechanism, and collect local relic score. No wallet, token, payment or blockchain action is involved.
      </p>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",margin:"16px 0"}}>
        <button type="button" onClick={()=>setMode("normal")} style={{...button,borderColor:mode==="normal"?"#72d8df":"#416b50",color:mode==="normal"?"#a7fbff":"#dfffea"}}>🔦 Normal light</button>
        <button type="button" onClick={()=>setMode("uv")} style={{...button,borderColor:mode==="uv"?"#9e68d8":"#416b50",color:mode==="uv"?"#e5c7ff":"#dfffea"}}>🔮 UV light</button>
        <strong style={{color:"#f0d090"}}>Relic score {score}</strong>
        <span style={{color:"#8fa299"}}>{solvedCount}/3 vaults solved</span>
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"minmax(150px,220px) 1fr",
        gap:0,
        border:"1px solid #2c3f34",
        borderRadius:18,
        overflow:"hidden",
        minHeight:420,
        background:mode==="uv"?"radial-gradient(circle at 60% 45%,#24112f 0%,#09040d 58%,#030304 100%)":"radial-gradient(circle at 60% 45%,#1b241f 0%,#090d0b 58%,#030504 100%)",
        boxShadow:"inset 0 0 50px rgba(0,0,0,.55)",
      }}>
        <aside style={{padding:14,borderRight:"1px solid #2c3f34",background:"rgba(4,8,6,.72)",display:"grid",alignContent:"start",gap:10}}>
          {([1,2,3] as VaultId[]).map(id=>(
            <button key={id} type="button" onClick={()=>{setVault(id);setMessage(vaultTitle(id))}} style={{
              ...button,
              borderRadius:12,
              textAlign:"left",
              background:vault===id?"#132219":"#0b110d",
              borderColor:vaults[id].solved?"#a88745":vault===id?"#5d9971":"#30463a",
              color:vaults[id].solved?"#f0d090":"#dfffea",
            }}>
              {vaultTitle(id)}{vaults[id].solved ? " ✓" : ""}
            </button>
          ))}
          <button type="button" onClick={resetAll} style={{...button,marginTop:8}}>Reset run</button>
        </aside>

        <section style={{position:"relative",padding:"clamp(18px,4vw,34px)",display:"grid",alignContent:"center",justifyItems:"center",overflow:"hidden"}}>
          <span style={{position:"absolute",top:20,right:24,color:mode==="uv"?"rgba(229,199,255,.78)":"rgba(229,199,255,.02)",fontFamily:"monospace",fontWeight:800,textShadow:mode==="uv"?"0 0 10px #7b3fb2":"none"}}>ORDER 3 → 7 → 1</span>
          <span style={{position:"absolute",bottom:24,left:28,color:mode==="uv"?"rgba(229,199,255,.72)":"rgba(229,199,255,.02)",fontFamily:"monospace",fontWeight:800,textShadow:mode==="uv"?"0 0 10px #7b3fb2":"none"}}>BIN 1011 = HEX B</span>
          <span style={{position:"absolute",top:130,left:22,color:mode==="uv"?"rgba(229,199,255,.64)":"rgba(229,199,255,.02)",fontFamily:"monospace",fontWeight:800,textShadow:mode==="uv"?"0 0 10px #7b3fb2":"none"}}>NEXT PAIR AFTER 8</span>

          {current.solved ? (
            <div style={{textAlign:"center",zIndex:2}}>
              <div style={{fontSize:"clamp(52px,9vw,88px)"}}>🔓</div>
              <h3 style={{fontSize:"clamp(24px,4vw,34px)",margin:"8px 0"}}>{vaultTitle(vault)}</h3>
              <p style={{color:"#a9b8af"}}>Mechanism solved.</p>
              <button type="button" onClick={claim} disabled={current.claimed} style={{...button,opacity:current.claimed?.5:1}}>{current.claimed?"Relic claimed":"Claim 250 relic score"}</button>
            </div>
          ) : vault === 1 ? (
            <div style={{textAlign:"center",zIndex:2,width:"100%",maxWidth:480}}>
              <h3>Iron Dial</h3>
              <p style={{color:"#9aa79f"}}>Rotate the dial, lock three values, then engage.</p>
              <button type="button" onClick={rotateDial} aria-label="Rotate dial" style={{
                width:"clamp(150px,32vw,210px)",aspectRatio:"1",borderRadius:"50%",
                border:"8px solid #4a554d",background:"radial-gradient(circle,#344039 38%,#151a17 72%)",
                color:"#f4fff8",fontSize:"clamp(34px,7vw,54px)",fontWeight:900,cursor:"pointer",
                boxShadow:"0 14px 30px rgba(0,0,0,.45)",transform:`rotate(${dialValue*36}deg)`
              }}>{dialValue}</button>
              <div style={{marginTop:18,display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{fontFamily:"monospace",padding:"10px 16px",background:"#070a08",border:"1px solid #33463b",borderRadius:8,minWidth:110}}>{dialSequence.join("-") || "EMPTY"}</span>
                <button type="button" onClick={lockDial} style={button}>Lock value</button>
              </div>
            </div>
          ) : vault === 2 ? (
            <div style={{textAlign:"center",zIndex:2}}>
              <h3>Switch Matrix</h3>
              <p style={{color:"#9aa79f"}}>Balance the four binary switches.</p>
              <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:22}}>
                {matrix.map((value,index)=>(
                  <button key={index} type="button" onClick={()=>toggleMatrix(index)} aria-pressed={value===1} style={{
                    width:56,height:76,borderRadius:10,border:"2px solid #4a5d50",
                    background:value?"#79e6ba":"#182019",color:value?"#041008":"#dce6df",
                    fontFamily:"monospace",fontWeight:900,fontSize:24,cursor:"pointer",
                    boxShadow:value?"0 0 18px rgba(121,230,186,.25)":"none",
                  }}>{value}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{textAlign:"center",zIndex:2,maxWidth:480}}>
              <h3>Chrono Core</h3>
              <p style={{color:"#9aa79f"}}>Find the next two numbers and enter them as one four-digit code.</p>
              <div style={{fontFamily:"monospace",fontSize:"clamp(18px,4vw,28px)",padding:14,borderRadius:10,background:"#090c0a",border:"1px solid #33463b",margin:"16px 0"}}>0, 1, 1, 2, 3, 5, 8, ...?</div>
              <input value={chrono} onChange={e=>setChrono(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" aria-label="Chrono Core four digit code" placeholder="____" style={{width:140,textAlign:"center",fontFamily:"monospace",fontSize:24,letterSpacing:4,padding:"10px 12px",borderRadius:8,border:"1px solid #425749",background:"#0a0f0c",color:"#f4fff8"}}/>
            </div>
          )}

          {!current.solved ? <button type="button" onClick={engage} style={{...button,marginTop:26,background:"#173522",borderColor:"#5c9a70"}}>ENGAGE</button> : null}
        </section>
      </div>

      <p role="status" aria-live="polite" style={{minHeight:24,color:"#b9c8bf",marginTop:14}}>{message}</p>
      <small style={{color:"#7f9487"}}>Local puzzle score only. No financial value, no DeSo reward, no wallet action.</small>
    </article>
  )
}
