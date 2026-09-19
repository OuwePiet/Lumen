import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VIA — DeSo social, creators & NFTs",
    short_name: "VIA",
    description: "VIA on DeSo: social, creators, communities, digital culture and NFTs.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#000000",
    theme_color: "#050807",
    categories: ["social", "entertainment", "art"],
    icons: [
      {
        src: "/via-watermark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/via-watermark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  }
}
