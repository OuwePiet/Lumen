"use client"
import { useViaIdentitySession } from "../use-via-identity-session"
export default function CalendarFrame() {
  const account = useViaIdentitySession()?.publicKey
  if (!account) return null
  return <iframe key={account} title="VIA Wereldkalender 19" src={`/wereldkalender19/index.html#account=${encodeURIComponent(account)}`} style={{display:"block",width:"100%",height:"max(520px, calc(100dvh - 54px))",border:0}} loading="eager" referrerPolicy="strict-origin-when-cross-origin" />
}