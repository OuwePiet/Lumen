"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import SavedList from "./saved-list"
import DeSoSavedPosts from "./deso-saved-posts"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

const COPY: Record<ViaLanguage, { title: string; intro: string; privacyTitle: string; privacy: string; local: string; note: string }> = {
  English: {
    title: "Bookmarks", intro: "A calm place for posts you choose to save.",
    privacyTitle: "Your choice, not hidden profiling",
    privacy: "Only posts you choose to save appear here. DeSo bookmarks are public blockchain associations linked to your account; earlier local saves remain on this device. VIA does not use these for hidden profiling or paid ranking.",
    local: "Previously saved on this device",
    note: "Clearing this browser's data may remove local bookmarks. DeSo bookmarks can be viewed on other devices with the same DeSo account.",
  },
  Dutch: {
    title: "Bladwijzers", intro: "Een rustige plek voor berichten die je zelf bewaart.",
    privacyTitle: "Jouw keuze, geen verborgen profilering",
    privacy: "Alleen berichten die je zelf opslaat verschijnen hier. DeSo-bladwijzers zijn openbare blockchainkoppelingen aan je account; eerder lokaal opgeslagen berichten blijven op dit apparaat. VIA gebruikt dit niet voor verborgen profilering of betaalde rangschikking.",
    local: "Eerder lokaal opgeslagen",
    note: "Het wissen van browsergegevens kan lokale bladwijzers verwijderen. DeSo-bladwijzers zijn op andere apparaten zichtbaar met hetzelfde DeSo-account.",
  },
  French: {
    title: "Favoris", intro: "Un espace calme pour retrouver les publications que vous choisissez.",
    privacyTitle: "Votre choix, sans profilage caché",
    privacy: "Seules les publications que vous enregistrez apparaissent ici. Les favoris DeSo sont des associations publiques sur la blockchain liées à votre compte ; les anciens favoris locaux restent sur cet appareil. VIA ne les utilise ni pour le profilage caché ni pour un classement payant.",
    local: "Enregistrés auparavant sur cet appareil",
    note: "Effacer les données du navigateur peut supprimer les favoris locaux. Les favoris DeSo sont accessibles sur d'autres appareils avec le même compte DeSo.",
  },
  Spanish: {
    title: "Guardados", intro: "Un espacio tranquilo para encontrar las publicaciones que decides guardar.",
    privacyTitle: "Tu elección, sin perfiles ocultos",
    privacy: "Aquí solo aparecen las publicaciones que guardas. Los marcadores DeSo son asociaciones públicas en la cadena de bloques vinculadas a tu cuenta; los guardados locales anteriores permanecen en este dispositivo. VIA no los utiliza para crear perfiles ocultos ni para clasificaciones pagadas.",
    local: "Guardados anteriormente en este dispositivo",
    note: "Borrar los datos del navegador puede eliminar los guardados locales. Los marcadores DeSo se pueden consultar desde otros dispositivos con la misma cuenta DeSo.",
  },
  Chinese: {
    title: "书签", intro: "安静地收藏并找回你选择保存的帖子。",
    privacyTitle: "由你选择，不进行隐蔽画像",
    privacy: "这里只显示你主动保存的帖子。DeSo 书签是与你的账户关联的公开区块链关联记录；以前保存在本机的内容仍留在本设备上。VIA 不会将其用于隐蔽画像或付费排名。",
    local: "之前保存在本设备上的内容",
    note: "清除浏览器数据可能会删除本地书签。使用同一 DeSo 账户可在其他设备查看 DeSo 书签。",
  },
  Hindi: {
    title: "बुकमार्क", intro: "आपके चुने हुए सहेजे गए पोस्ट फिर से खोजने की एक शांत जगह।",
    privacyTitle: "आपकी पसंद, छिपी प्रोफ़ाइलिंग नहीं",
    privacy: "यहाँ केवल आपके चुने हुए पोस्ट दिखाई देते हैं। DeSo बुकमार्क आपके खाते से जुड़े सार्वजनिक ब्लॉकचेन रिकॉर्ड हैं; पहले के स्थानीय सेव इसी डिवाइस पर रहते हैं। VIA इनका उपयोग छिपी प्रोफ़ाइलिंग या भुगतान वाली रैंकिंग के लिए नहीं करता।",
    local: "इस डिवाइस पर पहले सहेजे गए",
    note: "ब्राउज़र डेटा मिटाने से स्थानीय बुकमार्क हट सकते हैं। उसी DeSo खाते से दूसरे डिवाइस पर DeSo बुकमार्क देखे जा सकते हैं।",
  },
}

export default function SavedPage() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const copy = COPY[language] ?? COPY.English

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8fd4a9]">VIA</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">{copy.intro}</p>
          </div>
          <Link href="/my-via" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-[#8fd4a9]/70 hover:text-[#9adbb2]">My VIA</Link>
        </header>
        <section className="mb-6 rounded-2xl border border-[#285f40]/70 bg-zinc-950 p-5">
          <h2 className="text-lg text-[#9adbb2]">{copy.privacyTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{copy.privacy}</p>
        </section>
        <DeSoSavedPosts />
        <h2 className="mb-3 text-lg font-semibold text-[#9adbb2]">{copy.local}</h2>
        <SavedList />
        <p className="mt-8 text-xs leading-5 text-zinc-600">{copy.note}</p>
      </div>
    </main>
  )
}
