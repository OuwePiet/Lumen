"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {viaGroupHref,isConversationGroup} from "../messages/via-group-link"
import CommunityAssociations from "./community-associations"
import { getAllAccessGroups } from "deso-protocol"
import { viaModernIdentity } from "../deso-identity-modern"
import type { ViaLanguage } from "../via-local-settings"
const labels: Record<ViaLanguage,string[]> = {
 Dutch:["Mijn groepen","Eigen groepen","Lid van","Geen groepen gevonden","Groepen niet beschikbaar","Open de homepage om in te loggen","Vernieuwen","Laden...","WereldKalender"],
 English:["My groups","Owned groups","Member of","No groups found","Groups unavailable","Open the homepage to sign in","Refresh","Loading...","World Calendar"],
 French:["Mes groupes","Mes groupes geres","Membre de","Aucun groupe","Groupes indisponibles","Connexion sur la page accueil","Actualiser","Chargement...","Calendrier mondial"],
 Spanish:["Mis grupos","Grupos propios","Miembro de","Sin grupos","Grupos no disponibles","Inicia sesion en la portada","Actualizar","Cargando...","Calendario mundial"],
 Chinese:["My groups","Owned groups","Member of","No groups found","Groups unavailable","Sign in on homepage","Refresh","Loading...","World Calendar"],
 Hindi:["My groups","Owned groups","Member of","No groups found","Groups unavailable","Sign in on homepage","Refresh","Loading...","World Calendar"]
}
type Group={AccessGroupOwnerPublicKeyBase58Check:string;AccessGroupKeyName:string}
export default function CommunityMemberships({language}:{language:ViaLanguage}){
 const t=labels[language]; const [key,setKey]=useState("");const [ready,setReady]=useState(false);const [revision,setRevision]=useState(0);const [result,setResult]=useState<{key:string;owned:Group[];member:Group[];error:boolean}|null>(null)
 useEffect(()=>viaModernIdentity.subscribe(user=>{setKey(user?.publicKey??"");setReady(true)}),[])
 useEffect(()=>{let active=true; if(!key){setResult(null);return} setResult(null);void getAllAccessGroups({PublicKeyBase58Check:key}).then(data=>{if(active)setResult({key,owned:(data.AccessGroupsOwned??[]).filter(isConversationGroup),member:(data.AccessGroupsMember??[]).filter(isConversationGroup),error:false})}).catch(()=>{if(active)setResult({key,owned:[],member:[],error:true})});return()=>{active=false}},[key,revision])
 const current=result?.key===key?result:null
 return <section className="mb-4 rounded-xl border border-[#b99d6b]/40 bg-[#0b1a14] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-[#e5ce90]">{t[0]} · DeSo Access Groups</h2><div className="flex flex-wrap gap-2">{key&&<button type="button" className="rounded border border-[#b99d6b]/40 px-3 py-2 text-sm" onClick={()=>setRevision(n=>n+1)}>{t[6]}</button>}{key&&<Link href="/wereldkalender" className="rounded border border-[#b99d6b]/40 px-3 py-2 text-sm">{t[8]}</Link>}</div></div>{!ready?<p>{t[7]}</p>:!key?<Link href="/" className="text-sm underline">{t[5]}</Link>:!current?<p role="status">{t[7]}</p>:current.error?<p role="status">{t[4]}</p>:<div className="mt-2 grid gap-2 sm:grid-cols-2">{([current.owned,current.member] as Group[][]).map((groups,i)=><div key={i}><h3 className="text-sm font-medium">{t[i+1]}</h3>{groups.length===0?<p className="text-sm text-zinc-400">{t[3]}</p>:groups.map((group)=><div key={group.AccessGroupOwnerPublicKeyBase58Check+":"+group.AccessGroupKeyName} className="break-all border-b border-white/10 py-2 text-sm"><Link className="font-semibold underline" href={viaGroupHref(group)}>{group.AccessGroupKeyName}</Link><div className="text-xs text-zinc-400">{group.AccessGroupOwnerPublicKeyBase58Check}</div></div>)}</div>)}</div>}{key&&<CommunityAssociations key={key} publicKey={key} language={language} />}</section>
}