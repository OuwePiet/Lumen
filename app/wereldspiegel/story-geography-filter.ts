/** @OuwePiet 2026: verified article geography takes precedence over publisher scope. */
export type StoryGeography = { country: string; editorialCountry?: string; editorialRegion?: string };

export function matchesStoryCountry(story: StoryGeography, selected: string): boolean {
  return selected === "world" || (story.country ? story.country === selected : story.editorialCountry === selected);
}

export function matchesStoryRegion(story: StoryGeography, selected: string, continent: Record<string, string>): boolean {
  return selected === "Wereld" || ((!story.country && story.editorialRegion === selected) || continent[story.country || story.editorialCountry || ""] === selected);
}