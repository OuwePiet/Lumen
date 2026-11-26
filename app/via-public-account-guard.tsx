"use client"
import { useEffect } from "react"
import { viaModernIdentity } from "./deso-identity-modern"
export default function ViaPublicAccountGuard() {
  useEffect(() => { viaModernIdentity.resumeRedirect() }, [])
  return null
}