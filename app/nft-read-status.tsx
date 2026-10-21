"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"
import { nftReadCopy } from "../lib/via/nft-read-copy"

export default function NFTReadStatus(props: Parameters<typeof nftReadCopy>[1]) {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(VIA_SETTINGS_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])
  return <span data-via-native-i18n>{nftReadCopy(language, props)}</span>
}
