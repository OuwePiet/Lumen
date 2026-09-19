import type { MetadataRoute } from 'next'

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
  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency,
    priority,
  }))
}
