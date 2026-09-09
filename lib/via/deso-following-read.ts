import { fetchDeSo } from "../../app/deso-api"
import { readPublicPosts, type ViaPublicPost } from "./deso-post-read"
import { readPublicProfile } from "./deso-profile-read"

type DeSoUser = {
  PublicKeyBase58Check?: unknown
  PublicKeysBase58CheckFollowedByUser?: unknown
}

type DeSoUsersResponse = {
  UserList?: unknown
}

export type ViaFollowingPost = ViaPublicPost & {
  sourcePublicKey: string
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

/**
 * Build a small read-only Following view from public DeSo data.
 * No follow relationship is changed and no wallet/signing authority is requested.
 */
export async function readFollowingPosts(
  usernameOrPublicKey: string,
  creatorLimit = 12,
  postsPerCreator = 3,
): Promise<ViaFollowingPost[]> {
  const profile = await readPublicProfile(usernameOrPublicKey)
  if (!profile?.publicKey) return []

  const response = await fetchDeSo("get-users-stateless", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeysBase58Check: [profile.publicKey],
      SkipForLeaderboard: false,
      IncludeBalance: false,
      GetUnminedBalance: false,
    }),
  })

  if (!response.ok) return []

  const data = (await response.json()) as DeSoUsersResponse
  const userList = Array.isArray(data.UserList) ? (data.UserList as DeSoUser[]) : []
  const matchingUser = userList.find((user) => text(user.PublicKeyBase58Check) === profile.publicKey) ?? userList[0]
  if (!matchingUser) return []

  const followedKeys = stringArray(matchingUser.PublicKeysBase58CheckFollowedByUser)
    .filter((key) => key.startsWith("BC1"))
    .slice(0, Math.max(1, Math.min(20, creatorLimit)))

  const perCreator = Math.max(1, Math.min(5, postsPerCreator))
  const batches = await Promise.all(
    followedKeys.map(async (publicKey) => {
      const posts = await readPublicPosts(publicKey, perCreator)
      return posts.map((post) => ({ ...post, sourcePublicKey: publicKey }))
    }),
  )

  return batches
    .flat()
    .sort((a, b) => b.timestampNanos - a.timestampNanos)
    .slice(0, 30)
}
