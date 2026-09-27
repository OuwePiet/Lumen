import type { MetadataRoute } from 'next'

// VIA pre-release protection — @OuwePiet 2026.
// Keep public browsing available for invited testers, but do not invite search-engine indexing yet.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
