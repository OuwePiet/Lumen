"use client"
import {getNotifications,getUnreadNotificationsCount} from "deso-protocol"
export async function readNativeNotifications(publicKey:string,fetchStartIndex=-1,numToFetch=40){
 const data=await getNotifications({PublicKeyBase58Check:publicKey,FetchStartIndex:fetchStartIndex,NumToFetch:numToFetch,FilteredOutNotificationCategories:{}})
 if(data.Notifications!==null&&!Array.isArray(data.Notifications))throw new Error("INVALID_NOTIFICATIONS")
 return {ok:true,notifications:data.Notifications??[],lastSeenIndex:data.LastSeenIndex}
}
export async function readNativeUnread(publicKey:string){
 // SDK 3.4.1 declares the request type as the response; validate the actual response.
 const data=await getUnreadNotificationsCount({PublicKeyBase58Check:publicKey}) as unknown as {NotificationsCount?:unknown}
 const count=data.NotificationsCount
 if(typeof count!=="number"||!Number.isSafeInteger(count)||count<0)throw new Error("INVALID_UNREAD_COUNT")
 return {ok:true,unreadCount:count}
}