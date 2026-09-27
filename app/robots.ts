import type { MetadataRoute } from 'next'

// VIA public discovery — @OuwePiet 2026.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
  }
}
