"use client"

import { useEffect } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT } from "./deso-identity-session"

const HIDDEN_MARK = "viaGuardHidden"
const SAVED_HREF = "viaGuardHref"

function hideElement(element: HTMLElement) {
  if (element.dataset[HIDDEN_MARK] === "1") return
  element.dataset[HIDDEN_MARK] = "1"
  element.dataset.viaGuardDisplay = element.style.display
  element.style.display = "none"
}

function restoreHiddenElements() {
  document.querySelectorAll<HTMLElement>(`[data-${HIDDEN_MARK.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="1"]`).forEach((element) => {
    element.style.display = element.dataset.viaGuardDisplay ?? ""
    delete element.dataset[HIDDEN_MARK]
    delete element.dataset.viaGuardDisplay
  })
}

function disableProfileLinks() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/profile/"]').forEach((link) => {
    if (!link.dataset[SAVED_HREF]) link.dataset[SAVED_HREF] = link.getAttribute("href") ?? ""
    link.removeAttribute("href")
    link.setAttribute("aria-disabled", "true")
    link.style.cursor = "default"
    link.style.pointerEvents = "none"
  })
}

function restoreProfileLinks() {
  document.querySelectorAll<HTMLAnchorElement>(`a[data-${SAVED_HREF.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}]`).forEach((link) => {
    const href = link.dataset[SAVED_HREF]
    if (href) link.setAttribute("href", href)
    link.removeAttribute("aria-disabled")
    link.style.cursor = ""
    link.style.pointerEvents = ""
    delete link.dataset[SAVED_HREF]
  })
}

function hideAccountEntrances() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/discover/voices"]').forEach(hideElement)

  const lookupHeading = document.getElementById("account-lookup-heading")
  const lookupSection = lookupHeading?.closest<HTMLElement>("section")
  if (lookupSection) hideElement(lookupSection)

  document.querySelectorAll<HTMLInputElement>('input[name="publicKey"], input[name="account"]').forEach((input) => {
    const form = input.closest<HTMLElement>("form")
    const section = form?.closest<HTMLElement>("section")
    if (section) hideElement(section)
    else if (form) hideElement(form)
  })

  disableProfileLinks()
}

function cleanRestrictedUrl() {
  const { pathname, search, hash } = window.location

  if (pathname === "/discover/voices" || pathname === "/profile" || pathname.startsWith("/profile/")) {
    window.location.replace("/public")
    return true
  }

  const params = new URLSearchParams(search)
  let changed = false

  if (pathname === "/collection") {
    for (const key of ["account", "accountKey"]) {
      if (params.has(key)) {
        params.delete(key)
        changed = true
      }
    }
  }

  if (pathname === "/market" && params.has("publicKey")) {
    params.delete("publicKey")
    changed = true
  }

  if (changed) {
    const query = params.toString()
    window.location.replace(`${pathname}${query ? `?${query}` : ""}${hash}`)
    return true
  }

  return false
}

export default function ViaPublicAccountGuard() {
  useEffect(() => {
    let observer: MutationObserver | null = null

    const apply = () => {
      const hasSession = Boolean(restoreIdentitySession())
      document.body.classList.toggle("via-deso-session", hasSession)
      document.body.classList.toggle("via-no-deso-session", !hasSession)
      document.body.classList.remove("via-session-pending")

      if (hasSession) {
        restoreHiddenElements()
        restoreProfileLinks()
        return
      }

      if (cleanRestrictedUrl()) return
      hideAccountEntrances()
    }

    apply()
    observer = new MutationObserver(() => apply())
    observer.observe(document.body, { childList: true, subtree: true })

    const onIdentity = () => apply()
    const onHistory = () => apply()
    window.addEventListener(VIA_IDENTITY_EVENT, onIdentity)
    window.addEventListener("popstate", onHistory)

    return () => {
      observer?.disconnect()
      window.removeEventListener(VIA_IDENTITY_EVENT, onIdentity)
      window.removeEventListener("popstate", onHistory)
    }
  }, [])

  return null
}
