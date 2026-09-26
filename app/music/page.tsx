"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = { title: string; intro: string; safety: string }

const COPY: Record<ViaLanguage, Copy> = {
  Dutch: {
    title: "VIA Muziek",
    intro: "Vrij toegankelijk om muziek en creators te ontdekken. DeSo-login wordt gebruikt voor deelname en interactieve functies.",
    safety: "Muziekopslag, publieke veiligheid, creatorbescherming en betalingen worden als aparte gecontroleerde VIA-laag aangesloten voordat uploads of transacties worden vrijgegeven.",
  },
  English: {
    title: "VIA Music",
    intro: "Open to everyone for discovering music and creators. DeSo login is used for participation and interactive features.",
    safety: "Music storage, public safety, creator protection and payments will be connected as a separate controlled VIA layer before uploads or transactions are enabled.",
  },
  French: {
    title: "VIA Musique",
    intro: "Accessible à tous pour découvrir de la musique et des créateurs. La connexion DeSo est utilisée pour participer et accéder aux fonctions interactives.",
    safety: "Le stockage musical, la sécurité publique, la protection des créateurs et les paiements seront connectés dans une couche VIA contrôlée distincte avant l’activation des téléchargements ou des transactions.",
  },
  Spanish: {
    title: "VIA Música",
    intro: "Acceso libre para descubrir música y creadores. El inicio de sesión con DeSo se utiliza para participar y usar funciones interactivas.",
    safety: "El almacenamiento de música, la seguridad pública, la protección de creadores y los pagos se conectarán como una capa VIA controlada e independiente antes de habilitar cargas o transacciones.",
  },
  Chinese: {
    title: "VIA 音乐",
    intro: "任何人都可以自由发现音乐和创作者。参与互动功能时使用 DeSo 登录。",
    safety: "在开放上传或交易之前，音乐存储、公共安全、创作者保护和支付将作为独立且受控的 VIA 层接入。",
  },
  Hindi: {
    title: "VIA संगीत",
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
    <main style={{ minHeight: "100vh", background: "#050807", color: "#e8f1eb", padding: "clamp(28px,5vw,72px) 20px 110px" }}>
      <section style={{ width: "min(980px,100%)", margin: "0 auto", border: "1px solid rgba(143,212,169,.16)", borderRadius: 24, background: "rgba(7,16,11,.78)", padding: "clamp(24px,5vw,54px)" }}>
        <p style={{ margin: "0 0 10px", color: "#8fd4a9", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>VIA</p>
        <h1 style={{ margin: 0, fontSize: "clamp(32px,6vw,62px)", lineHeight: 1 }}>{copy.title}</h1>
        <p style={{ margin: "18px 0 0", maxWidth: 720, color: "#b8c6bd", lineHeight: 1.7 }}>{copy.intro}</p>
        <p style={{ margin: "14px 0 0", maxWidth: 720, color: "#829087", lineHeight: 1.7, fontSize: 14 }}>{copy.safety}</p>
      </section>
    </main>
  )
}
