import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "De WereldSpiegel | VIA",
  description: "De WereldSpiegel: openbare wereldkrant van VIA, met nieuws uit controleerbare bronnen.",
  robots: { index: false, follow: false },
}
export default function WereldSpiegelLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children }
