import type { Metadata } from "next"

// The current newspaper contains fictional demonstration stories.
// Keep both public preview routes out of search indexes until verified news is live.
export const metadata: Metadata = {
  title: "De WereldSpiegel — VIA leesproef",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function WereldSpiegelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
