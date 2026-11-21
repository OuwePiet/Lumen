import { NextResponse } from "next/server"
import { APPROVED_NEWS_SOURCES } from "../../../wereldspiegel/source-security"
import { ingestApprovedJsonFeed } from "../../../wereldspiegel/feed-ingestion"
import { deduplicateStories } from "../../../wereldspiegel/story-validation"

// @OuwePiet 2026. Public, read-only and fail-closed. Never accept arbitrary source URLs.
export const dynamic = "force-dynamic"
export async function GET() {
  if (APPROVED_NEWS_SOURCES.length === 0) {
    return NextResponse.json({status:"awaiting-approved-sources",stories:[],sourceCount:0},
      {headers:{"Cache-Control":"public, max-age=0, s-maxage=300"}})
  }
  const results = await Promise.all(APPROVED_NEWS_SOURCES.slice(0,6).map(s=>ingestApprovedJsonFeed(s.id)))
  const stories = deduplicateStories(results.flatMap(result=>result.ok?result.stories:[])).slice(0,60)
  return NextResponse.json({status:stories.length?"ready":"no-verified-stories",stories,sourceCount:APPROVED_NEWS_SOURCES.length},
    {headers:{"Cache-Control":"public, max-age=0, s-maxage=300"}})
}