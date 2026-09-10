import type { MetadataRoute } from 'next'

const baseUrl = 'https://viadeso.online'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/social',
    '/discover',
    '/communities',
    '/studio',
    '/via-live',
    '/news',
  ]

  return routes.map((route, index) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: index === 0 ? 'daily' : 'weekly',
    priority: index === 0 ? 1 : 0.7,
  }))
}
