"use client"
import {uploadImage} from "deso-protocol"
import {viaModernIdentity} from "../deso-identity-modern"
export async function uploadNativeImage(key:string,file:File){
 if(!["image/gif","image/jpeg","image/png","image/webp"].includes(file.type)||file.size<=0||file.size>10_000_000)throw new Error("INVALID_IMAGE")
 const jwt=await viaModernIdentity.jwt()
 const result=await uploadImage({UserPublicKeyBase58Check:key,file,JWT:jwt})
 const url=new URL(result.ImageURL)
 if(url.protocol!=="https:"||url.username||url.password)throw new Error("INVALID_IMAGE_URL")
 return {imageUrl:result.ImageURL}
}