import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { welcome, welcomeLanguageLinks, welcomeLocales, type WelcomeLocale } from "../content"

type Props = { params: Promise<{ locale: string }> }
const base = "https://viadeso.online"

export function generateStaticParams() {
  return welcomeLocales.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!welcomeLocales.includes(locale as WelcomeLocale)) return {}
  const copy = welcome[locale as WelcomeLocale]
  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: {
      canonical: `/welcome/${locale}`,
      languages: { ...welcomeLanguageLinks, "x-default": "/welcome/en" },
    },
    openGraph: { title: copy.title, description: copy.description, url: `/welcome/${locale}`, siteName: "VIA", type: "website" },
  }
}

export default async function ViaWelcome({ params }: Props) {
  const { locale } = await params
  if (!welcomeLocales.includes(locale as WelcomeLocale)) notFound()
  const copy = welcome[locale as WelcomeLocale]
  return (
    <main lang={locale} style={{ maxWidth: 740, margin: "0 auto", padding: "clamp(24px, 5vw, 56px) 20px", minHeight: "70vh" }}>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 750, lineHeight: 1.15 }}>{copy.heading}</h1>
      <p style={{ marginTop: 20, fontSize: 19, lineHeight: 1.65 }}>{copy.intro}</p>
      <p style={{ marginTop: 18, lineHeight: 1.7 }}>{copy.description}</p>
      <p style={{ marginTop: 18, lineHeight: 1.7 }}>{copy.install}</p>
      <p style={{ marginTop: 28 }}><Link href="/" style={{ textDecoration: "underline", fontWeight: 700 }}>{copy.action} — viadeso.online</Link></p>
      <nav aria-label="Language" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
        {welcomeLocales.map(code => <Link key={code} href={`/welcome/${code}`} hrefLang={code} lang={code} style={{ textDecoration: "underline" }}>{code.toUpperCase()}</Link>)}
      </nav>
    </main>
  )
}
