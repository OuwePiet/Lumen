"use client"
import {uploadImage,identity} from "deso-protocol"
import {viaModernIdentity} from "../deso-identity-modern"
export async function uploadNativeImage(key:string,file:File){
 if(!["image/gif","image/jpeg","image/png","image/webp"].includes(file.type)||file.size<=0||file.size>=10*1024*1024)throw new Error("INVALID_IMAGE")
 const check=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("DESO_ACCOUNT_CHANGED_RECONNECT")}
 await check()
 const jwt=await viaModernIdentity.jwt()
 await check()
 const result=await uploadImage({UserPublicKeyBase58Check:key,file,JWT:jwt})
 await check()
 const url=new URL(result.ImageURL)
 if(url.protocol!=="https:"||url.username||url.password||url.href.length>2048)throw new Error("INVALID_IMAGE_URL")
 return {imageUrl:url.href}
}