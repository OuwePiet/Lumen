import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './global.css'
import './visitor-account-access.css'
import RadioLocalizer from './radio/radio-localizer'
import ViaGlobalRadio from './via-global-radio'
import ViaHelpButton from './via-help-button'
import ViaPublicAccountGuard from './via-public-account-guard'
import ViaSiteHeader from './via-site-header'
import WalletLocalizer from './wallet/wallet-localizer'

const description =
  'VIA is an international DeSo platform for creators, collectors and communities: discover people, social posts, digital art, NFT collections, markets, live culture, games and world discovery.'

export const metadata: Metadata = {
  metadataBase: new URL('https://viadeso.online'),
  title: {
    default: 'VIA — DeSo social, creators & NFTs',
    template: '%s | VIA',
  },
  description,
  applicationName: 'VIA',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'VIA',
    statusBarStyle: 'black-translucent',
  },
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
    images: [{ url: '/via-logo-original.jpg', width: 1200, height: 630, alt: 'VIA on DeSo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIA — DeSo social, creators & NFTs',
    description,
    images: ['/via-logo-original.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon',
  },
}

const viaStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VIA',
  alternateName: 'VIA DeSo',
  url: 'https://viadeso.online/',
  description,
  inLanguage: ['en', 'nl', 'fr', 'es', 'zh'],
  publisher: {
    '@type': 'Organization',
    name: 'VIA',
    url: 'https://viadeso.online/',
    logo: 'https://viadeso.online/via-logo-original.jpg',
  },
  about: [
    { '@type': 'Thing', name: 'DeSo' },
    { '@type': 'Thing', name: 'NFTs' },
    { '@type': 'Thing', name: 'Digital art' },
    { '@type': 'Thing', name: 'Creator communities' },
  ],
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050807',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased via-session-pending">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(viaStructuredData) }} />
        <ViaPublicAccountGuard />
        <ViaSiteHeader />
        {children}
        <WalletLocalizer />
        <RadioLocalizer />
        <ViaGlobalRadio />
        <ViaHelpButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
