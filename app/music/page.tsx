"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = { title: string; intro: string; safety: string }

const destinationStyle = "flex min-h-11 items-center justify-center rounded-lg border border-[#285f40] px-3 py-2 text-center text-sm text-[#9adbb2] hover:border-[#8fd4a9]"

const COPY: Record<ViaLanguage, Copy> = {
  Dutch: {
    title: "VIA Play",
    intro: "Vrij toegankelijk om muziek en creators te ontdekken. DeSo-login wordt gebruikt voor deelname en interactieve functies.",
    safety: "Muziekopslag, publieke veiligheid, creatorbescherming en betalingen worden als aparte gecontroleerde VIA-laag aangesloten voordat uploads of transacties worden vrijgegeven.",
  },
  English: {
    title: "VIA Play",
    intro: "Open to everyone for discovering music and creators. DeSo login is used for participation and interactive features.",
    safety: "Music storage, public safety, creator protection and payments will be connected as a separate controlled VIA layer before uploads or transactions are enabled.",
  },
  French: {
    title: "VIA Play",
    intro: "Accessible à tous pour découvrir de la musique et des créateurs. La connexion DeSo est utilisée pour participer et accéder aux fonctions interactives.",
    safety: "Le stockage musical, la sécurité publique, la protection des créateurs et les paiements seront connectés dans une couche VIA contrôlée distincte avant l’activation des téléchargements ou des transactions.",
  },
  Spanish: {
    title: "VIA Play",
    intro: "Acceso libre para descubrir música y creadores. El inicio de sesión con DeSo se utiliza para participar y usar funciones interactivas.",
    safety: "El almacenamiento de música, la seguridad pública, la protección de creadores y los pagos se conectarán como una capa VIA controlada e independiente antes de habilitar cargas o transacciones.",
  },
  Chinese: {
    title: "VIA Play",
    intro: "任何人都可以自由发现音乐和创作者。参与互动功能时使用 DeSo 登录。",
    safety: "在开放上传或交易之前，音乐存储、公共安全、创作者保护和支付将作为独立且受控的 VIA 层接入。",
  },
  Hindi: {
    title: "VIA Play",
    intro: "संगीत और क्रिएटर्स खोजने के लिए सभी को खुली पहुँच है। भागीदारी और इंटरैक्टिव सुविधाओं के लिए DeSo लॉगिन का उपयोग किया जाता है।",
    safety: "अपलोड या लेनदेन सक्षम करने से पहले संगीत स्टोरेज, सार्वजनिक सुरक्षा, क्रिएटर सुरक्षा और भुगतान को एक अलग नियंत्रित VIA परत के रूप में जोड़ा जाएगा।",
  },
}

export default function MusicPage() {
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

  const copy = COPY[language]

  return (
    <main className="min-h-screen bg-[#050807] px-3 py-4 text-[#e8f1eb]">
      <section className="mx-auto max-w-[980px] rounded-2xl border border-[#294231] bg-[#09120d] p-3 sm:p-4">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <nav aria-label="VIA Play" className="mt-3 grid gap-2 sm:grid-cols-3">
          <Link href="/radio" className={destinationStyle}>{language === "Dutch" ? "Wereldradio" : "World Radio"}</Link>
          <Link href="/discover/voices" className={destinationStyle}>{language === "Dutch" ? "Ontdek creators" : "Discover creators"}</Link>
          <Link href="/collection?media=audio" className={destinationStyle}>{language === "Dutch" ? "Muziekcollecties" : "Music collections"}</Link>
        </nav>
        <details className="mt-2 text-sm text-[#b8c6bd]">
          <summary className="w-fit cursor-pointer rounded-lg px-2 py-2 text-[#9adbb2]">Info</summary>
          <div className="max-w-2xl space-y-2 px-2 pb-2 leading-6">
            <p>{copy.intro}</p>
            <p>{copy.safety}</p>
          </div>
        </details>
      </section>
    </main>
  )
}
