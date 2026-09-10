import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './global.css'

const description =
  'Discover VIA on DeSo: an international meeting place for creators, collectors, communities, social discovery, digital culture and NFTs.'

export const metadata: Metadata = {
  metadataBase: new URL('https://viadeso.online'),
  title: {
    default: 'VIA — DeSo social, creators & NFTs',
    template: '%s | VIA',
  },
  description,
  applicationName: 'VIA',
  keywords: [
    'VIA',
    'viadeso.online',
    'DeSo',
    'DeSo social',
    'DeSo NFT',
    'NFT',
    'creators',
    'collectors',
    'digital art',
    'communities',
    'digital culture',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VIA — DeSo social, creators & NFTs',
    description,
    url: '/',
    siteName: 'VIA',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'VIA — DeSo social, creators & NFTs',
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
