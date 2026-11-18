import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VIA — DeSo social, creators & NFTs",
    short_name: "VIA",
    description: "Discover creators, posts, art, music, communities and NFTs on DeSo. Explore publicly and connect with your DeSo account. Install VIA on your home screen.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#000000",
    theme_color: "#050807",
    categories: ["social", "entertainment", "art"],
    // Approved VIA app artwork from 15 November 2026; keep the website logo separate.
    icons: [
      { src: "/via-app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/via-app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  }
}
