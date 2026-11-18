import type { MetadataRoute } from 'next'
import { welcomeLocales } from './welcome/content'

const baseUrl = 'https://viadeso.online'

const publicRoutes: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/social', changeFrequency: 'daily', priority: 0.9 },
  { path: '/discover', changeFrequency: 'daily', priority: 0.9 },
  { path: '/collection', changeFrequency: 'daily', priority: 0.9 },
  { path: '/market', changeFrequency: 'daily', priority: 0.9 },
  { path: '/studio', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/live', changeFrequency: 'daily', priority: 0.8 },
  { path: '/communities', changeFrequency: 'daily', priority: 0.8 },
  { path: '/world', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/quest', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/news', changeFrequency: 'daily', priority: 0.7 },
  { path: '/events', changeFrequency: 'daily', priority: 0.7 },
  { path: '/read', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/show-your-stuff', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/public', changeFrequency: 'weekly', priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency,
    priority,
  }))
  const localized = welcomeLocales.map(locale => ({
    url: `${baseUrl}/welcome/${locale}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(welcomeLocales.map(lang => [lang, `${baseUrl}/welcome/${lang}`])),
    },
  }))
  return [...pages, ...localized]
}
