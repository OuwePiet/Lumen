import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/my-via/'],
    },
    sitemap: 'https://viadeso.online/sitemap.xml',
    host: 'https://viadeso.online',
  }
}
