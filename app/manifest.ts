import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VIA - DeSo social, creators and NFTs",
    short_name: "VIA",
    description: "VIA on DeSo: social, creators, communities, digital culture and NFTs.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#000000",
    theme_color: "#050807",
    categories: ["social", "entertainment", "art"],
    icons: [
      { src: "/via-app-icon-approved-20261115-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/via-app-icon-approved-20261115-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  }
}
