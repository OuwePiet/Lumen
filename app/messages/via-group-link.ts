type GroupRef={AccessGroupOwnerPublicKeyBase58Check:string;AccessGroupKeyName:string}
export const groupIdentity=(g:GroupRef)=>JSON.stringify([g.AccessGroupOwnerPublicKeyBase58Check,g.AccessGroupKeyName])
export const isConversationGroup=(g:GroupRef)=>Boolean(g.AccessGroupKeyName&&g.AccessGroupKeyName!=="default-key")
export const viaGroupHref=(g:GroupRef)=>"/messages#group="+encodeURIComponent(groupIdentity(g))
export function readGroupLink(hash:string):string|null{
 if(!hash.startsWith("#group=")||hash.length>1024)return null
 try{const x:unknown=JSON.parse(decodeURIComponent(hash.slice(7)));if(!Array.isArray(x)||x.length!==2||typeof x[0]!=="string"||typeof x[1]!=="string"||!x[0]||!isConversationGroup({AccessGroupOwnerPublicKeyBase58Check:x[0],AccessGroupKeyName:x[1]}))return null;return JSON.stringify(x)}catch{return null}
}