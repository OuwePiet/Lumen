import { getFeaturedCities } from "../../../../lib/via/featured-cities"

export async function GET() {
  return Response.json(
    await getFeaturedCities(),
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=2678400, stale-while-revalidate=604800, stale-if-error=2592000",
      },
    },
  )
}
