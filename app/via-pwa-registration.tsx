"use client"
import { useEffect } from "react"

export default function ViaPwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    const register = () => { void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {}) }
    if (document.readyState === "complete") register()
    else {
      window.addEventListener("load", register, { once: true })
      return () => window.removeEventListener("load", register)
    }
  }, [])
  return null
}
