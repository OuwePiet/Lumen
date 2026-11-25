"use client"
import { useEffect, useState } from "react"
import { getUserAssociations } from "deso-protocol"
import type { ViaLanguage } from "../via-local-settings"
const labels: Record<ViaLanguage,string[]> = {
 Dutch:["DeSo-lidmaatschapsrelaties","Geen relaties gevonden","Niet beschikbaar","Vernieuwen","Laden...","Een registratie is geen bewijs van toelating door een beheerder."],
 English:["DeSo membership associations","No associations found","Unavailable","Refresh","Loading...","A recorded association is not proof of approval by a group administrator."],
 French:["Relations de membre DeSo","Aucune relation","Indisponible","Actualiser","Chargement...","Une relation ne prouve pas une admission par un administrateur."],
 Spanish:["Relaciones de membresia DeSo","Sin relaciones","No disponible","Actualizar","Cargando...","Una relacion no demuestra la aprobacion del administrador."],
 Chinese:["DeSo \u6210\u5458\u5173\u8054","\u6ca1\u6709\u5173\u8054","\u6682\u4e0d\u53ef\u7528","\u5237\u65b0","\u52a0\u8f7d\u4e2d...","\u5173\u8054\u4e0d\u4ee3\u8868\u7ba1\u7406\u5458\u5df2\u6279\u51c6\u52a0\u5165\u3002"],
 Hindi:["DeSo \u0938\u0926\u0938\u094d\u092f\u0924\u093e","\u0915\u094b\u0908 \u0938\u0902\u092c\u0902\u0927 \u0928\u0939\u0940\u0902","\u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902","\u0930\u093f\u092b\u094d\u0930\u0947\u0936","\u0932\u094b\u0921\u093f\u0902\u0917...","\u0938\u0902\u092c\u0902\u0927 \u0938\u092e\u0942\u0939 \u092a\u094d\u0930\u092c\u0902\u0927\u0915 \u0915\u0940 \u0938\u094d\u0935\u0940\u0915\u0943\u0924\u093f \u0915\u093e \u092a\u094d\u0930\u092e\u093e\u0923 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964"]
}
type Entry={id:string;target:string;value:string;app:string}
export default function CommunityAssociations({publicKey,language}:{publicKey:string;language:ViaLanguage}){
 const t=labels[language];const [revision,setRevision]=useState(0);const [state,setState]=useState<{entries:Entry[];failed:boolean}|null>(null)
 useEffect(()=>{let active=true;setState(null);void getUserAssociations({TransactorPublicKeyBase58Check:publicKey,AssociationType:"GROUP_MEMBERSHIP",Limit:50},{nodeURI:"https://node.deso.org"}).then(data=>{if(!Array.isArray(data.Associations))throw Error("INVALID_ASSOCIATIONS");const entries=data.Associations.filter(a=>a.TransactorPublicKeyBase58Check===publicKey&&a.AssociationType.toUpperCase()==="GROUP_MEMBERSHIP").map(a=>({id:a.AssociationID,target:a.TargetUserPublicKeyBase58Check,value:a.AssociationValue,app:a.AppPublicKeyBase58Check}));if(active)setState({entries,failed:false})}).catch(()=>{if(active)setState({entries:[],failed:true})});return()=>{active=false}},[publicKey,revision])
 return <div className="mt-3 border-t border-[#b99d6b]/30 pt-3"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{t[0]}</h3><button type="button" className="rounded border border-[#b99d6b]/40 px-3 py-2 text-sm" onClick={()=>setRevision(n=>n+1)}>{t[3]}</button></div><p className="text-xs text-zinc-400">{t[5]}</p>{!state?<p role="status">{t[4]}</p>:state.failed?<p role="status">{t[2]}</p>:state.entries.length===0?<p className="text-sm">{t[1]}</p>:<ul>{state.entries.map(a=><li key={a.id} className="break-all border-b border-white/10 py-2 text-xs"><strong>{a.value}</strong><div>{a.target}</div><div>App: {a.app||"-"}</div></li>)}</ul>}</div>
}